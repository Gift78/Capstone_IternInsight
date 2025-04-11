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

  async register(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}