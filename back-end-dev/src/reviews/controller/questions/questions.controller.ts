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
  Req,
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
import { Request } from 'express';
import { createCommentDTO } from 'src/reviews/dto/createComment.dto';

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
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe())
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: updateQuestionDTO,
    @Req() req: Request & { user: { userId: number } },
  ) {
    const currentUserId = req.user.userId;
    const question = await this.questionService.findQuestionById(id);

    if (!question) {
      throw new HttpException('Question not found', 404);
    }

    if (question.user.id !== currentUserId) {
      throw new HttpException(
        'You can only update your own question',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedQuestion = await this.questionService.updateQuestion(
      id,
      updateQuestionDto,
    );

    return {
      success: true,
      message: 'Question updated successfully',
      updatedQuestion,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
    //user.userid ,user.role
    @Req() req: Request & { user: { userId: number; role: string } },
  ): Promise<{ success: boolean; message: string }> {
    const currentUserId = req.user.userId;
    const question = await this.questionService.findQuestionById(id);

    if (!question) {
      throw new HttpException('Question not found', 404);
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = question.user.id === currentUserId;

    if (!isAdmin && !isOwner) {
      throw new HttpException(
        'You can only delete your own question',
        HttpStatus.FORBIDDEN,
      );
    }
    // delete comment first
    const comments = await this.questionService.getComments(id);
    if (comments) {
      for (const comment of comments) {
        await this.questionService.deleteComment(comment.id);
      }
    }

    // delete like
    await this.questionService.forceDeleteLike(id);

    await this.questionService.deleteQuestion(id);

    return {
      success: true,
      message: 'Question deleted successfully',
    };
  }

  @Post(':reviewId/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async likePost(
    @Param('reviewId') reviewId: number,
    @Req() req: Request & { user: { userId: number; username: string } },
  ) {
    const userId = req.user.userId;
    const result = await this.questionService.likeQuestion(reviewId, userId);
    if (result === null) {
      return { message: 'Question unliked successfully' };
    }
    if (result) {
      return { message: 'Question liked successfully', result };
    }
    return result;
  }

  @Get(':questionId/like')
  async getLikeCount(@Param('questionId') reviewId: number) {
    const count = await this.questionService.getLikeCount(reviewId);
    return { likeCount: count };
  }

  @Post(':reviewId/comment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async CommentPost(
    @Param('reviewId') reviewId: number,
    @Req() req: Request & { user: { userId: number } },
    @Body() { text, date }: createCommentDTO,
  ) {
    const userId = req.user.userId;
    const commentContent = {
      user: userId,
      review: reviewId,
      text,
      date: new Date(date ?? new Date()),
    };

    const result = await this.questionService.CommnentQuestion(commentContent);
    return {
      success: true,
      message: 'Comment added successfully', // Success message
      comment: result, // ข้อมูลคอมเมนต์ที่ถูกเพิ่ม
    };
  }

  @Put(':questionId/comment/:commentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async updateComment(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request & { user: { userId: number } },
    @Body() { text }: createCommentDTO,
  ): Promise<{ success: boolean; message: string; updatedComment: any }> {
    const userId = req.user.userId;
    const comment = await this.questionService.findCommentById(commentId);

    if (!comment) {
      throw new HttpException('Comment not found', 404);
    }

    if (comment.user.id !== userId) {
      throw new HttpException(
        'You can only update your own comment',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedComment = await this.questionService.updateComment(commentId, {
      text,
    });
    return {
      success: true,
      message: 'Comment updated successfully',
      updatedComment,
    };
  }

  @Delete(':questionId/comment/:commentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async deleteComment(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request & { user: { userId: number } },
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.userId;
    const comment = await this.questionService.findCommentById(commentId);

    if (!comment) {
      throw new HttpException('Comment not found', 404);
    }

    if (comment.user.id !== userId) {
      throw new HttpException(
        'You can only delete your own comment',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.questionService.deleteComment(commentId);

    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }

  @Get(':questionId/comment')
  async getComments(@Param('questionId') questionId: number) {
    const comments = await this.questionService.getComments(questionId);
    return { comments };
  }
}
