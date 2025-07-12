"use client";

import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const WelcomeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6 relative animate-fade-in-down rounded-lg">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-base-content/70 hover:text-base-content transition-colors p-1 rounded-full hover:bg-base-200/50"
        aria-label="Meldung schließen"
      >
        <FiX size={18} />
      </button>

      <h2 className="text-xl font-semibold mb-2 text-primary">
        Willkommen zum H5P Viewer und Verwaltungssystem
      </h2>
      <p className="mb-2">
        Dieses System ermöglicht das Anzeigen und Verwalten von H5P-Inhalten
        ohne Registrierung.
      </p>

      <div className="bg-base-100 p-3 rounded-md border border-base-300 mt-3">
        <h3 className="text-sm font-semibold mb-1">Login-Informationen:</h3>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <p className="text-sm font-mono bg-base-200/70 px-2 py-1 rounded">
            Benutzername: <span className="font-bold">admin</span>
          </p>
          <p className="text-sm font-mono bg-base-200/70 px-2 py-1 rounded">
            Passwort: <span className="font-bold">admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
