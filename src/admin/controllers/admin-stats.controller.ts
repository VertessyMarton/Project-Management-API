import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminService } from '../admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminStatController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
