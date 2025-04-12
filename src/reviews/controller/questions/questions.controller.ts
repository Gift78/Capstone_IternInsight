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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { createQuestionDTO } from 'src/reviews/dto/createQuestion.dto';
import { updateQuestionDTO } from 'src/reviews/dto/updateQuestion.dto';
import { QuestionsService } from 'src/reviews/services/questions/questions.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private questionService: QuestionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  getReview() {
    return this.questionService.findQuestions();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getReviewById(@Param('id') id: number) {
    return this.questionService.findQuestionById(id);
  }

  @Get('user/all')
  async getAllQuestionsForUsers() {
    return this.questionService.findQuestions();
  }

  @Get('user/:userId')
  async getQuestionsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.questionService.findQuestionsByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe())
  async createQuestion(@Body() createQuestionDto: createQuestionDTO) {
    return this.questionService.createQuestion(createQuestionDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin') // อนุญาตให้ user และ admin แก้ไขคำถามได้
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    return await this.questionService.deleteQuestion(id);
  }

  @Post(':questionId/like')
  async likePost(
    @Param('questionId') questionId: number,
    @Body() body: { userId: number },
  ) {
    const result = await this.questionService.likeQuestion(
      questionId,
      body.userId,
    );
    if (result === null) {
      return { message: 'Post unliked successfully' };
    }
    return result;
  }

  @Get(':questionId/like')
  async getLikeCount(@Param('questionId') reviewId: number) {
    const count = await this.questionService.getLikeCount(reviewId);
    return { likeCount: count };
  }
}
