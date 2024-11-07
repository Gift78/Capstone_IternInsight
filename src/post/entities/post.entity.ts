import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Internship_posts')
export class InternshipPost {
  @PrimaryGeneratedColumn()
  Post_ID: number;

  @Column()
  Admin_ID: number;

  @Column()
  Company_ID: number;

  @Column({ nullable: false })
  Position: string;

  @Column({ type: 'date', nullable: true })
  Deadline: Date;
}
