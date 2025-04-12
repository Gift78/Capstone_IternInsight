import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikedEntity } from 'src/typeorm/entities/like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(LikedEntity)
    private likeRepository: Repository<LikedEntity>,
  ) {}

  async findAll(): Promise<LikedEntity[]> {
    return this.likeRepository.find();
  }
}
