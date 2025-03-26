import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { CommentEntity } from './comment.entity';
import { LikedEntity } from './like.entity';
import { BookmarkEntity } from './bookmark.entity';


@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ReviewEntity, (review) => review.user, { cascade: true })
  review: ReviewEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user, { cascade: true })
  comment: CommentEntity[];

  @OneToMany(() => LikedEntity, (like) => like.user, { cascade: true })
  like: LikedEntity[];

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.user, {
    cascade: true,
  })
  bookmark: BookmarkEntity[];

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  description: string;
}