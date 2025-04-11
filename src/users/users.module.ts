import { Module } from '@nestjs/common';
import { UsersController } from './controllers/posts/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AdminEntity
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}