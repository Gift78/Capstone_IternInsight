import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { createReviewDTO } from 'src/reviews/dto/createReview.dto';
import { ReviewsService } from 'src/reviews/services/reviews/reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewService: ReviewsService) {}
  @Get()
  getReview() {
    return this.reviewService.findReviews();
  }

  @Get(':id')
  async getReviewById(@Param('id') id: number) {
    return this.reviewService.findReviewById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createReview(@Body() createReviewDto: createReviewDTO) {
    return this.reviewService.createReview(createReviewDto);
  }
}
