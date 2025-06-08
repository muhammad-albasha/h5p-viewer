import { Repository } from 'typeorm';
import { SubjectArea } from '../entities/SubjectArea';
import { getDataSource } from '../lib/datasource';

export class SubjectAreaService {
  private subjectAreaRepository!: Repository<SubjectArea>;

  private async getRepository(): Promise<Repository<SubjectArea>> {
    if (!this.subjectAreaRepository) {
      const dataSource = await getDataSource();
      this.subjectAreaRepository = dataSource.getRepository(SubjectArea);
    }
    return this.subjectAreaRepository;
  }

  async findAll(): Promise<SubjectArea[]> {
    const repo = await this.getRepository();
    return repo.find({
      order: { name: 'ASC' }
    });
  }

  async findById(id: number): Promise<SubjectArea | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<SubjectArea | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { slug } });
  }

  async findByName(name: string): Promise<SubjectArea | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { name } });
  }

  async create(name: string): Promise<SubjectArea> {
    const repo = await this.getRepository();
    
    // Check if subject area already exists
    const existingSubjectArea = await this.findByName(name);
    if (existingSubjectArea) {
      throw new Error('Subject area with this name already exists');
    }
    
    // Generate slug from name
    const slug = this.generateSlug(name);
    
    // Check if slug already exists
    const existingSlug = await this.findBySlug(slug);
    if (existingSlug) {
      throw new Error('Subject area with this slug already exists');
    }
    
    const subjectArea = repo.create({ name, slug });
    return repo.save(subjectArea);
  }

  async update(id: number, name: string): Promise<SubjectArea | null> {
    const repo = await this.getRepository();
    
    // Check if another subject area with this name already exists
    const existingSubjectArea = await repo.findOne({ 
      where: { name },
      select: ['id'] 
    });
    
    if (existingSubjectArea && existingSubjectArea.id !== id) {
      throw new Error('Subject area with this name already exists');
    }
    
    // Generate new slug
    const slug = this.generateSlug(name);
    
    // Check if slug conflicts with another subject area
    const existingSlug = await repo.findOne({ 
      where: { slug },
      select: ['id'] 
    });
    
    if (existingSlug && existingSlug.id !== id) {
      throw new Error('Subject area with this slug already exists');
    }
    
    await repo.update(id, { name, slug });
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const repo = await this.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findSubjectAreasWithContent(): Promise<SubjectArea[]> {
    const repo = await this.getRepository();
    return repo.createQueryBuilder('subjectArea')
      .innerJoin('subjectArea.content', 'content')
      .orderBy('subjectArea.name', 'ASC')
      .getMany();
  }

  private generateSlug(name: string): string {
    return name
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
  }
}
