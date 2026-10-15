import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RefreshTokenEnum } from '../enums/refresh-token.enum';

@Entity()
export class RefreshToken {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'hashed_refresh_token' })
  hashedRefreshToken: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt: Date;

  @Column({
    type: 'enum',
    enum: RefreshTokenEnum,
    name: 'revoked_reason',
    nullable: true,
  })
  revokedReason: RefreshTokenEnum | null;

  @Column({ name: 'family_id' })
  familyId: string;

  @ManyToOne(() => User, (user) => user.refreshToken, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
