import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@Injectable()
export class SnippetsService {
  constructor(private prisma: PrismaService) {}

  async createSnippet(dto: CreateSnippetDto, userId: string) {
    if (dto.folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: dto.folderId, userId },
      });
      if (!folder) {
        throw new BadRequestException('Folder not found in your workspace.');
      }
    }

    const snippet = await this.prisma.snippet.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        language: (dto.language || 'typescript').toLowerCase().trim(),
        code: dto.code,
        isFavorite: dto.isFavorite || false,
        isPublic: dto.isPublic || false,
        folderId: dto.folderId || null,
        userId,
      },
    });

    // Handle tags
    if (dto.tags && dto.tags.length > 0) {
      await this.syncTags(snippet.id, dto.tags, userId);
    }

    // Create initial revision snapshot (v1)
    await this.prisma.snippetVersion.create({
      data: {
        snippetId: snippet.id,
        versionNumber: 1,
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
        summary: 'Initial creation',
      },
    });

    return this.getSnippetById(snippet.id, userId);
  }

  async getSnippets(
    userId: string,
    query: {
      search?: string;
      language?: string;
      folderId?: string;
      tag?: string;
      isFavorite?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
    },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.isFavorite !== undefined) {
      where.isFavorite = query.isFavorite;
    }

    if (query.language && query.language.trim() !== '') {
      where.language = query.language.toLowerCase().trim();
    }

    if (query.folderId) {
      if (query.folderId === 'root') {
        where.folderId = null;
      } else {
        where.folderId = query.folderId;
      }
    }

    if (query.tag && query.tag.trim() !== '') {
      where.tags = {
        some: {
          tag: {
            name: query.tag.toLowerCase().trim(),
          },
        },
      };
    }

    if (query.search && query.search.trim() !== '') {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { code: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    const sortField = query.sortBy || 'updatedAt';
    orderBy[sortField] = query.order === 'asc' ? 'asc' : 'desc';

    const [snippets, total] = await Promise.all([
      this.prisma.snippet.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          folder: {
            select: { id: true, name: true },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { versions: true },
          },
        },
      }),
      this.prisma.snippet.count({ where }),
    ]);

    return {
      data: snippets.map((s) => this.formatSnippet(s)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSnippetById(id: string, userId?: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id },
      include: {
        folder: {
          select: { id: true, name: true },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { versions: true },
        },
      },
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found.');
    }

    if (snippet.userId !== userId && !snippet.isPublic) {
      throw new ForbiddenException('You do not have permission to view this private snippet.');
    }

    return this.formatSnippet(snippet);
  }

  async updateSnippet(id: string, dto: UpdateSnippetDto, userId: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found.');
    }

    if (snippet.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this snippet.');
    }

    if (dto.folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: dto.folderId, userId },
      });
      if (!folder) {
        throw new BadRequestException('Folder not found in your workspace.');
      }
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.language !== undefined) data.language = dto.language.toLowerCase().trim();
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.isFavorite !== undefined) data.isFavorite = dto.isFavorite;
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic;
    if (dto.folderId !== undefined) data.folderId = dto.folderId;

    // Check if code or language changed to record revision
    const codeChanged = dto.code !== undefined && dto.code !== snippet.code;
    const titleChanged = dto.title !== undefined && dto.title !== snippet.title;

    if (codeChanged || titleChanged) {
      const latestVersionNumber = snippet.versions[0]?.versionNumber || 1;
      await this.prisma.snippetVersion.create({
        data: {
          snippetId: snippet.id,
          versionNumber: latestVersionNumber + 1,
          title: dto.title || snippet.title,
          language: dto.language || snippet.language,
          code: dto.code || snippet.code,
          summary: dto.versionSummary || 'Updated code content',
        },
      });
    }

    await this.prisma.snippet.update({
      where: { id },
      data,
    });

    if (dto.tags !== undefined) {
      await this.syncTags(id, dto.tags, userId);
    }

    return this.getSnippetById(id, userId);
  }

  async deleteSnippet(id: string, userId: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id },
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found.');
    }

    if (snippet.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this snippet.');
    }

    await this.prisma.snippet.delete({
      where: { id },
    });

    return { message: 'Snippet deleted successfully.', id };
  }

  async getVersionHistory(snippetId: string, userId: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found.');
    }

    if (snippet.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    return this.prisma.snippetVersion.findMany({
      where: { snippetId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async rollbackVersion(snippetId: string, versionId: string, userId: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id: snippetId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!snippet) throw new NotFoundException('Snippet not found.');
    if (snippet.userId !== userId) throw new ForbiddenException('Access denied.');

    const targetVersion = await this.prisma.snippetVersion.findUnique({
      where: { id: versionId },
    });

    if (!targetVersion || targetVersion.snippetId !== snippetId) {
      throw new NotFoundException('Version snapshot not found.');
    }

    const currentLatest = snippet.versions[0]?.versionNumber || 1;

    // Create a new version marking the rollback
    await this.prisma.snippetVersion.create({
      data: {
        snippetId,
        versionNumber: currentLatest + 1,
        title: targetVersion.title,
        language: targetVersion.language,
        code: targetVersion.code,
        summary: `Rolled back to revision #${targetVersion.versionNumber}`,
      },
    });

    await this.prisma.snippet.update({
      where: { id: snippetId },
      data: {
        title: targetVersion.title,
        language: targetVersion.language,
        code: targetVersion.code,
      },
    });

    return this.getSnippetById(snippetId, userId);
  }

  private async syncTags(snippetId: string, tagNames: string[], userId: string) {
    // Remove existing
    await this.prisma.snippetTag.deleteMany({
      where: { snippetId },
    });

    for (const rawName of tagNames) {
      const clean = rawName.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
      if (!clean) continue;

      let tag = await this.prisma.tag.findUnique({
        where: { userId_name: { userId, name: clean } },
      });

      if (!tag) {
        tag = await this.prisma.tag.create({
          data: { name: clean, userId },
        });
      }

      await this.prisma.snippetTag.create({
        data: {
          snippetId,
          tagId: tag.id,
        },
      });
    }
  }

  private formatSnippet(snippet: any) {
    return {
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      code: snippet.code,
      isFavorite: snippet.isFavorite,
      isPublic: snippet.isPublic,
      folderId: snippet.folderId,
      folder: snippet.folder ? { id: snippet.folder.id, name: snippet.folder.name } : null,
      tags: snippet.tags ? snippet.tags.map((st: any) => st.tag.name) : [],
      versionCount: snippet._count?.versions || 1,
      userId: snippet.userId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    };
  }
}
