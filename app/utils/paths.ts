const BASE_PATH = '/h5p-viewer';

export function getBasePath(): string {
  return BASE_PATH;
}

export function withBasePath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  if (path.startsWith('/api/')) {
    return `${BASE_PATH}${path}`;
  }
  
  if (path.startsWith('/')) {
    return `${BASE_PATH}${path}`;
  }
  
  return path;
}

export function withoutBasePath(path: string): string {
  if (path.startsWith(BASE_PATH)) {
    return path.substring(BASE_PATH.length) || '/';
  }
  return path;
}
