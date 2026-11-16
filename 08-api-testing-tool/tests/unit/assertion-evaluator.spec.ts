import { ProxyService } from '../../backend/src/modules/proxy/proxy.service';

describe('Assertion Evaluator (Unit)', () => {
  let proxyService: ProxyService;

  beforeEach(() => {
    proxyService = new ProxyService(null as any, { get: () => true } as any);
  });

  const mockContext = {
    status: 200,
    timeMs: 145,
    data: { message: 'success', userId: 42, details: { active: true } },
    headers: { 'content-type': 'application/json; charset=utf-8', 'x-request-id': 'req-987' },
  };

  it('evaluates STATUS_EQUALS correctly', () => {
    const pass = proxyService.evaluateAssertion(
      { type: 'STATUS_EQUALS', target: '200' },
      mockContext,
    );
    expect(pass.passed).toBe(true);

    const fail = proxyService.evaluateAssertion(
      { type: 'STATUS_EQUALS', target: '404' },
      mockContext,
    );
    expect(fail.passed).toBe(false);
    expect(fail.message).toContain('Expected status 404, but got 200');
  });

  it('evaluates RESPONSE_TIME_LT correctly', () => {
    const pass = proxyService.evaluateAssertion(
      { type: 'RESPONSE_TIME_LT', target: '200' },
      mockContext,
    );
    expect(pass.passed).toBe(true);

    const fail = proxyService.evaluateAssertion(
      { type: 'RESPONSE_TIME_LT', target: '100' },
      mockContext,
    );
    expect(fail.passed).toBe(false);
    expect(fail.message).toContain('exceeded threshold of 100ms');
  });

  it('evaluates JSON_BODY_CONTAINS correctly', () => {
    const pass = proxyService.evaluateAssertion(
      { type: 'JSON_BODY_CONTAINS', target: 'success' },
      mockContext,
    );
    expect(pass.passed).toBe(true);

    const fail = proxyService.evaluateAssertion(
      { type: 'JSON_BODY_CONTAINS', target: 'nonexistent_key_or_value' },
      mockContext,
    );
    expect(fail.passed).toBe(false);
  });

  it('evaluates HEADER_EQUALS correctly', () => {
    const pass = proxyService.evaluateAssertion(
      { type: 'HEADER_EQUALS', target: 'x-request-id: req-987' },
      mockContext,
    );
    expect(pass.passed).toBe(true);

    const fail = proxyService.evaluateAssertion(
      { type: 'HEADER_EQUALS', target: 'x-request-id: other-id' },
      mockContext,
    );
    expect(fail.passed).toBe(false);
  });
});
