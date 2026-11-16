import { ProxyService } from '../../backend/src/modules/proxy/proxy.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('SSRF Protection Guard (Security)', () => {
  let proxyService: ProxyService;

  beforeEach(() => {
    proxyService = new ProxyService(null as any, { get: () => false } as any);
  });

  it('rejects unsupported protocols like file:// or ftp://', () => {
    expect(() => proxyService.validateSsrf('file:///etc/passwd', true)).toThrow(BadRequestException);
    expect(() => proxyService.validateSsrf('ftp://server.local', true)).toThrow(BadRequestException);
  });

  it('blocks cloud metadata endpoints unconditionally', () => {
    expect(() => proxyService.validateSsrf('http://169.254.169.254/latest/meta-data/', true)).toThrow(
      ForbiddenException,
    );
    expect(() => proxyService.validateSsrf('http://metadata.google.internal/computeMetadata/v1/', true)).toThrow(
      ForbiddenException,
    );
  });

  it('blocks loopback and localhost in restricted mode', () => {
    expect(() => proxyService.validateSsrf('http://localhost:3000/admin', false)).toThrow(
      ForbiddenException,
    );
    expect(() => proxyService.validateSsrf('http://127.0.0.1:8080/metrics', false)).toThrow(
      ForbiddenException,
    );
    expect(() => proxyService.validateSsrf('http://0.0.0.0:4000', false)).toThrow(
      ForbiddenException,
    );
  });

  it('blocks private network IP ranges (RFC 1918) in restricted mode', () => {
    // 10.0.0.0/8
    expect(() => proxyService.validateSsrf('http://10.200.1.5/api', false)).toThrow(ForbiddenException);
    // 172.16.0.0/12
    expect(() => proxyService.validateSsrf('http://172.20.10.15/dashboard', false)).toThrow(ForbiddenException);
    // 192.168.0.0/16
    expect(() => proxyService.validateSsrf('http://192.168.1.1/setup', false)).toThrow(ForbiddenException);
  });

  it('permits legitimate public endpoints in restricted mode', () => {
    expect(() => proxyService.validateSsrf('https://api.github.com/zen', false)).not.toThrow();
    expect(() => proxyService.validateSsrf('https://httpbin.org/get', false)).not.toThrow();
  });
});
