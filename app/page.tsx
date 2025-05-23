import Image from "next/image";
import PlayH5p from "./componets/PlayH5p";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">H5P Viewer</h1>
        <p className="text-gray-600">Interactive H5P Content</p>
      </header>
      <main>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">H5P Example: For or Since</h2>
          <PlayH5p h5pJsonPath="/h5p/for-or-since" />
        </div>
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>H5P Viewer Demo</p>
      </footer>
    </div>
  );
}
