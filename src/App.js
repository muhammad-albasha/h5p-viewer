import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayH5pGrid from "./components/PlayH5pGrid";
import About from "./components/About";
import Datenschutz from "./components/Datenschutz";
import Contact from "./components/contact";
import FacultyMenu from "./components/FacultyMenu";
import FacultyDetail from "./components/FacultyDetail";
import "./styles.css";
import logo from "./logo.svg";
import Login from "./components/Login";

export default function App() {
  const [isContrast, setIsContrast] = useState(false);

  const toggleContrast = () => {
    setIsContrast(!isContrast);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className={`App ${isContrast ? "contrast-mode" : ""}`}>
        <header className="top-banner">
          <button className="contrast-toggle" onClick={toggleContrast}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon-contrast"
            >
              <circle cx="12" cy="12" r="10" fill="black"></circle>
              <path d="M12 2a10 10 0 0 1 0 20z" fill="white"></path>
            </svg>
            {isContrast ? "Kontrast" : "Kontrast"}
          </button>
          <button
            className="contrast-toggle"
            onClick={() =>
              window.open("https://www.uni-wuppertal.de", "_blank")
            }
          >
            Universität Wuppertal
          </button>
          <button
            className="contrast-toggle"
            onClick={() =>
              window.open("https://webmail.uni-wuppertal.de", "_blank")
            }
          >
            Webmail
          </button>
        </header>

        <header className={`banner ${isContrast ? "contrast-banner" : ""}`}>
          <div className="banner-top">
            <FacultyMenu />
            <p className="banner-title">H5P-Viewer</p>
            <div className="banner-logo">
              <img src={logo} alt="Logo" />
            </div>
            <nav className="nav">
              <Link to="/">Startseite</Link>
              <Link to="/about">Über uns</Link>
              <Link to="/Login">Anmelden</Link>
            </nav>
          </div>
        </header>

        {/* Routen */}
        <Routes>
          <Route path="/" element={<PlayH5pGrid />} />
          <Route path="/about" element={<About />} />
          <Route path="/:name" element={<FacultyDetail />} />
          <Route path="/Datenschutz" element={<Datenschutz />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Login" element={<Login />} />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <nav>
            <Link to="/Datenschutz">Datenschutz</Link>
            <a
              href="https://www.uni-wuppertal.de/de/impressum"
              target="_blank"
              rel="noopener noreferrer"
            >
              Impressum
            </a>
            <Link to="/Contact">Kontakt</Link>
          </nav>
        </footer>
      </div>
    </Router>
  );
}
