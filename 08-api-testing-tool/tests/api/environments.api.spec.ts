import { EnvironmentsService } from '../../backend/src/modules/environments/environments.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('Environments API (Contract)', () => {
  let service: EnvironmentsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new EnvironmentsService(prisma as any);
  });

  it('lists environments for workspace', async () => {
    const list = [
      { id: 'env-1', name: 'Dev', workspaceId: 'ws-1' },
      { id: 'env-2', name: 'Prod', workspaceId: 'ws-1' },
    ];
    prisma.environment.findMany.mockResolvedValue(list);

    const res = await service.listEnvironments('ws-1');
    expect(res).toHaveLength(2);
    expect(prisma.environment.findMany).toHaveBeenCalledWith({
      where: { workspaceId: 'ws-1' },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('unsets previous default environment when setting new default', async () => {
    prisma.environment.updateMany.mockResolvedValue({ count: 1 });
    prisma.environment.create.mockResolvedValue({
      id: 'env-3',
      name: 'Production',
      isDefault: true,
      workspaceId: 'ws-1',
    });

    const res = await service.createEnvironment(
      {
        name: 'Production',
        isDefault: true,
        variables: [{ key: 'apiUrl', value: 'https://prod.api.com', isSecret: false }],
      },
      'ws-1',
    );

    expect(prisma.environment.updateMany).toHaveBeenCalledWith({
      where: { workspaceId: 'ws-1', isDefault: true },
      data: { isDefault: false },
    });
    expect(res.isDefault).toBe(true);
  });

  it('deletes environment successfully', async () => {
    prisma.environment.findFirst.mockResolvedValue({ id: 'env-del', workspaceId: 'ws-1' });
    prisma.environment.delete.mockResolvedValue({ id: 'env-del' });

    await service.deleteEnvironment('env-del', 'ws-1');
    expect(prisma.environment.delete).toHaveBeenCalledWith({ where: { id: 'env-del' } });
  });
});
