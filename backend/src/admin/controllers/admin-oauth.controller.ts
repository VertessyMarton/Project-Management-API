import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminOauthService } from '../services/admin-oauth.service';
import { AdminOauthQueryDto } from '../dto/admin.oauth-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminOauthController {
  constructor(private readonly oauthService: AdminOauthService) {}

  @Roles('admin')
  @Get('oauth')
  async findAllComment(@Query() query: AdminOauthQueryDto) {
    return this.oauthService.findAllOauthUsers(query);
  }
}
