import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthCheckResponse } from './app.service';
import { AppRootDocs } from './common/decorators/swagger/app-docs.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AppRootDocs()
  @Get()
  getHealth(): HealthCheckResponse {
    return this.appService.getHealth();
  }
}
