import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ) {}
  
  findReviews(): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({ where: { isQuestion: false } });
  }

  async findReviewById(id: number): Promise<ReviewEntity | undefined> {
    return this.reviewRepository.findOne({
      where: { id: id, isQuestion: false },
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

    const user = await this.userRepository.findOneBy({ id: userId});
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
    }catch (err) {
      return {
        seccess: false,
        message: err,
      };
    }
  }

  async deleteReview(id: number): Promise<{ success: boolean; message: string }> {
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
}
