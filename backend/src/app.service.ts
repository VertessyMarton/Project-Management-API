import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type HealthCheckResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
};

export type DatabaseHealthCheckResponse = HealthCheckResponse & {
  database: 'ok';
};

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'project-management-api',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseHealth(): Promise<DatabaseHealthCheckResponse> {
    await this.dataSource.query('SELECT 1');

    return {
      ...this.getHealth(),
      database: 'ok',
    };
  }
}
