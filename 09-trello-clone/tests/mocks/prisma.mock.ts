export const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  workspace: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  board: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  boardMember: {
    findMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  list: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  card: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  checklist: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  checklistItem: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    create: jest.fn(),
  },
  activity: {
    create: jest.fn(),
    createMany: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});
