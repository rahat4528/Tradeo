import { Controller, Get, Param, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { PublicService } from './public.service';

@ApiTags('Public Menu & QR')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('menu/:slug')
  @ApiOperation({ summary: 'Retrieve public menu and live schedules for guest viewing' })
  async getPublicMenu(@Param('slug') slug: string) {
    return this.publicService.getPublicMenu(slug);
  }

  @Get('qr/:slug')
  @ApiOperation({ summary: 'Generate printable QR code pointing to digital menu' })
  @ApiQuery({ name: 'format', required: false, enum: ['svg', 'png', 'json'] })
  @ApiQuery({ name: 'table', required: false, description: 'Table or seating number' })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async getQrCode(
    @Param('slug') slug: string,
    @Query('format') format: string = 'svg',
    @Query('table') table?: string,
    @Query('size') size?: string,
    @Res() res?: Response,
  ) {
    const sizeNumber = size ? parseInt(size, 10) : 350;
    const result = await this.publicService.generateQr(slug, {
      format: format === 'png' ? 'png' : 'svg',
      table,
      size: sizeNumber,
    });

    if (format === 'json') {
      return res?.status(HttpStatus.OK).json({
        slug,
        table: table || null,
        data: result.data || result,
        mimeType: result.mimeType,
      });
    }

    if (res) {
      res.setHeader('Content-Type', result.mimeType);
      return res.status(HttpStatus.OK).send(result.data || result);
    }

    return result;
  }
}
