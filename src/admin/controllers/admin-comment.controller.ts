import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminCommentController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Get('comments')
  async findAllComment() {
    return this.adminService.findAllComment();
  }

  @Roles('admin')
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.adminService.deleteComment(commentId);
  }
}
