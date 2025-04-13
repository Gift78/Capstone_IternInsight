import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { LikedEntity } from './like.entity';

@Entity({ name: 'reviews' })
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.review)
  user: UserEntity;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  date: Date;

  @Column({ default: 0 })
  likeCount: number;

  @Column()
  isQuestion: boolean;

  // @OneToMany(() => CommentEntity, (comment) => comment.review, {
  //   cascade: true,
  // })
  comment: CommentEntity;

  @OneToMany(() => LikedEntity, (like) => like.review, { cascade: true })
  like: LikedEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.review, { cascade: true })
  comments: CommentEntity[];
}
