import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class createCommentDTO {
  @IsNotEmpty()
  @IsString()
  user: number;

  @IsNotEmpty()
  @IsString()
  review: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;
}
