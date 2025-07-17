import "reflect-metadata";
import { getDataSource } from "./datasource";
import { UserService } from "../services";

// Legacy export for backward compatibility
export { getDataSource as pool };

// Function to initialize the database schema and default data
export async function initializeDatabase() {
  try {
    // Initialize TypeORM data source (this will create tables if synchronize is true)
    const dataSource = await getDataSource();
    
    if (!dataSource.isInitialized) {
      throw new Error("Database initialization failed - data source not initialized");
    }

    // Check database connectivity
    try {
      await dataSource.query("SELECT 1");
      console.log("Database connection verified successfully");
    } catch (connectionError) {
      console.error("Database connectivity test failed:", connectionError);
      throw connectionError;
    }

    // Initialize default users
    const userService = new UserService();
    await userService.initializeDefaultUsers();

    console.log("Database initialized successfully with TypeORM");
    return dataSource;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
