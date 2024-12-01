import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ReviewEntity } from './review.entity';

@Entity({ name: 'liked' })
export class LikedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.like)
  user: UserEntity;

  @ManyToOne(() => ReviewEntity, (review) => review.like)
  review: ReviewEntity;
}
