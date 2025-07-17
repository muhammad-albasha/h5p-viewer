import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Tag } from "../entities/Tag";
import { SubjectArea } from "../entities/SubjectArea";
import { H5PContent } from "../entities/H5PContent";
import { FeaturedContent } from "../entities/FeaturedContent";
import { PageSettings } from "../entities/PageSettings";
import { Contact } from "../entities/Contact";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "h5p",
  synchronize: process.env.NODE_ENV === "development", // Auto-sync in development only
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    Tag,
    SubjectArea,
    H5PContent,
    FeaturedContent,
    PageSettings,
    Contact,
  ],
  migrations: [],
  subscribers: [],
});

let isInitialized = false;

export async function getDataSource(): Promise<DataSource> {
  if (!isInitialized) {
    const maxRetries = 3;
    let retries = 0;
    let lastError;

    while (retries < maxRetries) {
      try {
        await AppDataSource.initialize();
        isInitialized = true;
        console.log("Data Source has been initialized successfully!");
        return AppDataSource;
      } catch (err) {
        retries++;
        lastError = err;
        console.error(`Error during Data Source initialization (attempt ${retries}/${maxRetries}):`, err);
        
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = retries * 1000; // 1s, 2s, 3s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error("Failed to initialize database after multiple attempts");
    throw lastError;
  }
  return AppDataSource;
}

export async function closeDataSource(): Promise<void> {
  if (isInitialized && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitialized = false;
    console.log("Data Source has been closed!");
  }
}
