import fs from 'fs';
import path from 'path';
import { getPublicPath, getUploadsPath } from './paths';

/**
 * Ensure all required directories exist with proper permissions
 */
export function ensureRequiredDirectories(): void {
  const requiredDirs = [
    getPublicPath('h5p'),
    getUploadsPath('h5p'),
    getPublicPath('uploads', 'contacts'),
  ];

  requiredDirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        console.log(`Created directory: ${dir}`);
      }
      
      // Check if directory is writable (Linux-specific)
      try {
        fs.accessSync(dir, fs.constants.W_OK);
      } catch (accessError) {
        console.warn(`Directory ${dir} may not be writable:`, accessError);
      }
    } catch (error) {
      console.error(`Failed to create or access directory ${dir}:`, error);
    }
  });
}

/**
 * Get system information for debugging
 */
export function getSystemInfo(): { platform: string; cwd: string; publicPath: string } {
  return {
    platform: process.platform,
    cwd: process.cwd(),
    publicPath: getPublicPath()
  };
}
