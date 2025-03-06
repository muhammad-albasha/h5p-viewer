import React, { useEffect, useRef } from "react";
import { H5P } from "h5p-standalone";

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    let adjustedPath = h5pJsonPath;

    if (
      window.location.protocol === "https:" &&
      adjustedPath.startsWith("http:")
    ) {
      adjustedPath = adjustedPath.replace("http:", "https:");
    }
    adjustedPath = adjustedPath.replace(/(\/h5p\/public\/h5p\/)h5p\//, "$1");

    adjustedPath = adjustedPath.replace(/^http:\/\//, "https://");

    console.log("H5P JSON Path:", adjustedPath);

    const options = {
      h5pJsonPath: adjustedPath,
      frameJs:
        "https://cdn.jsdelivr.net/npm/h5p-standalone/dist/frame.bundle.js",
      frameCss:
        "https://cdn.jsdelivr.net/npm/h5p-standalone/dist/styles/h5p.css",
    };

    // Überprüfe, ob die CDN-CSS-Datei geladen werden kann; verwende andernfalls lokale Fallbacks.
    fetch(options.frameCss)
      .then((response) => {
        if (!response.ok) {
          console.warn(
            "CDN-Ressourcen nicht verfügbar, lokaler Fallback wird verwendet."
          );
          return {
            frameJs: `${process.env.PUBLIC_URL}/assets/frame.bundle.js`,
            frameCss: `${process.env.PUBLIC_URL}/assets/h5p.css`,
          };
        }
        return {};
      })
      .catch(() => {
        console.error(
          "Fehler beim Laden der CDN-Ressourcen. Lokaler Fallback wird verwendet."
        );
        return {
          frameJs: `${process.env.PUBLIC_URL}/assets/frame.bundle.js`,
          frameCss: `${process.env.PUBLIC_URL}/assets/h5p.css`,
        };
      })
      .then((fallbackOptions) => {
        const finalOptions = { ...options, ...fallbackOptions };
        new H5P(h5pContainer.current, finalOptions)
          .then((res) => {
            console.log("H5P erfolgreich geladen:", res);
          })
          .catch((e) => {
            console.error("Fehler beim Laden von H5P:", e);
          });
      });
  }, [h5pJsonPath]);

  return <div ref={h5pContainer}></div>;
}

export default PlayH5p;
