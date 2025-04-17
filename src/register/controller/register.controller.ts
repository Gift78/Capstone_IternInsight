import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from '../service/register.service';
import { UserEntity } from 'src/typeorm/entities/user.entity';

@Controller('register')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post()
  async register(@Body() userData: Partial<UserEntity>) {
    const user = await this.registerService.register(userData);
    return user;
  }
}
