import { Exclude } from 'class-transformer';
import { Otp } from 'src/otp/entities/otp.entity';
import { ProjectMembers } from 'src/project/entities/project-members.entity';
import { Project } from 'src/project/entities/project.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleEnum } from '../enums/user-role.enum';
import { Task } from 'src/task/entities/task.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { refreshToken } from 'src/auth/entities/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @OneToMany(() => Otp, (otp) => otp.user)
  otp: Otp[];

  @OneToMany(() => ProjectMembers, (projectMembers) => projectMembers.user)
  projectMembers: ProjectMembers[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTask: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTask: Task[];

  @OneToMany(() => Comment, (comment) => comment.author)
  author: Comment[];

  @OneToMany(() => refreshToken, (refreshToken) => refreshToken.user)
  refreshToken: refreshToken[];

  @Column({ default: UserRoleEnum.USER, type: 'enum', enum: UserRoleEnum })
  role: UserRoleEnum;

  @Column({ default: 'unverified' })
  status: 'verified' | 'unverified';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
