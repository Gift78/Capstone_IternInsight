import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { createPostDTO } from 'src/posts/dto/createPost.dto';
import { updatePostDTO } from 'src/posts/dto/updatePost.dto';
import { PostsService } from 'src/posts/services/posts/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postService: PostsService) {}
  @Get()
  getPosts() {
    return this.postService.findPosts();
  }

  @Get(':id')
  async getPostById(@Param('id') id: number) {
    if (isNaN(id)) {
      throw new HttpException('Post not found', 404);
    }

    const post = await this.postService.findPostById(id);
    if (!post) {
      throw new HttpException('Post not found', 404);
    }
    return post;
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createPost(@Body() createPostDto: createPostDTO) {
    return this.postService.createPost(createPostDto); //User Authentication
  }

  @Post('bookmark/:id')
  @UsePipes(new ValidationPipe())
  createBookmark() {} //User Authentication

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: updatePostDTO,
  ) {
    if (isNaN(id)) {
      throw new HttpException('Post not found', 404);
    }
    return this.postService.updatePost(id, updatePostDto); //User Authentication
  }

  @Delete(':id')
  async deletePost(@Param('id') id: number): Promise<void> {
    return await this.postService.deletePost(id); //User Authentication
  }
}
