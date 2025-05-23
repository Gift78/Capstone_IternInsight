import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterController } from './controller/register.controller';
import { RegisterService } from './service/register.service';
import { UserEntity } from 'src/typeorm/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}