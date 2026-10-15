import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { Comment } from 'src/comment/entities/comment.entity';

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

  @ManyToOne(() => User, (user) => user.createdTask, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: number;

  @ManyToOne(() => User, (user) => user.assignedTask, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: number | null;

  @Index()
  @ManyToOne(() => Project, (project) => project.task, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: number;

  @OneToMany(() => Comment, (comment) => comment.task)
  comment: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
