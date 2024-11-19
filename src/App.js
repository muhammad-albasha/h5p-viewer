import PlayH5p from "./components/PlayH5p";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>H5P Standalone in React</h1>
      <h2>For or Since</h2>
      <PlayH5p h5pJsonPath="./h5p/advent" />
    </div>
  );
}
