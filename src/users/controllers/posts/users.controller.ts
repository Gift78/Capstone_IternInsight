import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { updateUsersDTO } from 'src/users/dto/updateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  getUsers() {
    return this.userService.findUsers();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user') // อนุญาตเฉพาะผู้ใช้ที่เป็นเจ้าของข้อมูล
  @UsePipes(new ValidationPipe())
  async updateUser(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUsersDto: updateUsersDTO,
  @Request() req, // ใช้เพื่อดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
) {
  const currentUserId = req.user.userId; // ID ของผู้ใช้ที่ล็อกอินอยู่
  console.log('Current User ID:', currentUserId); // Debug: ดู ID ของผู้ใช้ที่ล็อกอินอยู่
  

  // ตรวจสอบว่า ID ที่ต้องการแก้ไขตรงกับ ID ของผู้ใช้ที่ล็อกอินอยู่
  if (id !== currentUserId) {
    throw new HttpException(
      'You can only update your own account',
      HttpStatus.FORBIDDEN,
    );
  }

  return this.userService.updateUser(id, updateUsersDto);
}
}