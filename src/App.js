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
import AdminPanel from "./components/AdminPanel";

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
    setIsAuthenticated(!!token);
  }, []);

  const toggleContrast = () => {
    setIsContrast(!isContrast);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className={`App ${isContrast ? "contrast-mode" : ""}`}>
        <header className="top-banner">
          <button className="contrast-toggle" onClick={toggleContrast}>
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
            <p className="banner-title">H5P-Viewer</p>
            <div className="banner-logo">
              <img src={logo} alt="Logo" />
            </div>
            <nav className="nav">
              <Link to="/">Startseite</Link>
              <Link to="/about">Über uns</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/admin">Verwaltung</Link>
                  <button className="contrast-toggle" onClick={handleLogout}>
                    Abmelden
                  </button>
                </>
              ) : (
                <Link to="/Login">Anmelden</Link>
              )}
            </nav>
          </div>
        </header>

        {/* Routen */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <FacultyMenu /> {/* Nur auf der Startseite */}
                <PlayH5pGrid />
              </>
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/Login"
            element={<Login setAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
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
