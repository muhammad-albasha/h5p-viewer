import { Repository } from "typeorm";
import { Tag } from "../entities/Tag";
import { getDataSource } from "../lib/datasource";

export class TagService {
  private tagRepository!: Repository<Tag>;

  private async getRepository(): Promise<Repository<Tag>> {
    if (!this.tagRepository) {
      const dataSource = await getDataSource();
      this.tagRepository = dataSource.getRepository(Tag);
    }
    return this.tagRepository;
  }

  async findAll(): Promise<Tag[]> {
    const repo = await this.getRepository();
    return repo.find({
      order: { name: "ASC" },
    });
  }

  async findById(id: number): Promise<Tag | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Tag | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { name } });
  }

  async create(name: string): Promise<Tag> {
    const repo = await this.getRepository();

    // Check if tag already exists
    const existingTag = await this.findByName(name);
    if (existingTag) {
      throw new Error("Tag with this name already exists");
    }

    const tag = repo.create({ name });
    return repo.save(tag);
  }

  async update(id: number, name: string): Promise<Tag | null> {
    const repo = await this.getRepository();

    // Check if another tag with this name already exists
    const existingTag = await repo.findOne({
      where: { name },
      select: ["id"],
    });

    if (existingTag && existingTag.id !== id) {
      throw new Error("Tag with this name already exists");
    }

    await repo.update(id, { name });
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const repo = await this.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findTagsUsedInContent(): Promise<Tag[]> {
    const repo = await this.getRepository();
    return repo
      .createQueryBuilder("tag")
      .innerJoin("tag.content", "content")
      .orderBy("tag.name", "ASC")
      .getMany();
  }
}
