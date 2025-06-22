"use client";

import { useState, useEffect } from 'react';

interface H5PContent {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  coverImagePath?: string;
  description?: string;
  isPasswordProtected?: boolean;
  subject_area?: {
    name: string;
    slug: string;
  } | null;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const storedFavorites = localStorage.getItem('h5p-favorites');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('h5p-favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoading]);

  const addToFavorites = (content: H5PContent) => {
    setFavorites(prev => {
      // Check if already in favorites
      const exists = prev.some(fav => fav.id === content.id);
      if (exists) return prev;
      
      return [...prev, content];
    });
  };

  const removeFromFavorites = (contentId: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== contentId));
  };

  const toggleFavorite = (content: H5PContent) => {
    const isFavorite = favorites.some(fav => fav.id === content.id);
    
    if (isFavorite) {
      removeFromFavorites(content.id);
    } else {
      addToFavorites(content);
    }
  };

  const isFavorite = (contentId: number) => {
    return favorites.some(fav => fav.id === contentId);
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites
  };
};
