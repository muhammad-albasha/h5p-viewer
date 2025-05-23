import Image from "next/image";
import PlayH5p from "./componets/PlayH5p";

export default function Home() {
  return (
    <div className="">
      <header className="">
      </header>
      <main>
        <div className="">
          <PlayH5p h5pJsonPath="/h5p/for-or-since" />
        </div>
      </main>
      <footer className="">
      </footer>
    </div>
  );
}
