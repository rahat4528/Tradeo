import { Injectable, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';

export interface QrOptions {
  format?: 'svg' | 'png' | 'dataUrl';
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

@Injectable()
export class QrService {
  async generateQr(data: string, options: QrOptions = {}): Promise<{ mimeType: string; data: string | Buffer }> {
    if (!data) {
      throw new BadRequestException('Data string is required to generate QR code.');
    }

    const {
      format = 'svg',
      size = 300,
      margin = 2,
      errorCorrectionLevel = 'M',
    } = options;

    if (format === 'png') {
      const buffer = await QRCode.toBuffer(data, {
        width: size,
        margin,
        errorCorrectionLevel,
      });
      return { mimeType: 'image/png', data: buffer };
    }

    if (format === 'dataUrl') {
      const dataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin,
        errorCorrectionLevel,
      });
      return { mimeType: 'text/plain', data: dataUrl };
    }

    // Default SVG
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: size,
      margin,
      errorCorrectionLevel,
    });
    return { mimeType: 'image/svg+xml', data: svgString };
  }
}
