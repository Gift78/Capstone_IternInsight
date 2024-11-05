import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { InternshipPost } from './entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternshipPost])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}