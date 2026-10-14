import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
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
import { AdminCommentQueryDto } from '../dto/admin.comment-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminCommentController {
  constructor(private readonly adminService: AdminService) {}

  @AdminFindAllCommentDocs()
  @Roles('admin')
  @Get('comments')
  async findAllComment(@Query() query: AdminCommentQueryDto) {
    return this.adminService.findAllComment(query);
  }

  @AdminDeleteCommentDocs()
  @Roles('admin')
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.adminService.deleteComment(commentId);
  }
}
