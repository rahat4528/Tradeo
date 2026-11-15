import { Controller, Get, Param, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('QR Codes')
@Controller('qr')
export class QrController {
  constructor(
    private qrService: QrService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Generate QR code for a shortened URL slug' })
  @ApiQuery({ name: 'format', required: false, enum: ['svg', 'png', 'dataUrl'] })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async getQr(
    @Param('slug') slug: string,
    @Query('format') format: 'svg' | 'png' | 'dataUrl' = 'svg',
    @Query('size') size: string = '300',
    @Res() res: Response,
  ) {
    const link = await this.prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      throw new BadRequestException(`Link with slug '${slug}' not found.`);
    }

    const appBaseUrl = this.configService.get<string>('appBaseUrl', 'http://localhost:4000');
    const shortUrl = `${appBaseUrl}/r/${slug}`;

    const parsedSize = parseInt(size, 10) || 300;
    const result = await this.qrService.generateQr(shortUrl, {
      format,
      size: parsedSize,
    });

    if (format === 'dataUrl') {
      return res.json({ dataUrl: result.data });
    }

    res.setHeader('Content-Type', result.mimeType);
    return res.send(result.data);
  }
}
