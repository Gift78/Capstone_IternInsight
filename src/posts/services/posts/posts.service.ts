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
    { companyId, ...updatePostDetails }: UpdatePostParams,
  ) {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new HttpException('Post not Found.', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyRepository.findOneBy({ id: companyId });
    if (!company) {
      throw new HttpException('Company not Found.', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.postRepository.update(id, {
        ...updatePostDetails,
        company,
      });
      return {
        success: true,
        message: 'Successfully updated post',
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  }

  async deletePost(id: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    await this.postRepository.remove(post);
  }

  async createBookMark() {}
}
