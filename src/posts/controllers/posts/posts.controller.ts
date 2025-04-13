import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // อนุญาตเฉพาะ admin
  @UsePipes(new ValidationPipe())
  createPost(@Body() createPostDto: createPostDTO) {
    return this.postService.createPost(createPostDto);
  }

  // @Post('bookmark/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @UsePipes(new ValidationPipe())
  // createBookmark() {}

  // เฉพาะ admin เท่านั้นที่สามารถอัปเดตโพสต์ได้
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe())
  async updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: updatePostDTO,
  ) {
    if (isNaN(id)) {
      throw new HttpException('Post not found', 404);
    }
    return this.postService.updatePost(id, updatePostDto);
  }

  // เฉพาะ admin เท่านั้นที่สามารถลบโพสต์ได้
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deletePost(@Param('id') id: number): Promise<{ message: string }> {
    return await this.postService.deletePost(id);
  }
}
