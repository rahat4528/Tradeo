import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async createFolder(dto: CreateFolderDto, userId: string) {
    if (dto.parentId) {
      const parent = await this.prisma.folder.findFirst({
        where: { id: dto.parentId, userId },
      });
      if (!parent) {
        throw new BadRequestException('Parent folder not found in your workspace.');
      }
    }

    return this.prisma.folder.create({
      data: {
        name: dto.name.trim(),
        parentId: dto.parentId || null,
        userId,
      },
      include: {
        _count: {
          select: { snippets: true, children: true },
        },
      },
    });
  }

  async getUserFolders(userId: string) {
    return this.prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { snippets: true, children: true },
        },
      },
    });
  }

  async updateFolder(id: string, dto: UpdateFolderDto, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found.');
    }

    if (folder.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this folder.');
    }

    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('A folder cannot be its own parent.');
    }

    const data: any = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.parentId !== undefined) data.parentId = dto.parentId;

    return this.prisma.folder.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { snippets: true, children: true },
        },
      },
    });
  }

  async deleteFolder(id: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found.');
    }

    if (folder.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this folder.');
    }

    // Snippets in this folder are set to root (folderId = null) automatically via onDelete: SetNull
    await this.prisma.folder.delete({
      where: { id },
    });

    return { message: 'Folder deleted successfully.', id };
  }
}
