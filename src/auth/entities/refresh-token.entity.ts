import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UUID } from 'typeorm/driver/mongodb/bson.typings.js';

@Entity()
export class refreshToken {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'hashed_refresh_token' })
  hashedRefreshToken: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @ManyToOne(() => User, (user) => user.refreshToken, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
