"use client";

import React from 'react';
import { useFavorites } from '@/app/hooks/useFavorites';

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

interface FavoriteButtonProps {
  content: H5PContent;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'card' | 'header';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  content, 
  className = "", 
  showText = false,
  variant = 'default'
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const isContentFavorite = isFavorite(content.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(content);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return "inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 text-sm";
      case 'header':
        return "inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20";
      default:
        return "inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:scale-105";
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${getVariantClasses()} ${className}`}
      title={isContentFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      aria-label={isContentFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <svg 
        className="w-4 h-4" 
        fill={isContentFavorite ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      {showText && (
        <span className="font-medium">
          {isContentFavorite ? "Favorit" : "Favorit"}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
