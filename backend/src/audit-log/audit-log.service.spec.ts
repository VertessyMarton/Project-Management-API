import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditLog } from './entities/aduit-log.entity';
import { AuditCategory } from './enums/log-category.enum';
import { AuditOutcome } from './enums/log-outcome.enum';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let save: jest.Mock;

  beforeEach(async () => {
    save = jest.fn().mockResolvedValue({});
    const repository = { save };
    const manager = { getRepository: jest.fn().mockReturnValue(repository) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: getRepositoryToken(AuditLog), useValue: repository },
        {
          provide: DataSource,
          useValue: {
            manager,
            transaction: jest.fn(async (callback) => callback(manager)),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const event = {
    category: AuditCategory.ADMIN,
    action: 'admin.user.delete',
    actorId: 1,
    targetType: null,
    targetId: null,
  };

  it('records success and returns the operation result', async () => {
    await expect(
      service.run(event, async (_, audit) => {
        audit.setMetadata({ name: 'Test User' });
        return 'deleted';
      }),
    ).resolves.toBe('deleted');
    expect(save).toHaveBeenCalledWith({
      ...event,
      metadata: { name: 'Test User' },
      outcome: AuditOutcome.SUCCESS,
    });
  });

  it('records failure and preserves the original error', async () => {
    const error = new Error('Deletion failed');
    await expect(
      service.run(event, async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    expect(save).toHaveBeenCalledWith({
      ...event,
      metadata: {},
      outcome: AuditOutcome.FAILURE,
    });
  });
});
