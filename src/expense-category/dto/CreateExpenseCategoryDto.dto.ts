
import {
  IsInt,
  IsString,
} from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsInt()
  companyId: number;

  @IsInt()
  accountId: number;

  @IsString()
  icon: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  tags: string;
}
