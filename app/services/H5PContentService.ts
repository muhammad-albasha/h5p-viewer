import { Repository, In } from 'typeorm';
import { H5PContent } from '../entities/H5PContent';
import { Tag } from '../entities/Tag';
import { SubjectArea } from '../entities/SubjectArea';
import { getDataSource } from '../lib/datasource';

export interface CreateH5PContentData {
  title: string;
  filePath: string;
  coverImagePath?: string;
  contentType?: string;
  subjectAreaId?: number;
  createdById?: number;
  tagIds?: number[];
}

export interface UpdateH5PContentData {
  title?: string;
  coverImagePath?: string;
  contentType?: string;
  subjectAreaId?: number;
  tagIds?: number[];
}

export class H5PContentService {
  private h5pContentRepository!: Repository<H5PContent>;
  private tagRepository!: Repository<Tag>;

  private async getRepositories(): Promise<{ h5pContentRepo: Repository<H5PContent>; tagRepo: Repository<Tag> }> {
    if (!this.h5pContentRepository || !this.tagRepository) {
      const dataSource = await getDataSource();
      this.h5pContentRepository = dataSource.getRepository(H5PContent);
      this.tagRepository = dataSource.getRepository(Tag);
    }
    return { 
      h5pContentRepo: this.h5pContentRepository, 
      tagRepo: this.tagRepository 
    };
  }

  async findAll(): Promise<H5PContent[]> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.find({
      relations: ['tags', 'subjectArea', 'createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number): Promise<H5PContent | null> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.findOne({
      where: { id },
      relations: ['tags', 'subjectArea', 'createdBy']
    });
  }

  async findByIdWithDetails(id: number): Promise<H5PContent | null> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.findOne({
      where: { id },
      relations: ['tags', 'subjectArea', 'createdBy']
    });
  }

  async findBySlug(slug: string): Promise<H5PContent | null> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.findOne({
      where: { slug },
      relations: ['tags', 'subjectArea', 'createdBy']
    });
  }

  async findBySubjectArea(subjectAreaId: number): Promise<H5PContent[]> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.find({
      where: { subjectAreaId },
      relations: ['tags', 'subjectArea', 'createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByTags(tagIds: number[]): Promise<H5PContent[]> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .leftJoinAndSelect('content.subjectArea', 'subjectArea')
      .leftJoinAndSelect('content.createdBy', 'createdBy')
      .where('tag.id IN (:...tagIds)', { tagIds })
      .orderBy('content.createdAt', 'DESC')
      .getMany();
  }

  async findBySubjectAreaAndTags(subjectAreaId: number, tagIds: number[]): Promise<H5PContent[]> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .leftJoinAndSelect('content.subjectArea', 'subjectArea')
      .leftJoinAndSelect('content.createdBy', 'createdBy')
      .where('content.subjectAreaId = :subjectAreaId', { subjectAreaId })
      .andWhere('tag.id IN (:...tagIds)', { tagIds })
      .orderBy('content.createdAt', 'DESC')
      .getMany();
  }

  async create(data: CreateH5PContentData): Promise<H5PContent> {
    const { h5pContentRepo, tagRepo } = await this.getRepositories();
    
    // Generate slug from title
    const slug = await this.generateUniqueSlug(data.title);
    
    // Create content entity
    const content = h5pContentRepo.create({
      title: data.title,
      slug,
      filePath: data.filePath,
      coverImagePath: data.coverImagePath,
      contentType: data.contentType,
      subjectAreaId: data.subjectAreaId,
      createdById: data.createdById
    });
    
    // Save content first
    const savedContent = await h5pContentRepo.save(content);
    
    // Add tags if provided
    if (data.tagIds && data.tagIds.length > 0) {
      const tags = await tagRepo.findBy({ id: In(data.tagIds) });
      savedContent.tags = tags;
      await h5pContentRepo.save(savedContent);
    }
    
    // Return with relations
    return this.findById(savedContent.id) as Promise<H5PContent>;
  }

  async update(id: number, data: UpdateH5PContentData): Promise<H5PContent | null> {
    const { h5pContentRepo, tagRepo } = await this.getRepositories();
    
    const content = await h5pContentRepo.findOne({ 
      where: { id },
      relations: ['tags'] 
    });
    
    if (!content) {
      return null;
    }
    
    // Update basic fields
    if (data.title !== undefined) content.title = data.title;
    if (data.coverImagePath !== undefined) content.coverImagePath = data.coverImagePath;
    if (data.contentType !== undefined) content.contentType = data.contentType;
    if (data.subjectAreaId !== undefined) content.subjectAreaId = data.subjectAreaId;
    
    // Update tags if provided
    if (data.tagIds !== undefined) {
      if (data.tagIds.length > 0) {
        const tags = await tagRepo.findBy({ id: In(data.tagIds) });
        content.tags = tags;
      } else {
        content.tags = [];
      }
    }
    
    await h5pContentRepo.save(content);
    
    // Return with relations
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const { h5pContentRepo } = await this.getRepositories();
    const result = await h5pContentRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async searchByTitle(searchTerm: string): Promise<H5PContent[]> {
    const { h5pContentRepo } = await this.getRepositories();
    return h5pContentRepo.createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .leftJoinAndSelect('content.subjectArea', 'subjectArea')
      .leftJoinAndSelect('content.createdBy', 'createdBy')
      .where('content.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('content.createdAt', 'DESC')
      .getMany();
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const { h5pContentRepo } = await this.getRepositories();
    
    let baseSlug = title
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const replacements: { [key: string]: string } = {
          'ä': 'ae',
          'ö': 'oe', 
          'ü': 'ue',
          'ß': 'ss'
        };
        return replacements[match] || match;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await h5pContentRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }
}
