"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    H5P: any;
    H5PStandalone: any;
  }
}

declare module "h5p-standalone" {
  export const H5P: any;
  export const H5PStandalone: any;
}

interface PlayH5pProps {
  h5pJsonPath: string;
}

function PlayH5p({ h5pJsonPath }: PlayH5pProps) {
  const h5pContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadH5P = async () => {
      try {
        const H5PModule = await import("h5p-standalone");

        let H5PConstructor;
        if (typeof H5PModule.default === "function") {
          H5PConstructor = H5PModule.default;
        } else if (typeof H5PModule.H5P === "function") {
          H5PConstructor = H5PModule.H5P;
        } else if (typeof H5PModule.H5PStandalone === "function") {
          H5PConstructor = H5PModule.H5PStandalone;
        } else {
          throw new Error("Could not find H5P constructor in the module");
        }

        const el = h5pContainer.current;
        const h5p = new H5PConstructor(el, {
          h5pJsonPath,
          frameJs: "/assets/frame.bundle.js",
          frameCss: "/assets/styles/h5p.css",
        });

        h5p
          .then(() => {
            setLoading(false);
          })
          .catch((err: Error) => {
            console.error("H5P initialization error:", err);
            setError(err.message);
            setLoading(false);
          });
      } catch (e) {
        console.error("Error loading H5P:", e);
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };

    loadH5P();
  }, [h5pJsonPath]);  return (
    <div className="bg-base-100 rounded-xl overflow-hidden">
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6 p-12 bg-base-200/50">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 right-0 bottom-0 left-0 m-auto w-16 h-16">
              <div className="absolute w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-t-secondary border-r-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
              <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin-slower"></div>
            </div>
          </div>
          <div>
            <p className="font-medium text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Interaktiver Inhalt wird geladen</p>
            <p className="text-sm text-base-content/60 text-center">Bitte haben Sie einen Moment Geduld</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-base-100 p-6 rounded-xl">
          <div className="flex gap-4 items-start">
            <div className="bg-error/10 p-3 rounded-full text-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Fehler beim Laden des H5P-Inhalts</h3>
              <div className="text-sm text-base-content/70 mb-4">{error}</div>
              <button 
                className="btn btn-sm btn-error btn-outline gap-2" 
                onClick={() => window.location.reload()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Neu laden
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={h5pContainer} 
        className="h5p-container relative z-10"
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: error || loading ? 0 : '300px'
        }}
      ></div>
    </div>
  );
}

export default PlayH5p;
