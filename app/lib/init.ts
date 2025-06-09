import 'reflect-metadata';
import { getDataSource } from './datasource';
import { UserService } from '../services';
import { PageSettingsService } from '../services/PageSettingsService';

export async function initializeDatabase() {
  try {
    // Initialize the data source (this will create tables if synchronize is true)
    const dataSource = await getDataSource();
    
    console.log('Database connection established and tables synchronized');
    
    // Initialize default users
    const userService = new UserService();
    await userService.initializeDefaultUsers();
    
    // Initialize default page settings
    const pageSettingsService = new PageSettingsService();
    await pageSettingsService.initializeDefaultSettings();
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Function to close database connection
export async function closeDatabase() {
  try {
    const { closeDataSource } = await import('./datasource');
    await closeDataSource();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
