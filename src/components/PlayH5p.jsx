import React, { useEffect, useRef } from "react";
import { H5P } from "h5p-standalone";

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    console.log("H5P JSON Path:", h5pJsonPath);

    // Initiale Optionen mit CDN-Ressourcen
    let options = {
      h5pJsonPath,
      frameJs:
        "https://cdn.jsdelivr.net/npm/h5p-standalone/dist/frame.bundle.js",
      frameCss:
        "https://cdn.jsdelivr.net/npm/h5p-standalone/dist/styles/h5p.css",
    };

    // Überprüfen, ob die CDN-Ressourcen verfügbar sind
    fetch(options.frameCss)
      .then((response) => {
        if (!response.ok) {
          console.warn(
            "CDN-Ressourcen nicht verfügbar, lokaler Fallback wird verwendet."
          );

          // Fallback auf lokale Dateien
          options = {
            ...options,
            frameJs: `${process.env.PUBLIC_URL}/assets/frame.bundle.js`,
            frameCss: `${process.env.PUBLIC_URL}/assets/h5p.css`,
          };
        }
      })
      .catch(() => {
        console.error(
          "Fehler beim Laden der CDN-Ressourcen. Lokaler Fallback wird verwendet."
        );
        options = {
          ...options,
          frameJs: `${process.env.PUBLIC_URL}/assets/frame.bundle.js`,
          frameCss: `${process.env.PUBLIC_URL}/assets/h5p.css`,
        };
      })
      .finally(() => {
        // Initialisiere H5P mit den aktualisierten Optionen
        new H5P(h5pContainer.current, options)
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
