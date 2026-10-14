import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminStatsDocs } from 'src/common/decorators/swagger/admin-stats-docs.decorator';
import { AdminStatsService } from '../services/admin-stats.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminStatController {
  constructor(private readonly adminService: AdminStatsService) {}

  @AdminStatsDocs()
  @Roles('admin')
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
