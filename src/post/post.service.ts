import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipPost } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(InternshipPost)
    private PostRepository: Repository<InternshipPost>,
  ) {}

  findAll(): Promise<InternshipPost[]> {
    return this.PostRepository.find();
  }

  // findOne(id: number): Promise<InternshipPost | null> {
  //   return this.usersRepository.findOneBy({ id });
  // }

  async remove(id: number): Promise<void> {
    await this.PostRepository.delete(id);
  }
}

