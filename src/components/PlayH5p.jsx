import React, { useEffect, useRef } from "react";
import { H5P } from "h5p-standalone";

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    let adjustedPath = h5pJsonPath;

    if (
      process.env.NODE_ENV === "production" &&
      window.location.protocol === "https:" &&
      adjustedPath.startsWith("http:")
    ) {
      adjustedPath = adjustedPath.replace("http:", "https:");
    }

    const options = {
      h5pJsonPath: adjustedPath,
      frameJs: `${process.env.PUBLIC_URL}/assets/frame.bundle.js`,
      frameCss: `${process.env.PUBLIC_URL}/assets/h5p.css`,
    };

    new H5P(h5pContainer.current, options)
      .then((res) => {
        console.log("H5P erfolgreich geladen:", res);
      })
      .catch((e) => {
        console.error("Fehler beim Laden von H5P:", e);
      });
  }, [h5pJsonPath]);

  return <div ref={h5pContainer}></div>;
}

export default PlayH5p;
