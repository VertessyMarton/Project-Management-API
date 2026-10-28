import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  AdminDeleteCommentDocs,
  AdminFindAllCommentDocs,
} from 'src/common/decorators/swagger/admin-comment-docs.decorator';
import { AdminCommentQueryDto } from '../dto/admin.comment-query.dto';
import { AdminCommentService } from '../services/admin-comment.service';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminCommentController {
  constructor(private readonly adminService: AdminCommentService) {}

  @AdminFindAllCommentDocs()
  @Roles('admin')
  @Get('comments')
  async findAllComment(@Query() query: AdminCommentQueryDto) {
    return this.adminService.findAllComment(query);
  }

  @AdminDeleteCommentDocs()
  @Roles('admin')
  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId', ParseIdPipe) commentId: number,
    @Request() req,
  ) {
    return this.adminService.deleteComment(
      commentId,
      req.user.id,
      req.requestId,
    );
  }
}
