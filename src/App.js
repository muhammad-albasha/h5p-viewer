import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import PlayH5pGrid from "./components/PlayH5pGrid";
import About from "./components/About";
import Datenschutz from "./components/Datenschutz";
import Contact from "./components/contact";
import FacultyMenu from "./components/FacultyMenu";
import FacultyDetail from "./components/FacultyDetail";
import Login from "./components/Login";
import "./styles.css";
import logo from "./logo.svg";

// Funktion für geschützte Routen
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/Login" />;
};

export default function App() {
  const [isContrast, setIsContrast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Token prüfen, um Authentifizierungsstatus zu setzen
  }, []);

  const toggleContrast = () => {
    setIsContrast(!isContrast);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Token entfernen
    setIsAuthenticated(false);
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
              {!isAuthenticated ? (
                <Link to="/Login">Anmelden</Link>
              ) : (
                <button className="contrast-toggle" onClick={handleLogout}>
                  Abmelden
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Routen */}
        <Routes>
          <Route path="/" element={<PlayH5pGrid />} />
          <Route path="/about" element={<About />} />
          <Route path="/Login" element={<Login />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <FacultyDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/Datenschutz" element={<Datenschutz />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/:name" element={<FacultyDetail />} />
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
