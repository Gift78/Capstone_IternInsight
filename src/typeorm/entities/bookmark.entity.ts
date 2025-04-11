import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';

@Entity({ name: 'bookmark' })
export class BookmarkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => UserEntity, (user) => user.bookmark)
  // user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.bookmark)
  post: PostEntity;
}
