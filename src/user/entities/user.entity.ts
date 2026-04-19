import { Exclude } from 'class-transformer';
import { Otp } from 'src/otp/entities/otp.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 'unverified' })
  status: 'verified' | 'unverified';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
