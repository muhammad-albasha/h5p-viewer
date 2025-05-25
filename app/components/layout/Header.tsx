import React from 'react';
import Link from 'next/link';
import { FiSettings } from 'react-icons/fi';

const Header = () => {
  return (
    <header className="bg-base-100 py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-xl">
              H5P
            </div>
            <span className="ml-3 text-xl font-semibold">H5P Viewer</span>
          </Link>
        </div>
          <nav className="flex items-center gap-4">          <Link href="/" className="text-base-content hover:text-primary">
            Startseite
          </Link>
          <Link href="/h5p" className="text-base-content hover:text-primary">
            Alle Inhalte
          </Link>
          <Link href="/fachbereich" className="text-base-content hover:text-primary">
            Fachbereiche
          </Link>
          
          <Link 
            href="/admin"
            className="btn btn-circle btn-ghost" 
            aria-label="Admin-Einstellungen" 
            title="Admin-Einstellungen"
          >
            <FiSettings size={20} />
            <span className="sr-only">Einstellungen</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
