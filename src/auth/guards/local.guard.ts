import { ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidateUserDto } from '../dto/validate-user.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    request.body = await this.validationPipe.transform(request.body, {
      type: 'body',
      metatype: ValidateUserDto,
    });

    return (await super.canActivate(context)) as boolean;
  }
}
