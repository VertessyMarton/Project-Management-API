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
  ParseIntPipe,
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

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects/:projectId/tasks/:taskId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @CreateCommentDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @Post()
  async createComment(
    @Request() req,
    @Param('projectId') projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
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
  @ProjectRoles(['owner', 'member', 'viewer'])
  @Get()
  async findAllComment(@Param('taskId', ParseIntPipe) taskId: number) {
    return await this.commentService.findAllComment(taskId);
  }

  @FindOneCommentDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @Get(':commentId')
  async findOneComment(@Param('commentId', ParseIntPipe) commentId: string) {
    return await this.commentService.findOneComment(+commentId);
  }

  @UpdateCommentDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @Patch(':commentId')
  async updateComment(
    @Request() req,
    @Param('commentId', ParseIntPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(
      +commentId,
      req.user.id,
      dto,
    );
  }

  @RemoveCommentDocs()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @Delete(':commentId')
  async removeComment(@Request() req, @Param('commentId') commentId: string) {
    return await this.commentService.removeComment(+commentId, req.user.id);
  }
}
