import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AbuseService {
  private readonly blockedProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  private readonly blockedDomains = [
    'malware.test',
    'phishing.example',
    'exploit.biz',
    'badsite.ru',
    'spam-tracker.xyz',
  ];

  constructor(private configService: ConfigService) {}

  validateTargetUrl(targetUrl: string): string {
    if (!targetUrl || typeof targetUrl !== 'string') {
      throw new BadRequestException('Target URL is required and must be a string.');
    }

    const trimmed = targetUrl.trim();

    // Check blocked protocols
    const lower = trimmed.toLowerCase();
    for (const proto of this.blockedProtocols) {
      if (lower.startsWith(proto)) {
        throw new BadRequestException(`Protocol '${proto}' is not permitted for security reasons.`);
      }
    }

    // Must be valid URL
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException('Target URL must be a valid, well-formed URL (e.g. https://example.com).');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException('Only HTTP and HTTPS URLs are allowed.');
    }

    // Check loop / self-reference prevention
    const appBaseUrl = this.configService.get<string>('appBaseUrl', 'http://localhost:4000');
    let appHost = 'localhost';
    try {
      appHost = new URL(appBaseUrl).hostname.toLowerCase();
    } catch {}

    if (parsed.hostname.toLowerCase() === appHost) {
      throw new BadRequestException('Target URL cannot point to the link shortener domain itself (loop prevention).');
    }

    // Check blocklist
    if (this.blockedDomains.some((d) => parsed.hostname.toLowerCase().includes(d))) {
      throw new BadRequestException('The requested domain is flagged on security blocklists.');
    }

    return trimmed;
  }

  validateCustomAlias(alias?: string): string | null {
    if (!alias) return null;
    const clean = alias.trim();
    if (clean.length < 3 || clean.length > 50) {
      throw new BadRequestException('Custom alias must be between 3 and 50 characters.');
    }

    const aliasRegex = /^[a-zA-Z0-9-_]+$/;
    if (!aliasRegex.test(clean)) {
      throw new BadRequestException('Custom alias may only contain letters, numbers, hyphens, and underscores.');
    }

    const reserved = ['api', 'auth', 'r', 'qr', 'admin', 'dashboard', 'login', 'register', 'settings', 'health', 'docs'];
    if (reserved.includes(clean.toLowerCase())) {
      throw new BadRequestException(`The alias '${clean}' is a reserved system path.`);
    }

    return clean;
  }
}
