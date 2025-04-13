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
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { updateReviewDTO } from 'src/reviews/dto/updateReview.dto';
import { createReviewDTO } from 'src/reviews/dto/createReview.dto';
import { ReviewsService } from 'src/reviews/services/reviews/reviews.service';
import { createCommentDTO } from 'src/reviews/dto/createComment.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewService: ReviewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  getReview() {
    return this.reviewService.findReviews();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getReviewById(@Param('id') id: number) {
    return this.reviewService.findReviewById(id);
  }

  @Get('user/all')
  async getAllReviewsForUsers() {
    return this.reviewService.findReviews();
  }

  @Get('user/:userId')
  async getReviewsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewService.findReviewsByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe())
  async createReview(@Body() createReviewDto: createReviewDTO) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe())
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: updateReviewDTO,
    @Request() req, // ใช้เพื่อดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
  ) {
    const currentUserId = req.user.userId; // ดึง ID ของผู้ใช้ที่ล็อกอินอยู่
    const review = await this.reviewService.findReviewById(id);
  
    if (!review) {
      throw new HttpException('Review not found', 404);
    }
  
    if (review.user.id !== currentUserId) {
      throw new HttpException(
        'You can only update your own review',
        HttpStatus.FORBIDDEN,
      );
    }
  
    const updatedReview = await this.reviewService.updateReview(id, updateReviewDto);

    // เพิ่มข้อความตอบกลับเมื่อการอัปเดตสำเร็จ
    return {
      success: true,
      message: 'Review updated successfully',
      updatedReview,
    };
  }

@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user', 'admin')
async deleteReview(
  @Param('id', ParseIntPipe) id: number,
  @Request() req, // ใช้เพื่อดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
): Promise<{ success: boolean; message: string }> {
  const currentUserId = req.user.userId; // ID ของผู้ใช้ที่ล็อกอินอยู่
  const review = await this.reviewService.findReviewById(id);

  if (!review) {
    throw new HttpException('Review not found', 404);
  }

  // ตรวจสอบว่ารีวิวนี้เป็นของผู้ใช้ที่ล็อกอินอยู่
  if (review.user.id !== currentUserId) {
    throw new HttpException(
      'You can only delete your own review',
      HttpStatus.FORBIDDEN,

    );
  }

  await this.reviewService.deleteReview(id);

  // เพิ่มข้อความตอบกลับเมื่อการลบสำเร็จ
  return {
    success: true,
    message: 'Review deleted successfully',
  };
}

  @Post(':reviewId/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async likePost(@Param('reviewId') reviewId: number, @Req() req) {
    const userId = req.user.userId;
    const result = await this.reviewService.likeReview(reviewId, userId);
    if (result === null) {
      return { message: 'Post unliked successfully' };
    }
    return result;
  }

  @Get(':reviewId/like')
  async getLikeCount(@Param('reviewId') reviewId: number) {
    const count = await this.reviewService.getLikeCount(reviewId);
    return { likeCount: count };
  }

  @Post(':reviewId/comment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async CommentPost(
    @Param('reviewId') reviewId: number,
    @Req() req,
    @Body() { text, date }: createCommentDTO,
  ) {
    const userId = req.user.userId;
    const commentContent = {
      user: userId,
      review: reviewId,
      text,
      date: new Date(date ?? new Date()),
    };

    const result = await this.reviewService.CommnentReview(commentContent);

    return result;
  }
}
