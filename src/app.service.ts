import { Injectable } from '@nestjs/common';

export type HealthCheckResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
};

@Injectable()
export class AppService {
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'project-management-api',
      timestamp: new Date().toISOString(),
    };
  }
}
