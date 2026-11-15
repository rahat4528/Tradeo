import { AbuseService } from '../../backend/src/modules/abuse/abuse.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('AbuseService (Unit Tests)', () => {
  let abuseService: AbuseService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockImplementation((key: string, defaultVal?: any) => {
      if (key === 'appBaseUrl') return 'http://localhost:4000';
      return defaultVal;
    });
    abuseService = new AbuseService(configService);
  });

  describe('validateTargetUrl', () => {
    it('should permit valid https URLs', () => {
      const validUrl = 'https://developer.mozilla.org/en-US/docs/Web';
      expect(abuseService.validateTargetUrl(validUrl)).toBe(validUrl);
    });

    it('should permit valid http URLs', () => {
      const validUrl = 'http://example.org/index.html';
      expect(abuseService.validateTargetUrl(validUrl)).toBe(validUrl);
    });

    it('should throw BadRequestException for javascript: protocol', () => {
      expect(() => {
        abuseService.validateTargetUrl('javascript:alert("xss")');
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for data: protocol', () => {
      expect(() => {
        abuseService.validateTargetUrl('data:text/html,<script>alert(1)</script>');
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file: and ftp: protocols', () => {
      expect(() => {
        abuseService.validateTargetUrl('file:///etc/passwd');
      }).toThrow(BadRequestException);

      expect(() => {
        abuseService.validateTargetUrl('ftp://ftp.example.com');
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for malformed URLs', () => {
      expect(() => {
        abuseService.validateTargetUrl('not-a-valid-url');
      }).toThrow(BadRequestException);
    });

    it('should prevent loop redirects back to the shortener host', () => {
      expect(() => {
        abuseService.validateTargetUrl('http://localhost:4000/r/infinite-loop');
      }).toThrow(BadRequestException);
    });

    it('should block known malicious phishing domains', () => {
      expect(() => {
        abuseService.validateTargetUrl('https://phishing.example/login');
      }).toThrow(BadRequestException);
    });
  });

  describe('validateCustomAlias', () => {
    it('should accept valid alphanumeric slugs', () => {
      expect(abuseService.validateCustomAlias('summer-sale-2026')).toBe('summer-sale-2026');
      expect(abuseService.validateCustomAlias('brand_new_v2')).toBe('brand_new_v2');
    });

    it('should reject slugs that are too short (< 3 chars)', () => {
      expect(() => {
        abuseService.validateCustomAlias('ab');
      }).toThrow(BadRequestException);
    });

    it('should reject slugs that are too long (> 50 chars)', () => {
      expect(() => {
        abuseService.validateCustomAlias('a'.repeat(51));
      }).toThrow(BadRequestException);
    });

    it('should reject invalid characters in slugs', () => {
      expect(() => {
        abuseService.validateCustomAlias('hello world!');
      }).toThrow(BadRequestException);

      expect(() => {
        abuseService.validateCustomAlias('slug?query=1');
      }).toThrow(BadRequestException);
    });

    it('should reject reserved system routes', () => {
      const reserved = ['api', 'auth', 'r', 'qr', 'admin', 'dashboard', 'login'];
      for (const r of reserved) {
        expect(() => {
          abuseService.validateCustomAlias(r);
        }).toThrow(BadRequestException);
      }
    });

    it('should return null when alias is omitted', () => {
      expect(abuseService.validateCustomAlias(undefined)).toBeNull();
    });
  });
});
