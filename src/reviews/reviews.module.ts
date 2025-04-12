import { Module } from '@nestjs/common';
import { ReviewsController } from './controller/reviews/reviews.controller';
import { ReviewsService } from './services/reviews/reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from 'src/typeorm/entities/review.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { QuestionsController } from './controller/questions/questions.controller';
import { QuestionsService } from './services/questions/questions.service';
import { LikedEntity } from 'src/typeorm/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, UserEntity, LikedEntity])],
  controllers: [ReviewsController, QuestionsController],
  providers: [ReviewsService, QuestionsService],
})
export class ReviewsModule {}
