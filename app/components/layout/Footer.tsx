'use client';

export default function Footer() {
  return (
    <footer className="bg-base-300 text-base-content p-10 border-t border-base-200">
      <div className="container mx-auto max-w-6xl">
        {/* Footer Columns Grid */}        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-2">
            <span className="footer-title text-lg font-semibold mb-2">H5P-Viewer</span>
            <p className="max-w-xs text-sm opacity-80">
              Eine Plattform für interaktive Lernmaterialien.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="footer-title text-lg font-semibold mb-2">Links</span>
            <a href="/about" className="link link-hover text-sm">Über uns</a>
            <a href="/contact" className="link link-hover text-sm">Kontakt</a>
            <a href="/easy-language" className="link link-hover text-sm">Leichte Sprache</a>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="footer-title text-lg font-semibold mb-2">Ressourcen</span>
            <a href="/h5p" className="link link-hover text-sm">Alle Inhalte</a>
            <a href="/fachbereich" className="link link-hover text-sm">Fachbereiche</a>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="footer-title text-lg font-semibold mb-2">Rechtliches</span>
            <a href="/imprint" className="link link-hover text-sm">Impressum</a>
            <a href="/privacy" className="link link-hover text-sm">Datenschutz</a>
            <a href="/copyright" className="link link-hover text-sm">Urheberrecht</a>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-8 border-t border-base-200 pt-6 text-center text-sm opacity-60">
          <p>
            © {new Date().getFullYear()} H5P-Viewer powered by <a href="https://medialab-projekte.uni-wuppertal.de/user/Home/Privacy" className="link link-hover">Medialab</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
