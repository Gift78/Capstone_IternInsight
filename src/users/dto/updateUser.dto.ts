import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString, 
} from 'class-validator';

export class updateUsersDTO {
  @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsString({ each: true })
    position?: string;
  
    @IsOptional()
    @IsString()
    email?: string;
  
    @IsOptional()
    @IsString()
    phone?: string;
  
    @IsOptional()
    @IsNumber()
    adminId?: number;

    @IsOptional()
    @IsString()
    image?: string;
}
