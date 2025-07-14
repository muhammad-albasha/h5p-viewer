import path from 'path';

const BASE_PATH = '/h5p-viewer';

export function getBasePath(): string {
  return BASE_PATH;
}

export function withBasePath(pathStr: string): string {
  if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('//')) {
    return pathStr;
  }
  
  // For API calls and static assets, always add basePath in browser context
  if (pathStr.startsWith('/api/') || pathStr.startsWith('/assets/') || pathStr.startsWith('/uploads/') || pathStr.startsWith('/h5p/')) {
    // Check if basePath is already included
    if (!pathStr.startsWith(BASE_PATH)) {
      return `${BASE_PATH}${pathStr}`;
    }
    return pathStr;
  }
  
  // For regular navigation paths, return as-is since Next.js handles basePath
  return pathStr;
}

export function withoutBasePath(pathStr: string): string {
  if (pathStr.startsWith(BASE_PATH)) {
    return pathStr.substring(BASE_PATH.length) || '/';
  }
  return pathStr;
}

/**
 * Normalize file paths for cross-platform compatibility
 * Converts Windows-style paths to POSIX-style paths
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Create a safe file path that works on both Windows and Linux
 */
export function createSafePath(...segments: string[]): string {
  return path.posix.join(...segments.map(segment => segment.replace(/\\/g, '/')));
}

/**
 * Get the public directory path with cross-platform compatibility
 */
export function getPublicPath(...segments: string[]): string {
  return path.join(process.cwd(), 'public', ...segments);
}

/**
 * Get uploads directory path with cross-platform compatibility
 */
export function getUploadsPath(...segments: string[]): string {
  return path.join(process.cwd(), 'public', 'uploads', ...segments);
}

/**
 * Get H5P folder path for a specific slug
 */
export function getH5PFolderPath(slug: string): string {
  return getPublicPath('h5p', slug);
}

/**
 * Get all H5P folders path
 */
export function getH5PBasePath(): string {
  return getPublicPath('h5p');
}
