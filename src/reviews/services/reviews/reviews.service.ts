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
