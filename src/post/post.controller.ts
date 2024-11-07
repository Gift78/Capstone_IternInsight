import { Controller, Get, Param } from '@nestjs/common';
import { PostService } from './post.service';
import { InternshipPost } from './entities/post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Handles GET request to fetch all internship posts
  @Get()
  async findAll(): Promise<InternshipPost[]> {
    return this.postService.findAll(); // Calls the service to get all posts
  }

  // Handles GET request to fetch a single internship post by ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<InternshipPost> {
    return this.postService.findOne(id); // Calls the service to get a post by its ID
  }
}
