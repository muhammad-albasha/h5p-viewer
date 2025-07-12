import { DataSource, Repository } from "typeorm";
import { PageSettings } from "@/app/entities";
import { AppDataSource } from "@/app/lib/datasource";

export class PageSettingsService {
  private dataSource: DataSource;
  private pageSettingsRepo: Repository<PageSettings>;

  constructor() {
    this.dataSource = AppDataSource;
    this.pageSettingsRepo = this.dataSource.getRepository(PageSettings);
  }

  private async getRepository(): Promise<Repository<PageSettings>> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    return this.pageSettingsRepo;
  }

  async findByKey(key: string): Promise<PageSettings | null> {
    const repo = await this.getRepository();
    return repo.findOne({ where: { key } });
  }

  async findAll(): Promise<PageSettings[]> {
    const repo = await this.getRepository();
    return repo.find({ order: { key: "ASC" } });
  }

  async upsert(
    key: string,
    value: string,
    description?: string
  ): Promise<PageSettings> {
    const repo = await this.getRepository();

    // Try to find existing setting
    let setting = await repo.findOne({ where: { key } });

    if (setting) {
      // Update existing
      setting.value = value;
      if (description !== undefined) {
        setting.description = description;
      }
      return repo.save(setting);
    } else {
      // Create new
      const newSetting = repo.create({
        key,
        value,
        description,
      });
      return repo.save(newSetting);
    }
  }

  async delete(key: string): Promise<boolean> {
    const repo = await this.getRepository();
    const result = await repo.delete({ key });
    return (
      result.affected !== undefined &&
      result.affected !== null &&
      result.affected > 0
    );
  }

  // Helper method to get hero section settings
  async getHeroSettings(): Promise<{
    title: string;
    subtitle: string;
    description: string;
  }> {
    const settings = await this.findAll();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      title: settingsMap["hero_title"] || "H5P-Viewer",
      subtitle:
        settingsMap["hero_subtitle"] ||
        "Interaktive Lerninhalte für dein Studium",
      description:
        settingsMap["hero_description"] ||
        "Entdecke eine vielfältige Sammlung von interaktiven H5P-Elementen, die das Lernen spannend und effektiv machen. Von Quizzes über Präsentationen bis hin zu interaktiven Videos – hier findest du alles für ein modernes Lernerlebnis.",
    };
  }

  // Initialize default settings
  async initializeDefaultSettings(): Promise<void> {
    try {
      // Check if hero settings already exist
      const existingSettings = await this.getHeroSettings();

      // If any hero setting exists, don't initialize defaults
      if (
        existingSettings.title ||
        existingSettings.subtitle ||
        existingSettings.description
      ) {
        console.log("Hero settings already exist, skipping initialization");
        return;
      }

      // Create default hero settings
      const defaultHeroSettings = {
        title: "H5P-Viewer",
        subtitle: "Interaktive Lerninhalte für dein Studium",
        description:
          "Entdecke eine vielfältige Sammlung von interaktiven H5P-Elementen, die das Lernen spannend und effektiv machen. Von Quizzes über Präsentationen bis hin zu interaktiven Videos – hier findest du alles für ein modernes Lernerlebnis.",
      };

      await this.updateHeroSettings(defaultHeroSettings);
      console.log("Default hero settings initialized");
    } catch (error) {
      console.error("Error initializing default page settings:", error);
      // Don't throw error to avoid breaking database initialization
    }
  }
  // Helper method to update hero settings
  async updateHeroSettings(settings: {
    title: string;
    subtitle: string;
    description: string;
  }): Promise<void> {
    await this.upsert("hero_title", settings.title);
    await this.upsert("hero_subtitle", settings.subtitle);
    await this.upsert("hero_description", settings.description);
  }
}
