import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateMeDto } from './dto/update-me.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.userService.getMe(req.user.id);
  }

  @Get(':id')
  async getUser(@Param('id') id: number) {
    return this.userService.getUser(id);
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() dto: UpdateMeDto) {
    return this.userService.updateMe(req.user.id, dto);
  }
}
