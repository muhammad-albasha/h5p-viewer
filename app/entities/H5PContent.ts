import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, OneToMany } from 'typeorm';
import { SubjectArea } from './SubjectArea';
import { Tag } from './Tag';

@Entity('h5p_content')
export class H5PContent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255, name: 'file_path' })
  filePath!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'cover_image_path' })
  coverImagePath?: string;
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'content_type' })
  contentType?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => SubjectArea, subjectArea => subjectArea.content, { nullable: true })
  @JoinColumn({ name: 'subject_area_id' })
  subjectArea?: SubjectArea;

  @Column({ type: 'int', nullable: true, name: 'subject_area_id' })
  subjectAreaId?: number;
  @ManyToOne("User", "createdContent", { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: any;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  createdById?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => Tag, tag => tag.content)
  @JoinTable({
    name: 'content_tags',
    joinColumn: { name: 'content_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags!: Tag[];
  @OneToMany("FeaturedContent", "content")
  featuredContent!: any[];
}
