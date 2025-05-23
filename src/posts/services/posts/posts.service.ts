import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';
import { BookmarkEntity } from 'src/typeorm/entities/bookmark.entity';
import { CompanyEntity } from 'src/typeorm/entities/company.entity';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { PostEntity } from 'src/typeorm/entities/post.entity';
import { CreatePostParams, UpdatePostParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,

    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,

    @InjectRepository(BookmarkEntity)
    private bookmarkRepository: Repository<BookmarkEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  findPosts(): Promise<PostEntity[]> {
    return this.postRepository.find({ relations: ['company'] });
  }

  async findPostById(id: number): Promise<PostEntity | undefined> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  async createPost({
    adminId,
    companyId,
    ...createPostDetails
  }: CreatePostParams) {
    const admin = await this.adminRepository.findOneBy({ id: adminId });
    const company = await this.companyRepository.findOneBy({ id: companyId });

    if (!admin || !company)
      throw new HttpException(
        'Authentication ID or Compay not found. Cannot create Post',
        HttpStatus.BAD_REQUEST,
      );
    const newPost = this.postRepository.create({
      ...createPostDetails,
      admin,
      company,
    });
    try {
      await this.postRepository.save(newPost);
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

  async updatePost(
    id: number,
    { companyId, adminId, ...updatePostDetails }: UpdatePostParams,
  ): Promise<{ success: boolean; message: string }> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new HttpException('Post not Found.', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyRepository.findOneBy({ id: companyId });
    if (!company) {
      throw new HttpException('Company not Found.', HttpStatus.BAD_REQUEST);
    }

    try {
      // ลบ adminId ออกจาก updatePostDetails หากไม่ได้ใช้ใน PostEntity
      const result = await this.postRepository.update(id, {
        ...updatePostDetails,
        company,
      });

      // ตรวจสอบว่ามีแถวถูกอัปเดตหรือไม่
      if (result.affected === 0) {
        throw new HttpException(
          'Failed to update post.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        success: true,
        message: 'Successfully updated post',
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'An error occurred while updating the post',
      };
    }
  }

  async deletePost(id: number): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    await this.postRepository.remove(post);

    return { message: `Post with id ${id} has been successfully deleted` };
  }

  async createBookmark(userId: number, postId: number) {
    const existing = await this.bookmarkRepository.findOne({
      where: {
        user: { id: userId },
        // print userId
        post: { id: postId },
      },
    });

    if (existing) {
      throw new HttpException('Already bookmarked', HttpStatus.CONFLICT);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    const post = await this.postRepository.findOneBy({ id: postId });

    if (!user || !post) {
      throw new NotFoundException('User or Post not found');
    }

    const bookmark = this.bookmarkRepository.create({ user, post });
    return this.bookmarkRepository.save(bookmark);
  }

  async removeBookmark(userId: number, postId: number) {
    const existing = await this.bookmarkRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Bookmark not found');
    }

    return this.bookmarkRepository.remove(existing);
  }
  // get bookmark for know this user bookmark this post or not
  // getBookmark(@Param('id') postId: number, @Request() req) {
  async getBookmark(
    postId: number,
    userId: number,
  ): Promise<BookmarkEntity | null> {
    // console.log('getBookmark_from_post', postId);
    // console.log('getBookmark_from_user', userId);
    // print all data in bookmark table
    // console.log('getBookmark_ฝfrom_bookmark', await this.bookmarkRepository.find());
    const bookmark = await this.bookmarkRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
      relations: ['user', 'post'],
    });

    if (!bookmark) {
      return null;
    }
    return bookmark;
  }
  // เพิ่มใน PostsService
  async toggleBookmark(
    postId: number,
    userId: number,
  ): Promise<BookmarkEntity | null> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['bookmark', 'bookmark.user'],
    });

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!post || !user) throw new NotFoundException('Post or User not found');

    const existing = post.bookmark.find((b) => b.user.id === user.id);

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return null;
    }

    const newBookmark = this.bookmarkRepository.create({ post, user });
    return await this.bookmarkRepository.save(newBookmark);
  }

  async getBookmarkCount(postId: number): Promise<number> {
    return this.bookmarkRepository.count({
      where: { post: { id: postId } },
    });
  }

  async forceDeleteBookmark(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['bookmark'],
    });

    if (post) await this.bookmarkRepository.remove(post.bookmark);
  }

  async findAllWithBookmarkStatus(userId: number) {
    const posts = await this.postRepository.find({
      relations: ['bookmarks', 'company'], // ensure bookmark relation
    });

    return posts.map((post) => ({
      ...post,
      isBookmarked: post.bookmarks.some(
        (bookmark) => bookmark.user.id === userId,
      ),
    }));
  }

  async findBookmarkedByUser(userId: number) {
    // ใช้ query builder เพื่อดึงโพสต์ที่ถูก bookmark โดยผู้ใช้
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.bookmarks', 'bookmark')
      .innerJoinAndSelect('bookmark.user', 'user')
      .innerJoinAndSelect('post.company', 'company')
      .where('user.id = :userId', { userId })
      .getMany();

    return {
      success: true,
      message: 'Successfully retrieved bookmarked posts',
      data: posts,
    };
  }
}
