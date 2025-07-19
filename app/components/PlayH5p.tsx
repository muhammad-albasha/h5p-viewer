"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PlayH5p.module.css";
import { withBasePath } from "../utils/paths";

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

        // Ensure path is correctly formatted for the H5P library
        // The library expects a directory path and will append h5p.json itself
        let correctPath = h5pJsonPath;
        
        console.log("Original H5P path:", h5pJsonPath);

        // Remove h5p.json from the end if it exists
        if (correctPath.endsWith("/h5p.json")) {
          correctPath = correctPath.substring(0, correctPath.length - 9); // Remove '/h5p.json'
        }

        // Remove leading /h5p/ if present to get just the content directory name
        if (correctPath.startsWith("/h5p/")) {
          correctPath = correctPath.substring(5); // Remove '/h5p/'
        }
        
        // Handle absolute URLs if they were passed
        if (correctPath.includes("://")) {
          const url = new URL(correctPath);
          correctPath = url.pathname;
          
          // Check again for /h5p/ after extracting pathname
          if (correctPath.startsWith("/h5p/")) {
            correctPath = correctPath.substring(5);
          }
        }
        
        // Remove trailing slash if present
        if (correctPath.endsWith("/")) {
          correctPath = correctPath.substring(0, correctPath.length - 1);
        }
        
        console.log("Processed H5P path:", correctPath);

        // Loading H5P from specified path using our API route
        const h5p = new H5PConstructor(el, {
          h5pJsonPath: withBasePath(`/api/h5p/${correctPath}`), // Path to the directory containing h5p.json via API
          frameJs: withBasePath("/assets/frame.bundle.js"),
          frameCss: withBasePath("/assets/styles/h5p.css"),
        });

        h5p
          .then(() => {
            // H5P loaded successfully
            setLoading(false);
          })
          .catch((err: Error) => {
            // H5P initialization error
            console.error("H5P loading error:", err);
            
            // Check if this is a 404 error (content not found)
            if (err.message.includes("404") || err.message.includes("Not Found")) {
              setError("Der angeforderte H5P-Inhalt wurde nicht gefunden. Möglicherweise wurde er gelöscht oder ist temporär nicht verfügbar.");
            } else {
              setError(`Fehler beim Laden des H5P-Inhalts: ${err.message}`);
            }
            setLoading(false);
          });
      } catch (e) {
        // Error loading H5P
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };

    loadH5P();
  }, [h5pJsonPath]);
  return (
    <div
      className={`${styles.h5pStyleWrapper} w-full bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-lg`}
    >
      {" "}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8 p-12 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-xl">
          {/* Modern H5P Loading Animation */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
            </div>

            {/* Middle rotating ring */}
            <div
              className={`absolute top-2 left-2 w-16 h-16 border-4 border-purple-200 rounded-full animate-spin ${styles.spinnerMiddle}`}
            >
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
            </div>

            {/* Inner rotating ring */}
            <div
              className={`absolute top-4 left-4 w-12 h-12 border-4 border-pink-200 rounded-full animate-spin ${styles.spinnerInner}`}
            >
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
            </div>

            {/* Center H5P icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              H5P Inhalt wird geladen
            </h3>
            <p className="text-gray-600">
              Interaktives Lernmaterial wird vorbereitet...
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className={`w-2 h-2 bg-purple-500 rounded-full animate-bounce ${styles.bounceDelay1}`}
              ></div>
              <div
                className={`w-2 h-2 bg-pink-500 rounded-full animate-bounce ${styles.bounceDelay2}`}
              ></div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-red-600">
                Fehler beim Laden des H5P-Inhalts
              </h3>
              <div className="text-sm text-gray-600 mb-4">{error}</div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                onClick={() => window.location.reload()}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Neu laden
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        ref={h5pContainer}
        className={`h5p-container-fluid w-full relative z-10 ${
          error || loading
            ? styles.h5pcontainerFluidHidden
            : styles.h5pcontainerFluid
        }`}
      ></div>
    </div>
  );
}

export default PlayH5p;
