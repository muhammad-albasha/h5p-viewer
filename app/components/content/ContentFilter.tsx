"use client";

import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface ContentFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  availableTags: string[];
  toggleTag: (tag: string) => void;
}

const ContentFilter = ({
  searchQuery,
  setSearchQuery,
  selectedTags,
  availableTags,
  toggleTag
}: ContentFilterProps) => {
  return (
    <div className="mb-8 bg-base-100 rounded-box p-4 shadow-lg">
      <div className="form-control">
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Inhalte suchen..." 
            className="input input-bordered w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-square" aria-label="Suchen" title="Suchen">
            <FiSearch />
            <span className="sr-only">Suchen</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Filter nach Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              className={`badge badge-outline ${
                selectedTags.includes(tag) ? "badge-primary" : ""
              } p-3 cursor-pointer`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentFilter;
