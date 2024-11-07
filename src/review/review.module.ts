import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { QuestionController, ReviewController } from './review.controller';
import { Reviews } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reviews])],
  providers: [ReviewService],
  controllers: [ReviewController, QuestionController],
})
export class ReviewModule {}
