import { ProxyService } from '../../backend/src/modules/proxy/proxy.service';

describe('Variable Interpolation Engine (Unit)', () => {
  let proxyService: ProxyService;

  beforeEach(() => {
    proxyService = new ProxyService(null as any, { get: () => true } as any);
  });

  it('should substitute single {{variable}} in URL', () => {
    const raw = '{{baseUrl}}/users';
    const vars = { baseUrl: 'https://api.example.com' };
    const res = proxyService.interpolateVariables(raw, vars);
    expect(res).toBe('https://api.example.com/users');
  });

  it('should substitute multiple variables with whitespace variations', () => {
    const raw = '{{ host }}:{{ port }}/api/{{apiVersion}}/users';
    const vars = {
      host: 'http://127.0.0.1',
      port: '8080',
      apiVersion: 'v2',
    };
    const res = proxyService.interpolateVariables(raw, vars);
    expect(res).toBe('http://127.0.0.1:8080/api/v2/users');
  });

  it('should leave unknown variable tokens untouched', () => {
    const raw = 'https://api.com/users/{{unknownVar}}';
    const vars = { otherVar: '123' };
    const res = proxyService.interpolateVariables(raw, vars);
    expect(res).toBe('https://api.com/users/{{unknownVar}}');
  });

  it('should handle non-string or empty inputs gracefully', () => {
    expect(proxyService.interpolateVariables('', {})).toBe('');
    expect(proxyService.interpolateVariables(null as any, {})).toBeNull();
    expect(proxyService.interpolateVariables(undefined as any, {})).toBeUndefined();
  });
});
