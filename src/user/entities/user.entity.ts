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

  @OneToMany(() => Project, (project) => project.user)
  project: Project[];

  @OneToMany(() => ProjectMembers, (projectMembers) => projectMembers.user)
  projectMembers: ProjectMembers[];

  @Column({ default: 'user' })
  role: 'admin' | 'user';

  @Column({ default: 'unverified' })
  status: 'verified' | 'unverified';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
