import { QrService } from '../../backend/src/modules/qr/qr.service';
import { BadRequestException } from '@nestjs/common';

describe('QrService (Unit Tests)', () => {
  let qrService: QrService;

  beforeEach(() => {
    qrService = new QrService();
  });

  it('should generate valid SVG QR code string by default', async () => {
    const result = await qrService.generateQr('https://example.com/short-link');
    expect(result.mimeType).toBe('image/svg+xml');
    expect(typeof result.data).toBe('string');
    expect(result.data).toContain('<svg');
  });

  it('should generate valid PNG buffer when format=png requested', async () => {
    const result = await qrService.generateQr('https://example.com/short-link', { format: 'png' });
    expect(result.mimeType).toBe('image/png');
    expect(Buffer.isBuffer(result.data)).toBe(true);
    expect((result.data as Buffer).length).toBeGreaterThan(0);
  });

  it('should generate valid base64 data URL when format=dataUrl requested', async () => {
    const result = await qrService.generateQr('https://example.com/short-link', { format: 'dataUrl' });
    expect(result.mimeType).toBe('text/plain');
    expect(typeof result.data).toBe('string');
    expect(result.data).toContain('data:image/png;base64,');
  });

  it('should throw BadRequestException if data is empty', async () => {
    await expect(qrService.generateQr('')).rejects.toThrow(BadRequestException);
  });
});
