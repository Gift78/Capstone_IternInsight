import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { createQuestionDTO } from 'src/reviews/dto/createQuestion.dto';
import { updateQuestionDTO } from 'src/reviews/dto/updateQuestion.dto';
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
    return this.questionService.findQuestionById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createQuestion(@Body() createQuestionDto: createQuestionDTO) {
    return this.questionService.createQuestion(createQuestionDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDTO: updateQuestionDTO,
  ) {
    if (isNaN(id)) {
      throw new HttpException('Qiestion not found', 404);
    }
    return this.questionService.updateQuestion(id, updateQuestionDTO);
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: number): Promise<void> {
    return await this.questionService.deleteQuestion(id);
  }
}
