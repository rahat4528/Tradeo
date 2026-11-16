export const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  service: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  metricSnapshot: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  alertRule: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  incident: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  deployment: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  logEntry: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
});
