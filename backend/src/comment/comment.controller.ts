import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ProjectRolesGuard } from 'src/common/guards/project-roles.guard';
import { ProjectRoles } from 'src/common/decorators/project-roles.decorator';
import {
  CreateCommentDocs,
  FindAllCommentDocs,
  FindOneCommentDocs,
  RemoveCommentDocs,
  UpdateCommentDocs,
} from 'src/common/decorators/swagger/comment-docs.decorator';
import {
  MutationLimit,
  ReadLimit,
} from 'src/common/decorators/rate-limit.decorator';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects/:projectId')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @CreateCommentDocs()
  @ProjectRoles(['owner', 'admin', 'member', 'viewer'])
  @MutationLimit()
  @Post('/tasks/:taskId/comments')
  async createComment(
    @Request() req,
    @Param('projectId', ParseIdPipe) projectId: number,
    @Param('taskId', ParseIdPipe) taskId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentService.createComment(
      dto,
      req.user.id,
      taskId,
      projectId,
    );
  }

  @FindAllCommentDocs()
  @ProjectRoles(['owner', 'admin', 'member', 'viewer'])
  @ReadLimit()
  @Get('/tasks/:taskId/comments')
  async findAllComment(
    @Param('taskId', ParseIdPipe) taskId: number,
    @Param('projectId', ParseIdPipe) projectId: number,
  ) {
    return await this.commentService.findAllComment(taskId, projectId);
  }

  @FindOneCommentDocs()
  @ProjectRoles(['owner', 'admin', 'member', 'viewer'])
  @ReadLimit()
  @Get('/tasks/:taskId/comments/:commentId')
  async findOneComment(
    @Param('commentId', ParseIdPipe) commentId: number,
    @Param('taskId', ParseIdPipe) taskId: number,
    @Param('projectId', ParseIdPipe) projectId: number,
  ) {
    return await this.commentService.findOneComment(
      commentId,
      taskId,
      projectId,
    );
  }

  @UpdateCommentDocs()
  @ProjectRoles(['owner', 'admin', 'member', 'viewer'])
  @MutationLimit()
  @Patch('/tasks/:taskId/comments/:commentId')
  async updateComment(
    @Request() req,
    @Param('commentId', ParseIdPipe) commentId: number,
    @Param('taskId', ParseIdPipe) taskId: number,
    @Param('projectId', ParseIdPipe) projectId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(
      commentId,
      req.user.id,
      taskId,
      projectId,
      dto,
    );
  }

  @RemoveCommentDocs()
  @ProjectRoles(['owner', 'admin', 'member', 'viewer'])
  @MutationLimit()
  @Delete('/tasks/:taskId/comments/:commentId')
  async removeComment(
    @Request() req,
    @Param('commentId', ParseIdPipe) commentId: number,
    @Param('taskId', ParseIdPipe) taskId: number,
    @Param('projectId', ParseIdPipe) projectId: number,
  ) {
    return await this.commentService.removeComment(
      commentId,
      req.user.id,
      taskId,
      projectId,
    );
  }
}
