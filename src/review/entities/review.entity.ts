import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Review')
export class Reviews {
  @PrimaryGeneratedColumn()
  Review_ID: number;

  @Column()
  User_ID: number;

  @Column({ type: 'varchar', length: 255 })
  Title: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'date', nullable: true })
  Date: Date;

  @Column({ type: 'int', default: 0 })
  Like_Count: number;

  @Column({ type: 'boolean', default: false })
  IsQuestion: boolean;
}
