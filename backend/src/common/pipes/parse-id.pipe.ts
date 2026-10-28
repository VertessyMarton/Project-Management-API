import {
  Injectable,
  BadRequestException,
  ParseIntPipe,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe extends ParseIntPipe {
  override async transform(
    value: string,
    metadata: ArgumentMetadata,
  ): Promise<number> {
    const id = await super.transform(value, metadata);

    if (id < 1 || id > 2147483647) {
      throw new BadRequestException('Resource ID is outside the allowed range');
    }

    return id;
  }
}
