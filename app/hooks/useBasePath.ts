"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useBasePath() {
  const router = useRouter();
  const [basePath, setBasePath] = useState('');

  useEffect(() => {
    // Get the current pathname to determine if we're running with basePath
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/h5p-viewer')) {
      setBasePath('/h5p-viewer');
    } else {
      setBasePath('');
    }
  }, []);

  const withBasePath = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
      return path;
    }
    
    // For API calls and static assets, add basePath if it exists
    if (path.startsWith('/api/') || path.startsWith('/assets/') || path.startsWith('/uploads/') || path.startsWith('/h5p/')) {
      if (basePath && !path.startsWith(basePath)) {
        return `${basePath}${path}`;
      }
    }
    
    return path;
  };

  return { basePath, withBasePath };
}
