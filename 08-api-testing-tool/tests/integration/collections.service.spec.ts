import { CollectionsService } from '../../backend/src/modules/collections/collections.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { HttpMethod } from '@prisma/client';

describe('CollectionsService (Integration)', () => {
  let service: CollectionsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new CollectionsService(prisma as any);
  });

  it('creates collection under workspace', async () => {
    const mockCreated = {
      id: 'col-1',
      name: 'Auth APIs',
      description: 'Login and token endpoints',
      workspaceId: 'ws-100',
    };
    prisma.collection.create.mockResolvedValue(mockCreated);

    const res = await service.createCollection(
      { name: 'Auth APIs', description: 'Login and token endpoints' },
      'ws-100',
    );

    expect(prisma.collection.create).toHaveBeenCalledWith({
      data: {
        name: 'Auth APIs',
        description: 'Login and token endpoints',
        parentId: null,
        workspaceId: 'ws-100',
      },
    });
    expect(res).toEqual(mockCreated);
  });

  it('saves request to collection', async () => {
    const mockRequest = {
      id: 'req-1',
      name: 'Get Current Profile',
      method: HttpMethod.GET,
      url: '{{baseUrl}}/auth/me',
      collectionId: 'col-1',
      workspaceId: 'ws-100',
    };
    prisma.savedRequest.create.mockResolvedValue(mockRequest);

    const res = await service.saveRequest(
      {
        name: 'Get Current Profile',
        method: HttpMethod.GET,
        url: '{{baseUrl}}/auth/me',
        collectionId: 'col-1',
      },
      'ws-100',
    );

    expect(prisma.savedRequest.create).toHaveBeenCalled();
    expect(res.id).toBe('req-1');
  });

  it('exports collections with nested requests', async () => {
    const mockCollections = [
      {
        id: 'col-1',
        name: 'Billing API',
        requests: [{ name: 'Create Invoice', method: 'POST', url: '/invoices' }],
      },
    ];
    prisma.collection.findMany.mockResolvedValue(mockCollections);

    const exportBundle = await service.exportCollections('ws-100');
    expect(exportBundle.version).toBe('1.0');
    expect(exportBundle.collections).toHaveLength(1);
    expect(exportBundle.collections[0].name).toBe('Billing API');
  });

  it('imports collection schema correctly', async () => {
    prisma.collection.create.mockResolvedValue({ id: 'imported-col-1' });
    prisma.savedRequest.create.mockResolvedValue({ id: 'imported-req-1' });

    const importPayload = {
      collections: [
        {
          name: 'Payment Webhooks',
          requests: [{ name: 'Stripe Hook', method: 'POST', url: '/webhook' }],
        },
      ],
    };

    const res = await service.importCollections(importPayload, 'ws-100');
    expect(res.importedCount).toBe(1);
    expect(prisma.collection.create).toHaveBeenCalled();
    expect(prisma.savedRequest.create).toHaveBeenCalled();
  });
});
