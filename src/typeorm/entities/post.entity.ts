import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from './admin.entity';
import { CompanyEntity } from './company.entity';
import { BookmarkEntity } from './bookmark.entity';

@Entity({ name: 'posts' })
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => AdminEntity, (admin) => admin.posts)
  admin: AdminEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.posts)
  company: CompanyEntity;

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post, {
    cascade: true,
  })
  bookmark: BookmarkEntity[];

  @Column('text')
  description: string;

  @Column('simple-array')
  position: string[];

  @Column({ nullable: true })
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  email: string;

  @Column()
  tel: string;
}
