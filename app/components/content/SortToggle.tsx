"use client";

import React from 'react';
import { FiAlignLeft, FiCalendar } from 'react-icons/fi';

type SortOption = 'alphabetical' | 'date';

interface SortToggleProps {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const SortToggle = ({ sortOption, setSortOption }: SortToggleProps) => {
  return (
    <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-lg shadow border border-white/20 p-2">
      <button 
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          sortOption === 'alphabetical' 
            ? 'bg-primary text-white' 
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setSortOption('alphabetical')}
        aria-label="Alphabetisch sortieren"
      >
        <FiAlignLeft className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">A-Z</span>
      </button>
      
      <button 
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          sortOption === 'date' 
            ? 'bg-primary text-white' 
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setSortOption('date')}
        aria-label="Nach Datum sortieren"
      >
        <FiCalendar className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Datum</span>
      </button>
    </div>
  );
};

export default SortToggle;
