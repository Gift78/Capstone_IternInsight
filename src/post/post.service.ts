import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipPost } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    // Connects the InternshipPost repository to access database functions for this entity
    @InjectRepository(InternshipPost)
    private internshipPostRepository: Repository<InternshipPost>,
  ) {}

  // Retrieves all internship posts from the database
  async findAll(): Promise<InternshipPost[]> {
    return this.internshipPostRepository.find();
  }

  // Finds a specific internship post by its ID.
  // If no post is found with the provided ID, it throws an error message.
  async findOne(Post_ID: number): Promise<InternshipPost | null> {
    const post = await this.internshipPostRepository.findOneBy({ Post_ID });
    if (!post) {
      throw new NotFoundException(`Post with ID ${Post_ID} not found`);
    }
    return post;
  }
}
