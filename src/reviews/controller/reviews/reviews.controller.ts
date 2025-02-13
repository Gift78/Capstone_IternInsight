import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { updateReviewDTO } from 'src/reviews/dto/updateReview.dto';
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

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async updateReview(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateReviewDto: updateReviewDTO,
  ) {
    if (isNaN(id)) {
      throw new HttpException('Review not found', 404);
    }
      return this.reviewService.updateReview(id, updateReviewDto);
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: number): Promise<void> {
    return await this.reviewService.deleteReview(id);
  }
}
