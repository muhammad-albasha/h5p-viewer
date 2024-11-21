// PlayH5p.js
import { H5P } from "h5p-standalone";
import React, { useEffect, useRef } from "react";

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    const el = h5pContainer.current;
    const baseUrl = process.env.PUBLIC_URL || "";

    const options = {
      h5pJsonPath: `${baseUrl}/${h5pJsonPath}`,
      frameJs: `${baseUrl}/assets/frame.bundle.js`,
      frameCss: `${baseUrl}/assets/h5p.css`,
    };

    new H5P(el, options)
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.log("Error: ", e);
      });
  }, [h5pJsonPath]);

  return <div ref={h5pContainer}></div>;
}

export default PlayH5p;
