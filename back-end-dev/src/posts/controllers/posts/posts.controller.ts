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
  Req,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { createPostDTO } from 'src/posts/dto/createPost.dto';
import { updatePostDTO } from 'src/posts/dto/updatePost.dto';
import { PostsService } from 'src/posts/services/posts/posts.service';
import { Request } from '@nestjs/common';

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

  //Bookmark
  @UseGuards(JwtAuthGuard) // ต้องเปิดใช้งาน Auth Guard เพื่อให้มี req.user.id
  @Post(':id/bookmark')
  async addBookmark(@Param('id') postId: number, @Request() req) {
    const userId = req.user.userId;
    // ตรวจสอบว่าโพสต์มีอยู่ในฐานข้อมูลหรือไม่
    const post = await this.postService.findPostById(postId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND); // ถ้าไม่พบโพสต์
    }

    // ตรวจสอบว่า userId มีอยู่ในระบบหรือไม่ (กรณีผู้ใช้ไม่ล็อกอิน)
    if (!userId) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED); // ถ้าไม่พบผู้ใช้
    }

    // เพิ่ม bookmark
    await this.postService.createBookmark(userId, postId);

    // ส่งข้อความที่บ่งบอกว่า bookmark ถูกเพิ่มสำเร็จ
    return { message: 'Bookmark added successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/bookmark')
  async deleteBookmark(@Param('id') postId: number, @Request() req) {
    const userId = req.user.userId;
    // ตรวจสอบว่าโพสต์มีอยู่ในฐานข้อมูลหรือไม่
    const post = await this.postService.findPostById(postId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND); // ถ้าไม่พบโพสต์
    }

    // ตรวจสอบว่า userId มี bookmark ในโพสต์นี้หรือไม่
    const bookmark = await this.postService.findBookmarkedByUser(userId);
    if (!bookmark) {
      throw new HttpException('Bookmark not found', HttpStatus.NOT_FOUND); // ถ้าไม่พบ bookmark
    }

    // ลบ bookmark
    await this.postService.removeBookmark(userId, postId);

    // ส่งข้อความที่บ่งบอกว่า bookmark ถูกลบสำเร็จ
    return { message: 'Bookmark removed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async toggleBookmark(@Param('id') postId: number, @Request() req) {
    const userId = req.user.id;
    const result = await this.postService.toggleBookmark(postId, userId);

    if (!result) {
      return { message: 'Bookmark removed successfully' };
    }
    return { message: 'Bookmark added successfully', data: result };
  }
  // get bookmark for know this user bookmark this post or not
  @UseGuards(JwtAuthGuard)
  @Get(':id/bookmark')
  async getBookmark(@Param('id') postId: number, @Request() req) {
    const userId = req.user.userId;
    const bookmark = await this.postService.getBookmark(postId, userId);

    // if have result return true else false
    if (bookmark) {
      return { message: 'Bookmark exists', data: true };
    }
    return { message: 'Bookmark does not exist', data: false };
  }

  @Get(':id/bookmark-count')
  async getBookmarkCount(@Param('id') postId: number) {
    const count = await this.postService.getBookmarkCount(postId);
    return { postId, bookmarkCount: count };
  }
  @Get()
  async findAll(@Req() req) {
    const userId = req.user?.id;
    return this.postService.findAllWithBookmarkStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarks/me')
  async getMyBookmarks(@Request() req) {
    const userId = req.user.userId;
    return this.postService.findBookmarkedByUser(userId);
  }
}
