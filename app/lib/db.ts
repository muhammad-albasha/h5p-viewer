import 'reflect-metadata';
import { getDataSource } from './datasource';
import { UserService } from '../services';

// Legacy export for backward compatibility
export { getDataSource as pool };

// Function to initialize the database schema and default data
export async function initializeDatabase() {
  try {
    // Initialize TypeORM data source (this will create tables if synchronize is true)
    await getDataSource();
    
    // Initialize default users
    const userService = new UserService();
    await userService.initializeDefaultUsers();
    
    console.log('Database initialized successfully with TypeORM');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
