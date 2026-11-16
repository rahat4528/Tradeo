import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: '11-jira-clone',
      timestamp: new Date().toISOString(),
    };
  }
}
