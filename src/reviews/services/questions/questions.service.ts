import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async createQuestion({ userId, ...createQuestionDetails }: CreateQuestionParams) {
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
    }catch (err) {
      return {
        seccess: false,
        message: err,
      };
    }
  }

  async deleteQuestion(id: number): Promise<{ success: boolean; message: string }> {
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
}
