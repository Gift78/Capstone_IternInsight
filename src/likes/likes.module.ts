import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikedEntity } from 'src/typeorm/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LikedEntity])],
  controllers: [],
  providers: [],
})
export class PostsModule {}
