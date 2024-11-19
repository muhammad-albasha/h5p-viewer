import { H5P } from "h5p-standalone";
import React, { useEffect, useRef } from "react";

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    const el = h5pContainer.current;
    const options = {
      h5pJsonPath,
      frameJs: "/assets/frame.bundle.js",
      frameCss: "/assets/h5p.css",
    };
    return () => {
      new H5P(el, options)
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log("Err: ", e);
        });
    };
  }, [h5pJsonPath, h5pContainer]);

  return (
    <>
      <div ref={h5pContainer}></div>
    </>
  );
}

export default PlayH5p;
