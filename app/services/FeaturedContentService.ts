import { Repository } from "typeorm";
import { FeaturedContent } from "../entities/FeaturedContent";
import { H5PContent } from "../entities/H5PContent";
import { getDataSource } from "../lib/datasource";

export class FeaturedContentService {
  private featuredContentRepository!: Repository<FeaturedContent>;
  private h5pContentRepository!: Repository<H5PContent>;

  private async getRepositories(): Promise<{
    featuredRepo: Repository<FeaturedContent>;
    h5pRepo: Repository<H5PContent>;
  }> {
    if (!this.featuredContentRepository || !this.h5pContentRepository) {
      const dataSource = await getDataSource();
      this.featuredContentRepository =
        dataSource.getRepository(FeaturedContent);
      this.h5pContentRepository = dataSource.getRepository(H5PContent);
    }
    return {
      featuredRepo: this.featuredContentRepository,
      h5pRepo: this.h5pContentRepository,
    };
  }
  async getFeaturedContent(limit: number = 3): Promise<H5PContent[]> {
    const { featuredRepo } = await this.getRepositories();

    const featuredItems = await featuredRepo.find({
      relations: ["content"],
      order: { createdAt: "DESC" },
      take: limit,
    });

    return featuredItems.map((item) => item.content);
  }

  async addToFeatured(contentId: number): Promise<FeaturedContent> {
    const { featuredRepo, h5pRepo } = await this.getRepositories();

    // Check if content exists
    const content = await h5pRepo.findOne({ where: { id: contentId } });
    if (!content) {
      throw new Error("Content not found");
    }

    // Check if already featured
    const existingFeatured = await featuredRepo.findOne({
      where: { contentId },
    });
    if (existingFeatured) {
      throw new Error("Content is already featured");
    }

    const featured = featuredRepo.create({ contentId });
    return featuredRepo.save(featured);
  }

  async removeFromFeatured(contentId: number): Promise<boolean> {
    const { featuredRepo } = await this.getRepositories();
    const result = await featuredRepo.delete({ contentId });
    return (result.affected ?? 0) > 0;
  }

  async isFeatured(contentId: number): Promise<boolean> {
    const { featuredRepo } = await this.getRepositories();
    const featured = await featuredRepo.findOne({ where: { contentId } });
    return !!featured;
  }

  async getLastModified(): Promise<Date | null> {
    const { featuredRepo } = await this.getRepositories();

    const result = await featuredRepo
      .createQueryBuilder("featured")
      .select("MAX(featured.createdAt)", "lastModified")
      .getRawOne();

    return result?.lastModified || null;
  }
}
