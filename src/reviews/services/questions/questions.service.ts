import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikedEntity } from 'src/typeorm/entities/like.entity';
import { ReviewEntity } from 'src/typeorm/entities/review.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { CreateQuestionParams, UpdateQuestionarams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(LikedEntity)
    private likedRepository: Repository<LikedEntity>,
  ) {}

  async findQuestions(): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { isQuestion: true },
      relations: ['user'], // Load related user data
    });
  }
  async findQuestionById(id: number): Promise<ReviewEntity | undefined> {
    return this.reviewRepository.findOne({
      where: { id: id, isQuestion: true },
      relations: ['user'],
    });
  }

  async findQuestionsByUserId(userId: number): Promise<ReviewEntity[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.reviewRepository.find({
      where: { user: { id: userId }, isQuestion: true },
      relations: ['user'], // Load related user data
    });
  }

  async createQuestion({
    userId,
    ...createQuestionDetails
  }: CreateQuestionParams) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user)
      throw new HttpException(
        'Authentication ID not found. Cannot create Question',
        HttpStatus.BAD_REQUEST,
      );
    const newQuestion = this.reviewRepository.create({
      user,
      isQuestion: true,
      ...createQuestionDetails,
    });
    try {
      await this.reviewRepository.save(newQuestion);
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

  async updateQuestion(
    id: number,
    { userId, ...updateQuestionDetails }: UpdateQuestionarams,
  ) {
    const question = await this.reviewRepository.findOneBy({ id });
    if (!question) {
      throw new HttpException('Question not Found', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not Found', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.reviewRepository.update(id, {
        ...updateQuestionDetails,
        user,
      });
      return {
        succes: true,
        message: 'Successfully update question',
      };
    } catch (err) {
      return {
        seccess: false,
        message: err,
      };
    }
  }

  async deleteQuestion(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const question = await this.reviewRepository.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException(`Question not found`);
    }

    await this.reviewRepository.remove(question);

    return {
      success: true,
      message: `Question with id ${id} has been successfully deleted`,
    };
  }

  async likeQuestion(
    reviewId: number,
    userId: number,
  ): Promise<LikedEntity | null> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, isQuestion: true },
      relations: ['like'], // Use the correct property name here
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!review || !user) throw new NotFoundException('Post or User not found');

    const existingLike = review.like.find((like) => like.user.id === user.id); // again, use `likes`

    if (existingLike) {
      await this.likedRepository.remove(existingLike);
      return null; // Disliked (unliked)
    }

    const like = new LikedEntity();
    like.review = review;
    like.user = user;

    return await this.likedRepository.save(like);
  }

  async getLikeCount(reviewId: number): Promise<number> {
    const count = await this.likedRepository.count({
      where: { review: { id: reviewId, isQuestion: true } },
    });
    return count;
  }
}
