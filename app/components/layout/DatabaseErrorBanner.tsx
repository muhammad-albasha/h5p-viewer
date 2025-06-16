"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface DatabaseErrorBannerProps {
  error?: string;
}

export default function DatabaseErrorBanner({ error }: DatabaseErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-error text-error-content p-4 relative">
      <div className="container-fluid mx-auto  flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Datenbank-Verbindungsfehler</p>
            <p className="text-sm text-error-content/80">
              {error || 'Die Verbindung zur Datenbank konnte nicht hergestellt werden.'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/about" className="btn btn-sm btn-outline border-error-content/20 text-error-content">
            Hilfe
          </Link>
          <button 
            onClick={() => setIsVisible(false)} 
            className="btn btn-sm btn-ghost text-error-content"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
