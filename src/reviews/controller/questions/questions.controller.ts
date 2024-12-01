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
import { QuestionsService } from 'src/reviews/services/questions/questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private questionService: QuestionsService) {}
  @Get()
  getReview() {
    return this.questionService.findQuestions();
  }

  @Get(':id')
  async getReviewById(@Param('id') id: number) {
    return this.questionService.findQurstionById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createReview(@Body() createReviewDto: createReviewDTO) {
    return this.questionService.createQuestion(createReviewDto);
  }
}
