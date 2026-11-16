import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: '12-kanban-board',
      timestamp: new Date().toISOString(),
    };
  }
}
