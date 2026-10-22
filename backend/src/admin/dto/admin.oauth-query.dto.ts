import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { OAuthProvider } from 'src/auth/enums/oauth-provider.enum';

export enum AdminOauthSortField {
  LINKED_AT = 'linkedAt',
  EMAIL = 'email',
  ID = 'id',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class AdminOauthQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @IsOptional()
  @Type(() => String)
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(OAuthProvider)
  provider?: OAuthProvider;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  providerId?: number;

  @IsOptional()
  @IsDateString()
  linkedFrom?: string;

  @IsOptional()
  @IsDateString()
  linkedTo?: string;

  @IsOptional()
  @IsEnum(AdminOauthSortField)
  sortBy: AdminOauthSortField = AdminOauthSortField.LINKED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}
