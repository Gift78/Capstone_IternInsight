import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { createUsersDTO } from 'src/users/dto/createUser.dto';
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
  @Roles('admin', 'user') // Only admin or the user themselves can update
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsersDto: updateUsersDTO,
    @Request() req, // ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
  ) {
    const currentUserId = req.user.id; // ID ของผู้ใช้ที่ล็อกอินอยู่
    const currentUserRole = req.user.role; // Role ของผู้ใช้ที่ล็อกอินอยู่
    return this.userService.updateUser(
      id,
      updateUsersDto,
      currentUserId,
      currentUserRole,
    );
  }
}
