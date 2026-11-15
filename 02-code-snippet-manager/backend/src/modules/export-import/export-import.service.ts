import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExportImportService {
  constructor(private prisma: PrismaService) {}

  async exportAll(userId: string) {
    const [snippets, folders, tags] = await Promise.all([
      this.prisma.snippet.findMany({
        where: { userId },
        include: {
          folder: { select: { name: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.folder.findMany({
        where: { userId },
        select: { id: true, name: true, parentId: true },
      }),
      this.prisma.tag.findMany({
        where: { userId },
        select: { name: true },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      folders,
      tags: tags.map((t) => t.name),
      snippets: snippets.map((s) => ({
        title: s.title,
        description: s.description,
        language: s.language,
        code: s.code,
        isFavorite: s.isFavorite,
        isPublic: s.isPublic,
        folderName: s.folder ? s.folder.name : null,
        tags: s.tags.map((st) => st.tag.name),
        createdAt: s.createdAt,
      })),
    };
  }

  async importSnippets(userId: string, data: { snippets: any[] }) {
    if (!data || !Array.isArray(data.snippets)) {
      throw new BadRequestException('Payload must include a "snippets" array.');
    }

    let importedCount = 0;

    for (const item of data.snippets) {
      if (!item.title || !item.code) continue;

      let folderId: string | null = null;
      if (item.folderName) {
        let folder = await this.prisma.folder.findFirst({
          where: { userId, name: item.folderName },
        });
        if (!folder) {
          folder = await this.prisma.folder.create({
            data: { name: item.folderName, userId },
          });
        }
        folderId = folder.id;
      }

      const snippet = await this.prisma.snippet.create({
        data: {
          title: item.title,
          description: item.description || null,
          language: item.language || 'typescript',
          code: item.code,
          isFavorite: item.isFavorite || false,
          isPublic: item.isPublic || false,
          folderId,
          userId,
        },
      });

      // Initial version snapshot
      await this.prisma.snippetVersion.create({
        data: {
          snippetId: snippet.id,
          versionNumber: 1,
          title: snippet.title,
          language: snippet.language,
          code: snippet.code,
          summary: 'Imported from backup',
        },
      });

      // Tags
      if (Array.isArray(item.tags)) {
        for (const tagName of item.tags) {
          const clean = tagName.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
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
            data: { snippetId: snippet.id, tagId: tag.id },
          });
        }
      }

      importedCount++;
    }

    return {
      message: 'Import completed successfully.',
      importedCount,
    };
  }
}
