'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface SubjectAreaColorContextType {
  setSubjectAreaColor: (color: string | null) => void;
  currentColor: string | null;
}

const SubjectAreaColorContext = createContext<SubjectAreaColorContextType | undefined>(undefined);

export const useSubjectAreaColor = () => {
  const context = useContext(SubjectAreaColorContext);
  if (context === undefined) {
    throw new Error('useSubjectAreaColor must be used within a SubjectAreaColorProvider');
  }
  return context;
};

interface SubjectAreaColorProviderProps {
  children: React.ReactNode;
}

export const SubjectAreaColorProvider: React.FC<SubjectAreaColorProviderProps> = ({ children }) => {
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const setSubjectAreaColor = (color: string | null) => {
    setCurrentColor(color);
    
    // Apply the color as CSS variable override
    if (color) {
      // Convert hex to OKLCH for consistency with DaisyUI
      const oklchColor = hexToOklch(color);
      document.documentElement.style.setProperty('--color-secondary', oklchColor);
      // Also set custom properties for banner gradient
      document.documentElement.style.setProperty('--subject-area-color', color);
      document.documentElement.style.setProperty('--subject-area-color-light', color + '22');
    } else {
      // Remove the override to restore default
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--subject-area-color');
      document.documentElement.style.removeProperty('--subject-area-color-light');
    }
  };

  // Helper function to convert hex to OKLCH (simplified)
  const hexToOklch = (hex: string): string => {
    // Remove the hash if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Convert RGB to OKLCH (simplified approximation)
    // For better conversion, you might want to use a proper color library
    const lightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 100;
    const chroma = Math.sqrt(Math.pow(r - g, 2) + Math.pow(g - b, 2) + Math.pow(b - r, 2)) * 0.5;
    const hue = Math.atan2(g - b, r - g) * 180 / Math.PI;
    
    return `oklch(${lightness.toFixed(1)}% ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
  };

  return (
    <SubjectAreaColorContext.Provider value={{ setSubjectAreaColor, currentColor }}>
      {children}
    </SubjectAreaColorContext.Provider>
  );
};
