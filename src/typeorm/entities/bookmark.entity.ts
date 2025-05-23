import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'bookmark' })
export class BookmarkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.user)
  bookmarks: BookmarkEntity[];
}
