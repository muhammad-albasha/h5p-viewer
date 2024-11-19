import React from "react";
import PlayH5pGrid from "./components/PlayH5pGrid";
import "./styles.css";
import h5pData from "./h5pPaths.json";

export default function App() {
  return (
    <div className="App">
      <h1>H5P Standalone in React</h1>
      <PlayH5pGrid h5pData={h5pData} />
    </div>
  );
}
