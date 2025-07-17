/**
 * Server-side utilities for handling API URLs and other server-specific functions
 */
import { getBasePath } from './paths';

/**
 * Constructs a fully qualified API URL for server-side requests
 * @param endpoint API endpoint path (e.g., '/api/contacts')
 * @returns Full URL with proper base path
 */
export function getServerApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 
                  process.env.VERCEL_URL || 
                  'http://localhost:3000';
                  
  const basePath = getBasePath();
  
  // Make sure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Make sure we don't double-prefix with the base path
  return new URL(`${basePath}${normalizedEndpoint}`, baseUrl).toString();
}

/**
 * Logs debugging information in development mode only
 */
export function debugLog(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}
