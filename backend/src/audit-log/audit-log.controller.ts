import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles('admin')
  @Get('audit-logs')
  async findAllTask(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.findAllAuditLogs(query);
  }
}
