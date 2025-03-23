import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { PostEntity } from './typeorm/entities/post.entity';
import { PostsModule } from './posts/posts.module';
import { AdminEntity } from './typeorm/entities/admin.entity';
import { CompanyEntity } from './typeorm/entities/company.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { ReviewEntity } from './typeorm/entities/review.entity';
import { UserEntity } from './typeorm/entities/user.entity';
import { CommentEntity } from './typeorm/entities/comment.entity';
import { LikedEntity } from './typeorm/entities/like.entity';
import { BookmarkEntity } from './typeorm/entities/bookmark.entity';
import { CompanysModule } from './companys/companys.module';
import { LoginModule } from './login/login.module';
import { ConfigModule } from '@nestjs/config';

config({ path: 'database.env' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        PostEntity,
        AdminEntity,
        CompanyEntity,
        ReviewEntity,
        UserEntity,
        CommentEntity,
        LikedEntity,
        BookmarkEntity,
      ],
      synchronize: true,
    }),
    PostsModule,
    ReviewsModule,
    CompanysModule,
    LoginModule,
  ],
})
export class AppModule {}
