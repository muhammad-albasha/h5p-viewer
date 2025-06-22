import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Tag } from './Tag';
import { SubjectArea } from './SubjectArea';

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
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;
  @Column({ type: 'int', nullable: true, name: 'subject_area_id' })
  subjectAreaId?: number;

  @ManyToOne(() => SubjectArea)
  @JoinColumn({ name: 'subject_area_id' })
  subjectArea?: SubjectArea;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  createdById?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'content_tags',
    joinColumn: { name: 'content_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags!: Tag[];
}
