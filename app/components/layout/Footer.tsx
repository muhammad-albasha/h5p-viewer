"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary dark:bg-black text-white p-6 md:p-8 lg:p-10 border-t border-white responsive-hide-print">
      <div className="container-responsive">
        {/* Footer Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="flex flex-col space-y-3">
            <span className="footer-title text-fluid-lg font-semibold mb-2">
              H5P-Viewer
            </span>
            <p className="max-w-xs text-fluid-sm opacity-80 leading-relaxed">
              Eine Plattform für interaktive Lernmaterialien.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <span className="footer-title text-fluid-lg font-semibold mb-2">
              Links
            </span>
            <Link href="/about" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Über uns
            </Link>
            <Link href="/contact" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Kontakt
            </Link>
            <Link href="/easy-language" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Leichte Sprache
            </Link>
          </div>
          <div className="flex flex-col space-y-3">
            <span className="footer-title text-fluid-lg font-semibold mb-2">
              Ressourcen
            </span>
            <Link href="/h5p" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Alle Inhalte
            </Link>
            <Link href="/bereiche" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Bereiche
            </Link>
          </div>
          <div className="flex flex-col space-y-3">
            <span className="footer-title text-fluid-lg font-semibold mb-2">
              Rechtliches
            </span>
            <Link href="/imprint" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Impressum
            </Link>
            <Link href="https://www.uni-wuppertal.de/de/datenschutz/" target="_blank" rel="noopener noreferrer" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Datenschutz
            </Link>
            <Link href="/copyright" className="link link-hover text-fluid-sm opacity-80 hover:opacity-100 transition-opacity">
              Urheberrecht
            </Link>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="mt-6 md:mt-8 border-t border-base-200 pt-4 md:pt-6 text-center text-fluid-sm opacity-60">
          <p suppressHydrationWarning={true}>
            © {new Date().getFullYear()} H5P-Viewer powered by{" "}
            <Link
              href="https://medialab-projekte.uni-wuppertal.de/user/Home/Privacy"
              className="link link-hover opacity-80 hover:opacity-100 transition-opacity"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Medialab
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
