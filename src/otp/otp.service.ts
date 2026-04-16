import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import bcrypt from 'node_modules/bcryptjs';
import { OtpEnum } from './enums/otp.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(@InjectRepository(Otp) private otpRepository: Repository<Otp>) {}

  async generateOtp(user: User, type: OtpEnum): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = await bcrypt.hash(otp, 12);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    await this.otpRepository.save({
      user,
      hashedOtp: token,
      type,
      expiresAt,
    });

    return otp;
  }
}
