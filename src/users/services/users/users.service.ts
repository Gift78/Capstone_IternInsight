import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { updateUsersDTO } from 'src/users/dto/updateUser.dto';
import { CreateUserParams, UpdateUserParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

  ) {}

  async findUsers(): Promise<UserEntity[]> {
    const users = await this.userRepository.find({
    });
    console.log('Fetched Users:', users); // Debug: ดูข้อมูลที่ดึงมา
    return users;
  }

  // ดึงข้อมูลผู้ใช้ตาม ID
  async findUserById(id: number): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  // ดึงข้อมูลผู้ใช้ตามเงื่อนไข
  async findUsersByCondition(condition: Partial<UserEntity>): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: condition,
    });
  }

  async updateUser(id: number, updateUserDetails: updateUsersDTO): Promise<any> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    Object.assign(user, updateUserDetails);
  
    try {
      await this.userRepository.save(user);
      return {
        success: true,
        message: 'Successfully updated user',
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to update user',
      };
    }
  }
}