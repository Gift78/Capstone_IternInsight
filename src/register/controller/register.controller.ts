import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RegisterService } from '../service/register.service';
import { UserEntity } from 'src/typeorm/entities/user.entity';

@Controller('register')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post()
  async register(@Body() userData: Partial<UserEntity>) {
    // ตรวจสอบฟิลด์ที่จำเป็น เช่น email, username, password
    if (!userData.email || !userData.username || !userData.password) {
      throw new HttpException(
        'Missing required fields: email, username, and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    // เช็ครูปแบบ email เบื้องต้น
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.registerService.register(userData);
      return {
        message: 'Registration successful',
        user,
      };
    } catch (error) {
      // ถ้าเกิด error จากฐานข้อมูล หรืออื่น ๆ
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
