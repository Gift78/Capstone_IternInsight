import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'admins' })
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => PostEntity, (post) => post.admin, { cascade: true })
  posts: PostEntity[];
}
