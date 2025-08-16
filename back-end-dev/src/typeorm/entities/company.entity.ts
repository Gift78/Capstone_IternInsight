import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'companys' })
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column('text')
  description: string;

  @Column()
  phone: string;

  @OneToMany(() => PostEntity, (post) => post.company, { cascade: true })
  posts: PostEntity;
}
