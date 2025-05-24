import React from 'react';
import { FiSettings } from 'react-icons/fi';

const Header = () => {
  return (
    <header className="bg-base-100 py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-xl">
            H5P
          </div>
          <span className="ml-3 text-xl font-semibold">H5P Viewer</span>
        </div>
        
        <button 
          className="btn btn-circle btn-ghost" 
          aria-label="Einstellungen" 
          title="Einstellungen"
        >
          <FiSettings size={20} />
          <span className="sr-only">Einstellungen</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
