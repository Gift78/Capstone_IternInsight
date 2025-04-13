import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createCommentDTO } from 'src/reviews/dto/createComment.dto';
import { CommentEntity } from 'src/typeorm/entities/comment.entity';
import { LikedEntity } from 'src/typeorm/entities/like.entity';
import { ReviewEntity } from 'src/typeorm/entities/review.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { CreateReviewParams, UpdateReviewParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(LikedEntity)
    private likedRepository: Repository<LikedEntity>,

    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async findReviews(): Promise<ReviewEntity[]> {
    const reviews = await this.reviewRepository.find({
      where: { isQuestion: false },
      relations: ['user'], // โหลดข้อมูลผู้ใช้ที่เกี่ยวข้อง
    });
    console.log('Fetched Reviews:', reviews); // Debug: ดูข้อมูลที่ดึงมา
    return reviews;
  }

  async findReviewById(id: number): Promise<ReviewEntity | undefined> {
    return this.reviewRepository.findOne({
      where: { id: id, isQuestion: false },
      relations: ['user'],
    });
  }

  async findReviewsByUserId(userId: number): Promise<ReviewEntity[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.reviewRepository.find({
      where: { user: { id: userId }, isQuestion: false },
      relations: ['user'], // โหลดข้อมูลผู้ใช้ที่เกี่ยวข้อง
    });
  }

  async createReview({ userId, ...createReviewDetails }: CreateReviewParams) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user)
      throw new HttpException(
        'Authentication ID not found. Cannot create Review',
        HttpStatus.BAD_REQUEST,
      );
    const newReview = this.reviewRepository.create({
      user,
      isQuestion: false,
      ...createReviewDetails,
    });
    try {
      await this.reviewRepository.save(newReview);
      return {
        success: true,
        message: 'Successfully created post',
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  }

  async updateReview(
    id: number,
    { userId, ...updateReviewDetails }: UpdateReviewParams,
  ) {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new HttpException('Review not Found', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not Found.', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.reviewRepository.update(id, {
        ...updateReviewDetails,
        user,
      });
      return {
        success: true,
        message: 'Successfully updated review',
      };
    } catch (err) {
      return {
        seccess: false,
        message: err,
      };
    }
  }

  async deleteReview(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review not found`);
    }

    await this.reviewRepository.remove(review);

    return {
      success: true,
      message: `Review with id ${id} has been successfully deleted`,
    };
  }

  async likeReview(
    reviewId: number,
    userId: number,
  ): Promise<LikedEntity | null> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, isQuestion: false },
      relations: ['like', 'like.user'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!review || !user) throw new NotFoundException('Post or User not found');

    const existingLike = review.like.find((like) => like.user.id === user.id);

    if (existingLike) {
      await this.likedRepository.remove(existingLike);
      return null;
    }

    const like = new LikedEntity();
    like.review = review;
    like.user = user;

    return await this.likedRepository.save(like);
  }

  async getLikeCount(reviewId: number): Promise<number> {
    const count = await this.likedRepository.count({
      where: { review: { id: reviewId, isQuestion: false } },
    });
    return count;
  }

  async CommnentReview(comment: createCommentDTO) {
    const review = await this.reviewRepository.findOne({
      where: { id: comment.review, isQuestion: false },
    });

    const user = await this.userRepository.findOne({
      where: { id: comment.user },
    });
    if (!review || !user) throw new NotFoundException('Post or User not found');

    const newComment = this.commentRepository.create({
      date: comment.date,
      text: comment.text,
      user,
      review,
    });
    return await this.commentRepository.save(newComment);
  }

  async DeleteComment() {
    return null;
  }

  async getComments(reviewId: number): Promise<CommentEntity[]> {
    const comments = await this.commentRepository.find({
      where: { review: { id: reviewId } },
    });
    return comments;
  }

  async findCommentById(commentId: number): Promise<CommentEntity | undefined> {
    return this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'], // โหลดข้อมูลผู้ใช้ที่เกี่ยวข้อง
    });
  }
  
  async updateComment(commentId: number, updateData: Partial<CommentEntity>): Promise<CommentEntity> {
    const comment = await this.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
  
    Object.assign(comment, updateData);
    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: number): Promise<void> {
    const comment = await this.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
  
    await this.commentRepository.remove(comment);
  }
}
  