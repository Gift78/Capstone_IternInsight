import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async register(userData: any): Promise<UserEntity> {
    // const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      name: userData.name?.trim(),
      username: userData.username?.trim(), // ✅ แก้ตรงนี้
      email: userData.email?.trim().toLowerCase(),
      password: userData.password?.trim(), 
      // password: hashedPassword,
      phone: userData.phone?.trim() || null,
      position: userData.position?.trim() || null,
      description: userData.description?.trim() || null,
    });

    return this.userRepository.save(user);
  }
}
