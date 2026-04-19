import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OtpEnum } from '../enums/otp.enum';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.otp)
  user: User;

  @Column()
  hashedOtp: string;

  @Column({ type: 'enum', enum: OtpEnum })
  type: OtpEnum;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
