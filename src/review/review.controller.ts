import { Controller, Get, Param } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Reviews } from './entities/review.entity';

@Controller('review')//path
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async findAll(): Promise<Reviews[]> {
    return this.reviewService.findAllReviews();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Reviews> {
    return this.reviewService.findOneReview(id);
  }
}


@Controller('question')
export class QuestionController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async findAll(): Promise<Reviews[]> {
    return this.reviewService.findAllQuestions();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Reviews> {
    return this.reviewService.findOneQuestion(id);
  }
}