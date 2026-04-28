import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  async createComment(
    dto: CreateCommentDto,
    userId: number,
    taskId: number,
    projectId: number,
  ) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (task?.projectId !== +projectId) {
      throw new NotFoundException('Resource not found');
    }

    const comment = await this.commentRepository.save({
      content: dto.content,
      author: { id: userId },
      task: { id: taskId },
    });
    return comment;
  }

  async findAllComment(taskId: number) {
    return await this.commentRepository.find({
      where: { task: { id: taskId } },
    });
  }

  async findOneComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Resource not found');
    }
    return comment;
  }

  async updateComment(
    commentId: number,
    authorId: number,
    dto: UpdateCommentDto,
  ) {
    console.log(commentId, authorId);
    const comment = await this.commentRepository.update(
      { id: commentId, author: { id: authorId } },
      {
        content: dto.content,
      },
    );

    if (comment.affected === 0) {
      throw new NotFoundException('Resource not found');
    }
    return await this.commentRepository.findOne({
      where: { id: commentId },
    });
  }

  async removeComment(commentId: number, authorId: number) {
    const comment = await this.commentRepository.delete({
      id: commentId,
      author: { id: authorId },
    });
    if (comment.affected === 0) {
      throw new NotFoundException('Resource not found');
    }
    return { message: 'Comment deleted' };
  }
}
