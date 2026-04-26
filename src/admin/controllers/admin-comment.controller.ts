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
import {
  AdminDeleteCommentDocs,
  AdminFindAllCommentDocs,
} from 'src/common/decorators/swagger/admin-comment-docs.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminCommentController {
  constructor(private readonly adminService: AdminService) {}

  @AdminFindAllCommentDocs()
  @Roles('admin')
  @Get('comments')
  async findAllComment() {
    return this.adminService.findAllComment();
  }

  @AdminDeleteCommentDocs()
  @Roles('admin')
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.adminService.deleteComment(commentId);
  }
}
