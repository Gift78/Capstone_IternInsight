import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ReviewEntity } from './review.entity';

@Entity({ name: 'comment' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.comment)
  user: UserEntity;

  @ManyToMany(() => ReviewEntity, (review) => review.comment)
  review: ReviewEntity;

  @Column()
  text: string;

  @Column()
  date: string;
}
