import { FoldersService } from '../../backend/src/modules/folders/folders.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FoldersService (Integration Tests)', () => {
  let foldersService: FoldersService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    foldersService = new FoldersService(prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should create a root folder and a nested subfolder', async () => {
    const userId = 'user-f';
    const parent = await foldersService.createFolder({ name: 'Backend' }, userId);
    expect(parent.name).toBe('Backend');
    expect(parent.parentId).toBeNull();

    const child = await foldersService.createFolder(
      { name: 'Controllers', parentId: parent.id },
      userId,
    );
    expect(child.name).toBe('Controllers');
    expect(child.parentId).toBe(parent.id);
  });

  it('should prevent setting a folder as its own parent', async () => {
    const userId = 'user-f-loop';
    const folder = await foldersService.createFolder({ name: 'Utilities' }, userId);

    await expect(
      foldersService.updateFolder(folder.id, { parentId: folder.id }, userId),
    ).rejects.toThrow(BadRequestException);
  });

  it('should list all user folders with hierarchy counts', async () => {
    const userId = 'user-f-list';
    await foldersService.createFolder({ name: 'Folder A' }, userId);
    await foldersService.createFolder({ name: 'Folder B' }, userId);

    const list = await foldersService.getUserFolders(userId);
    expect(list.length).toBe(2);
  });

  it('should delete a folder successfully', async () => {
    const userId = 'user-f-del';
    const folder = await foldersService.createFolder({ name: 'Obsolete' }, userId);

    const res = await foldersService.deleteFolder(folder.id, userId);
    expect(res.id).toBe(folder.id);

    const list = await foldersService.getUserFolders(userId);
    expect(list.length).toBe(0);
  });
});
