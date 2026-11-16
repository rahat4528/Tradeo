import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URL } from 'url';
import * as net from 'net';
import { PrismaService } from '../../database/prisma.service';
import { DispatchRequestDto, AssertionRuleDto, KeyValueEntryDto } from './dto/dispatch-request.dto';
import { AuthType } from '@prisma/client';

export interface AssertionResult {
  type: string;
  target: string;
  passed: boolean;
  message: string;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  validateSsrf(urlString: string, allowLocal: boolean) {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      throw new BadRequestException(`Invalid destination URL: ${urlString}`);
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException(`Protocol '${parsed.protocol}' is unsupported. Only http and https are allowed.`);
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check dangerous cloud metadata endpoints unconditionally
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal' || hostname === 'instance-data') {
      throw new ForbiddenException('SSRF Guard: Cloud metadata service targets are forbidden.');
    }

    if (!allowLocal) {
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname === '0.0.0.0'
      ) {
        throw new ForbiddenException('SSRF Guard: Access to loopback / localhost addresses is forbidden in restricted mode.');
      }

      if (net.isIP(hostname)) {
        if (this.isPrivateIp(hostname)) {
          throw new ForbiddenException(`SSRF Guard: Target private IP address ${hostname} is forbidden.`);
        }
      }
    }
  }

  private isPrivateIp(ip: string): boolean {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4) return false;

    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (Link Local)
    if (parts[0] === 169 && parts[1] === 254) return true;

    return false;
  }

  interpolateVariables(text: string, variables: Record<string, string>): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_, key) => {
      return variables[key] !== undefined ? variables[key] : `{{${key}}}`;
    });
  }

  async dispatch(dto: DispatchRequestDto, workspaceId: string) {
    const allowLocal = this.configService.get<boolean>('proxy.allowLocalDispatch', true);

    // 1. Resolve Environment Variables
    const variablesMap: Record<string, string> = {};
    if (dto.environmentId) {
      const env = await this.prisma.environment.findFirst({
        where: { id: dto.environmentId, workspaceId },
      });
      if (env && Array.isArray(env.variables)) {
        for (const v of env.variables as any[]) {
          if (v && v.key) {
            variablesMap[v.key] = v.value || '';
          }
        }
      }
    }

    // 2. Interpolate URL
    let targetUrl = this.interpolateVariables(dto.url, variablesMap);
    this.validateSsrf(targetUrl, allowLocal);

    // 3. Assemble Query Params
    const queryParams: Record<string, string> = {};
    if (Array.isArray(dto.params)) {
      for (const item of dto.params) {
        if (item.enabled !== false && item.key) {
          queryParams[item.key] = this.interpolateVariables(item.value, variablesMap);
        }
      }
    } else if (dto.params && typeof dto.params === 'object') {
      for (const [k, v] of Object.entries(dto.params)) {
        queryParams[k] = this.interpolateVariables(v, variablesMap);
      }
    }

    // 4. Assemble Headers
    const headersMap: Record<string, string> = {};
    if (Array.isArray(dto.headers)) {
      for (const item of dto.headers) {
        if (item.enabled !== false && item.key) {
          headersMap[item.key] = this.interpolateVariables(item.value, variablesMap);
        }
      }
    } else if (dto.headers && typeof dto.headers === 'object') {
      for (const [k, v] of Object.entries(dto.headers)) {
        headersMap[k] = this.interpolateVariables(v, variablesMap);
      }
    }

    // 5. Auth Strategy
    if (dto.authType === AuthType.BEARER && dto.authConfig?.token) {
      const token = this.interpolateVariables(dto.authConfig.token, variablesMap);
      headersMap['Authorization'] = `Bearer ${token}`;
    } else if (dto.authType === AuthType.BASIC && dto.authConfig?.username) {
      const user = this.interpolateVariables(dto.authConfig.username, variablesMap);
      const pass = this.interpolateVariables(dto.authConfig.password || '', variablesMap);
      const b64 = Buffer.from(`${user}:${pass}`).toString('base64');
      headersMap['Authorization'] = `Basic ${b64}`;
    } else if (dto.authType === AuthType.API_KEY && dto.authConfig?.key && dto.authConfig?.value) {
      const k = this.interpolateVariables(dto.authConfig.key, variablesMap);
      const v = this.interpolateVariables(dto.authConfig.value, variablesMap);
      if (dto.authConfig.addTo === 'QUERY') {
        queryParams[k] = v;
      } else {
        headersMap[k] = v;
      }
    }

    // 6. Assemble Request Body
    let bodyData: any = undefined;
    if (dto.body) {
      const interpolatedBody = this.interpolateVariables(dto.body, variablesMap);
      if (dto.bodyType === 'JSON') {
        try {
          bodyData = JSON.parse(interpolatedBody);
          if (!headersMap['Content-Type'] && !headersMap['content-type']) {
            headersMap['Content-Type'] = 'application/json';
          }
        } catch {
          bodyData = interpolatedBody;
        }
      } else {
        bodyData = interpolatedBody;
      }
    }

    // 7. Dispatch HTTP request with precision timing
    const timeout = this.configService.get<number>('proxy.dispatchTimeoutMs', 15000);
    const startTime = Date.now();
    let responseStatus = 0;
    let responseStatusText = '';
    let responseHeaders: Record<string, string> = {};
    let responseData: any = null;
    let timeMs = 0;
    let sizeBytes = 0;

    const axiosConfig: AxiosRequestConfig = {
      method: dto.method as any,
      url: targetUrl,
      params: queryParams,
      headers: headersMap,
      data: bodyData,
      timeout,
      validateStatus: () => true, // Don't throw for 4xx/5xx so we capture full API inspection details
      responseType: 'text',
      transformResponse: [(data) => data],
    };

    try {
      const res: AxiosResponse = await axios(axiosConfig);
      timeMs = Date.now() - startTime;
      responseStatus = res.status;
      responseStatusText = res.statusText || 'OK';
      responseHeaders = (res.headers as Record<string, string>) || {};

      const rawText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      sizeBytes = Buffer.byteLength(rawText || '', 'utf8');

      try {
        responseData = JSON.parse(rawText);
      } catch {
        responseData = rawText;
      }
    } catch (err: any) {
      timeMs = Date.now() - startTime;
      responseStatus = err.response?.status || 500;
      responseStatusText = err.response?.statusText || err.code || 'Network Error';
      responseHeaders = err.response?.headers || {};
      responseData = err.response?.data || { error: err.message || 'Dispatch failure' };
      sizeBytes = Buffer.byteLength(JSON.stringify(responseData), 'utf8');
    }

    // 8. Evaluate Assertions
    const assertionsResult: AssertionResult[] = [];
    if (Array.isArray(dto.assertions)) {
      for (const rule of dto.assertions) {
        const result = this.evaluateAssertion(rule, {
          status: responseStatus,
          timeMs,
          data: responseData,
          headers: responseHeaders,
        });
        assertionsResult.push(result);
      }
    }

    // 9. Persist History Log
    const historyEntry = await this.prisma.requestHistory.create({
      data: {
        method: dto.method,
        url: targetUrl,
        headers: headersMap,
        params: queryParams,
        body: dto.body || null,
        responseStatus,
        responseStatusText,
        responseTimeMs: timeMs,
        responseSizeBytes: sizeBytes,
        responseHeaders,
        responseBody: typeof responseData === 'object' ? JSON.stringify(responseData) : String(responseData),
        assertionsResult: assertionsResult as any,
        workspaceId,
      },
    });

    return {
      status: responseStatus,
      statusText: responseStatusText,
      timeMs,
      sizeBytes,
      headers: responseHeaders,
      data: responseData,
      assertions: assertionsResult,
      historyId: historyEntry.id,
    };
  }

  evaluateAssertion(
    rule: AssertionRuleDto,
    context: { status: number; timeMs: number; data: any; headers: Record<string, string> },
  ): AssertionResult {
    switch (rule.type) {
      case 'STATUS_EQUALS': {
        const expected = parseInt(rule.target, 10);
        const passed = context.status === expected;
        return {
          type: rule.type,
          target: rule.target,
          passed,
          message: passed
            ? `Status code is ${expected}`
            : `Expected status ${expected}, but got ${context.status}`,
        };
      }
      case 'RESPONSE_TIME_LT': {
        const maxTime = parseInt(rule.target, 10);
        const passed = context.timeMs < maxTime;
        return {
          type: rule.type,
          target: rule.target,
          passed,
          message: passed
            ? `Response time ${context.timeMs}ms is under ${maxTime}ms`
            : `Response time ${context.timeMs}ms exceeded threshold of ${maxTime}ms`,
        };
      }
      case 'JSON_BODY_CONTAINS': {
        const stringified = typeof context.data === 'string' ? context.data : JSON.stringify(context.data || {});
        const passed = stringified.toLowerCase().includes(rule.target.toLowerCase());
        return {
          type: rule.type,
          target: rule.target,
          passed,
          message: passed
            ? `Response body contains "${rule.target}"`
            : `Response body does not contain "${rule.target}"`,
        };
      }
      case 'HEADER_EQUALS': {
        const [headerName, expectedValue] = rule.target.split(':').map((s) => s.trim().toLowerCase());
        const actualValue = (context.headers[headerName] || '').toLowerCase();
        const passed = actualValue === expectedValue;
        return {
          type: rule.type,
          target: rule.target,
          passed,
          message: passed
            ? `Header "${headerName}" equals "${expectedValue}"`
            : `Header "${headerName}" is "${actualValue}", expected "${expectedValue}"`,
        };
      }
      default:
        return {
          type: rule.type,
          target: rule.target,
          passed: false,
          message: `Unknown assertion type "${rule.type}"`,
        };
    }
  }
}
