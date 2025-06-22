import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { H5PContent } from './H5PContent';

@Entity('featured_content')
export class FeaturedContent {
  @PrimaryGeneratedColumn()
  id!: number;
  @ManyToOne(() => H5PContent)
  @JoinColumn({ name: 'content_id' })
  content!: H5PContent;

  @Column({ type: 'int', name: 'content_id', unique: true })
  contentId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
