const BASE_PATH = '/h5p-viewer';

export function getBasePath(): string {
  return BASE_PATH;
}

export function withBasePath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Add basePath for API calls and assets (but not for page navigation)
  if (path.startsWith('/api/') || path.startsWith('/assets/') || path.startsWith('/uploads/') || path.startsWith('/h5p/')) {
    return `${BASE_PATH}${path}`;
  }
  
  // For regular navigation paths, return as-is since Next.js handles basePath
  return path;
}

export function withoutBasePath(path: string): string {
  if (path.startsWith(BASE_PATH)) {
    return path.substring(BASE_PATH.length) || '/';
  }
  return path;
}

export function getLogoutCallbackUrl(): string {
  // In production, use the production URL
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    return `${protocol}//${host}${BASE_PATH}`;
  }
  
  // Fallback for server-side rendering or when window is not available
  return BASE_PATH || '/';
}
