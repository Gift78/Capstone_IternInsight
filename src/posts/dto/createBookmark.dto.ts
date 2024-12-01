import { IsNotEmpty, IsNumber } from 'class-validator';

export class createBookMarkDTO {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  postId: string;
}
