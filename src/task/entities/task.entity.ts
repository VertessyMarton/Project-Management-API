import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { Comment } from 'src/comment/entities/comment.entity';
import { CommentController } from 'src/comment/comment.controller';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    default: TaskStatusEnum.TODO,
    type: 'enum',
    enum: TaskStatusEnum,
    nullable: true,
  })
  status: TaskStatusEnum;

  @Column({ name: 'due_date', nullable: true })
  dueDate: Date;

  @ManyToOne(() => User, (user) => user.createdTask)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @RelationId((task: Task) => task.createdBy)
  createdById: number;

  @ManyToOne(() => User, (user) => user.assignedTask, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @RelationId((task: Task) => task.assignee)
  assigneeId: number | null;

  @ManyToOne(() => Project, (project) => project.task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @RelationId((task: Task) => task.project)
  projectId: number;

  @OneToMany(() => Comment, (comment) => comment.task)
  comment: CommentController[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
