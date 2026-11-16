import { ProxyService } from '../../backend/src/modules/proxy/proxy.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { HttpMethod, AuthType } from '@prisma/client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Proxy Dispatch Engine (Integration)', () => {
  let proxyService: ProxyService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    const mockConfig = {
      get: jest.fn((key: string, defVal: any) => {
        if (key === 'proxy.allowLocalDispatch') return true;
        if (key === 'proxy.dispatchTimeoutMs') return 5000;
        return defVal;
      }),
    };
    proxyService = new ProxyService(prisma as any, mockConfig as any);
  });

  it('interpolates variables and dispatches HTTP request', async () => {
    prisma.environment.findFirst.mockResolvedValue({
      id: 'env-1',
      name: 'Staging',
      workspaceId: 'ws-1',
      variables: [{ key: 'baseUrl', value: 'https://api.staging.io' }],
    });

    (mockedAxios as any).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { status: 'healthy', version: '1.4.0' },
    });

    prisma.requestHistory.create.mockResolvedValue({
      id: 'hist-1',
    });

    const res = await proxyService.dispatch(
      {
        method: HttpMethod.GET,
        url: '{{baseUrl}}/health',
        environmentId: 'env-1',
        assertions: [{ type: 'STATUS_EQUALS', target: '200' }],
      },
      'ws-1',
    );

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: 'healthy', version: '1.4.0' });
    expect(res.assertions).toHaveLength(1);
    expect(res.assertions[0].passed).toBe(true);
    expect(prisma.requestHistory.create).toHaveBeenCalled();
  });

  it('injects Bearer auth header into dispatched request', async () => {
    (mockedAxios as any).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { authenticated: true },
    });

    prisma.requestHistory.create.mockResolvedValue({ id: 'hist-2' });

    await proxyService.dispatch(
      {
        method: HttpMethod.GET,
        url: 'https://api.example.com/protected',
        authType: AuthType.BEARER,
        authConfig: { token: 'jwt-access-token-xyz' },
      },
      'ws-1',
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-access-token-xyz',
        }),
      }),
    );
  });
});
