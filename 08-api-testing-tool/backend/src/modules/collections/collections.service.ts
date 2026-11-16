import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { SaveRequestDto } from './dto/save-request.dto';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async listCollections(workspaceId: string) {
    return this.prisma.collection.findMany({
      where: { workspaceId, parentId: null },
      include: {
        children: {
          include: {
            requests: true,
          },
        },
        requests: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCollection(dto: CreateCollectionDto, workspaceId: string) {
    return this.prisma.collection.create({
      data: {
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId || null,
        workspaceId,
      },
    });
  }

  async getCollection(id: string, workspaceId: string) {
    const col = await this.prisma.collection.findFirst({
      where: { id, workspaceId },
      include: {
        children: {
          include: { requests: true },
        },
        requests: true,
      },
    });
    if (!col) throw new NotFoundException('Collection not found');
    return col;
  }

  async deleteCollection(id: string, workspaceId: string) {
    await this.getCollection(id, workspaceId);
    return this.prisma.collection.delete({
      where: { id },
    });
  }

  async saveRequest(dto: SaveRequestDto, workspaceId: string) {
    return this.prisma.savedRequest.create({
      data: {
        name: dto.name,
        method: dto.method,
        url: dto.url,
        headers: dto.headers || [],
        params: dto.params || [],
        body: dto.body || null,
        bodyType: dto.bodyType || 'NONE',
        authType: dto.authType || 'NONE',
        authConfig: dto.authConfig || {},
        assertions: dto.assertions || [],
        collectionId: dto.collectionId || null,
        workspaceId,
      },
    });
  }

  async updateRequest(id: string, dto: Partial<SaveRequestDto>, workspaceId: string) {
    const existing = await this.prisma.savedRequest.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Request not found');

    return this.prisma.savedRequest.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteRequest(id: string, workspaceId: string) {
    const existing = await this.prisma.savedRequest.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Request not found');

    return this.prisma.savedRequest.delete({
      where: { id },
    });
  }

  async exportCollections(workspaceId: string) {
    const collections = await this.listCollections(workspaceId);
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      collections,
    };
  }

  async importCollections(data: any, workspaceId: string) {
    if (!data || !Array.isArray(data.collections)) {
      throw new Error('Invalid collection export schema');
    }

    const createdCollections = [];
    for (const col of data.collections) {
      const createdCol = await this.prisma.collection.create({
        data: {
          name: col.name,
          description: col.description,
          workspaceId,
        },
      });

      if (Array.isArray(col.requests)) {
        for (const req of col.requests) {
          await this.prisma.savedRequest.create({
            data: {
              name: req.name,
              method: req.method || 'GET',
              url: req.url || 'https://httpbin.org/get',
              headers: req.headers || [],
              params: req.params || [],
              body: req.body || null,
              bodyType: req.bodyType || 'NONE',
              authType: req.authType || 'NONE',
              authConfig: req.authConfig || {},
              assertions: req.assertions || [],
              collectionId: createdCol.id,
              workspaceId,
            },
          });
        }
      }
      createdCollections.push(createdCol);
    }

    return { importedCount: createdCollections.length };
  }
}
