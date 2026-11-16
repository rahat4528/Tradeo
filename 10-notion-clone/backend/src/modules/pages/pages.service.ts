import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { BlockType } from '@prisma/client';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async listPages(workspaceId: string) {
    return this.prisma.page.findMany({
      where: {
        workspaceId,
        parentId: null,
        isArchived: false,
      },
      include: {
        children: {
          where: { isArchived: false },
          include: {
            children: { where: { isArchived: false } },
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async listTrash(workspaceId: string) {
    return this.prisma.page.findMany({
      where: {
        workspaceId,
        isArchived: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createPage(dto: CreatePageDto, userId: string, workspaceId: string) {
    let position = 1000.0;
    const lastPage = await this.prisma.page.findFirst({
      where: { workspaceId, parentId: dto.parentId || null },
      orderBy: { position: 'desc' },
    });
    if (lastPage) position = lastPage.position + 1000.0;

    const page = await this.prisma.page.create({
      data: {
        title: dto.title || 'Untitled',
        icon: dto.icon || '📄',
        coverUrl: dto.coverUrl || null,
        parentId: dto.parentId || null,
        position,
        workspaceId,
        authorId: userId,
        blocks: {
          create: [
            {
              type: BlockType.PARAGRAPH,
              content: '',
              position: 1000.0,
            },
          ],
        },
      },
      include: {
        blocks: true,
        children: true,
      },
    });

    return page;
  }

  async getPage(pageId: string, workspaceId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, workspaceId },
      include: {
        parent: {
          select: { id: true, title: true, icon: true },
        },
        children: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
          select: { id: true, title: true, icon: true, updatedAt: true },
        },
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async updatePage(pageId: string, dto: UpdatePageDto, workspaceId: string) {
    await this.getPage(pageId, workspaceId);

    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
        ...(dto.coverUrl !== undefined ? { coverUrl: dto.coverUrl } : {}),
        ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
      },
    });
  }

  async restorePage(pageId: string, workspaceId: string) {
    await this.getPage(pageId, workspaceId);

    return this.prisma.page.update({
      where: { id: pageId },
      data: { isArchived: false },
    });
  }

  async deletePermanent(pageId: string, workspaceId: string) {
    await this.getPage(pageId, workspaceId);

    return this.prisma.page.delete({
      where: { id: pageId },
    });
  }

  async exportPage(pageId: string, format: 'markdown' | 'html', workspaceId: string) {
    const page = await this.getPage(pageId, workspaceId);

    if (format === 'html') {
      let html = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${page.title}</title>\n`;
      html += `<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6;color:#333;}h1{border-bottom:1px solid #eee;padding-bottom:10px;}code{background:#f4f4f4;padding:2px 5px;border-radius:3px;}pre{background:#2d3748;color:#f7fafc;padding:12px;border-radius:6px;overflow-x:auto;}</style>\n</head>\n<body>\n`;
      html += `<h1>${page.icon || ''} ${page.title}</h1>\n`;

      for (const block of page.blocks) {
        switch (block.type) {
          case BlockType.HEADING_1:
            html += `<h2>${block.content}</h2>\n`;
            break;
          case BlockType.HEADING_2:
            html += `<h3>${block.content}</h3>\n`;
            break;
          case BlockType.HEADING_3:
            html += `<h4>${block.content}</h4>\n`;
            break;
          case BlockType.BULLET_LIST:
            html += `<ul><li>${block.content}</li></ul>\n`;
            break;
          case BlockType.NUMBERED_LIST:
            html += `<ol><li>${block.content}</li></ol>\n`;
            break;
          case BlockType.TODO_LIST: {
            const checked = (block.properties as any)?.checked ? 'checked' : '';
            html += `<div><input type="checkbox" disabled ${checked}> ${block.content}</div>\n`;
            break;
          }
          case BlockType.QUOTE:
            html += `<blockquote>${block.content}</blockquote>\n`;
            break;
          case BlockType.CALLOUT:
            html += `<div style="background:#f0f4f8;padding:12px;border-left:4px solid #3182ce;border-radius:4px;">${block.content}</div>\n`;
            break;
          case BlockType.CODE_BLOCK:
            html += `<pre><code>${block.content}</code></pre>\n`;
            break;
          case BlockType.DIVIDER:
            html += `<hr>\n`;
            break;
          default:
            html += `<p>${block.content}</p>\n`;
        }
      }
      html += `</body>\n</html>`;
      return { format: 'html', content: html, filename: `${page.title.toLowerCase().replace(/\s+/g, '-')}.html` };
    }

    // Markdown default
    let md = `# ${page.icon || ''} ${page.title}\n\n`;
    for (const block of page.blocks) {
      switch (block.type) {
        case BlockType.HEADING_1:
          md += `## ${block.content}\n\n`;
          break;
        case BlockType.HEADING_2:
          md += `### ${block.content}\n\n`;
          break;
        case BlockType.HEADING_3:
          md += `#### ${block.content}\n\n`;
          break;
        case BlockType.BULLET_LIST:
          md += `- ${block.content}\n`;
          break;
        case BlockType.NUMBERED_LIST:
          md += `1. ${block.content}\n`;
          break;
        case BlockType.TODO_LIST: {
          const checked = (block.properties as any)?.checked ? 'x' : ' ';
          md += `- [${checked}] ${block.content}\n`;
          break;
        }
        case BlockType.QUOTE:
          md += `> ${block.content}\n\n`;
          break;
        case BlockType.CALLOUT:
          md += `> **Note**: ${block.content}\n\n`;
          break;
        case BlockType.CODE_BLOCK: {
          const lang = (block.properties as any)?.language || '';
          md += `\`\`\`${lang}\n${block.content}\n\`\`\`\n\n`;
          break;
        }
        case BlockType.DIVIDER:
          md += `---\n\n`;
          break;
        default:
          md += `${block.content}\n\n`;
      }
    }
    return { format: 'markdown', content: md, filename: `${page.title.toLowerCase().replace(/\s+/g, '-')}.md` };
  }
}
