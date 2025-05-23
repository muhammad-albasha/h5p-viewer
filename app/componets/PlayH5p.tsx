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
  }, [h5pJsonPath]);

  return (
    <>
      {loading && <div className="p-4 text-center">Loading H5P content...</div>}
      {error && <div className="p-4 text-red-500">Error: {error}</div>}
      <div ref={h5pContainer}></div>
    </>
  );
}

export default PlayH5p;
