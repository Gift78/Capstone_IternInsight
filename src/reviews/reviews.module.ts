import { Module } from '@nestjs/common';
import { ReviewsController } from './controller/reviews/reviews.controller';
import { ReviewsService } from './services/reviews/reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from 'src/typeorm/entities/review.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { QuestionsController } from './controller/questions/questions.controller';
import { QuestionsService } from './services/questions/questions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, UserEntity])],
  controllers: [ReviewsController, QuestionsController],
  providers: [ReviewsService, QuestionsService],
})
export class ReviewsModule {}
