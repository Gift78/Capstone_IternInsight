import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reviews } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Reviews)
    private ReviewRepository: Repository<Reviews>,
  ) {}

  async findAllReviews(): Promise<Reviews[]> {
    return this.ReviewRepository.find({
      where: {
        IsQuestion: false,
      },
    });
  }

  async findAllQuestions(): Promise<Reviews[]> {
    return this.ReviewRepository.find({
      where: {
        IsQuestion: true,
      },
    });
  }

  async findOneReview(Review_ID: number): Promise<Reviews | null> {
    const post = await this.ReviewRepository.findOne({
      where: {
        Review_ID,
        IsQuestion: false,
      },
    });
    if (!post) {
      throw new NotFoundException(`Review with ID ${Review_ID} not found`);
    }
    return post;
  }

  async findOneQuestion(Review_ID: number): Promise<Reviews | null> {
    const post = await this.ReviewRepository.findOne({
      where: {
        Review_ID,
        IsQuestion: true,
      },
    });
    if (!post) {
      throw new NotFoundException(`Question with ID ${Review_ID} not found`);
    }
    return post;
  }
}
