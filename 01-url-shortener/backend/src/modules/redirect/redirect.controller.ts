import { Controller, Get, Post, Param, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RedirectService } from './redirect.service';

@ApiTags('Redirection')
@Controller('r')
export class RedirectController {
  constructor(private redirectService: RedirectService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Resolve short URL slug and redirect to destination' })
  async redirect(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const meta = {
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'] || req.headers['referrer'] as string,
      countryHeader: (req.headers['cf-ipcountry'] || req.headers['x-country-code']) as string,
    };

    const result = await this.redirectService.resolveSlug(slug, meta);

    if (result.requiresPassword) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'This short link is password-protected.',
        requiresPassword: true,
        slug,
      });
    }

    // Set cache control for redirects
    res.setHeader('Cache-Control', 'private, max-age=90');
    return res.redirect(result.redirectCode, result.targetUrl);
  }

  @Post(':slug/verify')
  @ApiOperation({ summary: 'Verify password for a protected short link' })
  async verifyPassword(
    @Param('slug') slug: string,
    @Body('password') password: string,
    @Req() req: Request,
  ) {
    const meta = {
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'] || req.headers['referrer'] as string,
      countryHeader: (req.headers['cf-ipcountry'] || req.headers['x-country-code']) as string,
    };

    return this.redirectService.verifyPasswordAndResolve(slug, password, meta);
  }
}
