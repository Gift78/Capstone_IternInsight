import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts/posts.controller';
import { PostsService } from './services/posts/posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/typeorm/entities/post.entity';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';
import { CompanyEntity } from 'src/typeorm/entities/company.entity';
import { BookmarkEntity } from 'src/typeorm/entities/bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      AdminEntity,
      CompanyEntity,
      BookmarkEntity,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
