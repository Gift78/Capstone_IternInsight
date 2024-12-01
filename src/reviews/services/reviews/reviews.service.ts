import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from 'src/typeorm/entities/review.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { CreateReviewParams } from 'src/utils/types';
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
}
