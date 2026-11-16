import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: '13-devops-dashboard',
      timestamp: new Date().toISOString(),
    };
  }
}
