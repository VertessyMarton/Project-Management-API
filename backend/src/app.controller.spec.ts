import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

describe('AppController', () => {
  let appController: AppController;
  const dataSource = {
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return health check response', () => {
      expect(appController.getHealth()).toMatchObject({
        status: 'ok',
        service: 'project-management-api',
      });
    });

    it('should return database health check response', async () => {
      await expect(appController.getDatabaseHealth()).resolves.toMatchObject({
        status: 'ok',
        service: 'project-management-api',
        database: 'ok',
      });
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });
  });
});
