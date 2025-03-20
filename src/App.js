// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles.css";

import PlayH5pGrid from "./components/PlayH5pGrid";
import About from "./components/About";
import Datenschutz from "./components/Datenschutz";
import Contact from "./components/contact";
import FacultyMenu from "./components/FacultyMenu";
import FacultyDetail from "./components/FacultyDetail";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
import LeichteSprache from "./components/LeichteSprache";
import logo from "./logo.svg";
import H5PContentPage from "./components/H5PContentPage";

// ProtectedRoute: Nur authentifizierte Nutzer dürfen diese Route sehen
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/Login" />;
};

export default function App() {
  const [isContrast, setIsContrast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Standard-Fontgröße in Pixeln (hier 16px)
  const [fontSize, setFontSize] = useState(16);

  // Beim ersten Laden: Token aus localStorage prüfen
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Globales Fetch-Override, um bei 401 (Unauthorized) automatisch auszuloggen
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        window.location.href = "/h5p/Login";
      }
      return response;
    };
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
      {/* Globaler Container mit dynamischer Schriftgröße */}
      <div
        className="d-flex flex-column min-vh-100"
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Weißes Top-Banner mit SVG-Symbolen */}
        <div
          id="top-banner"
          className="bg-white d-flex justify-content-end align-items-center"
          style={{ padding: "0 1rem" }}
        >
          {/* Leichte Sprache: SVG-Symbol und Text */}
          <Link
            className="btn btn-link text-dark me-2 d-flex align-items-center"
            to="/leichte-sprache"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-chat-text me-1"
              viewBox="0 0 16 16"
            >
              <path d="M2 2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3v3.586L9.586 12H14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm0 1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9.414L7 14.414V11H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
              <path d="M3 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 3 5.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 3 7.5z" />
            </svg>
            Leichte Sprache
          </Link>

          <div className="d-flex align-items-center me-2">
            <button
              className="btn btn-link text-dark"
              onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-dash"
                viewBox="0 0 16 16"
              >
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
              </svg>
            </button>
            <span className="mx-1">Schriftgröße: {fontSize}</span>
            <button
              className="btn btn-link text-dark"
              onClick={() => setFontSize((prev) => prev + 1)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-plus"
                viewBox="0 0 16 16"
              >
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
            </button>
          </div>

          {/* Kontrast: SVG-Symbol und Text */}
          <button
            className="btn btn-link text-dark d-flex align-items-center"
            style={{ minWidth: "100px" }}
            onClick={toggleContrast}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-brightness-high me-1"
              viewBox="0 0 16 16"
            >
              <path d="M8 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
              <path d="M8 0a.5.5 0 0 1 .5.5V2a.5.5 0 0 1-1 0V.5A.5.5 0 0 1 8 0zm0 12a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0V12.5a.5.5 0 0 1 .5-.5zm7-4a.5.5 0 0 1-.5.5H14a.5.5 0 0 1 0-1h.5a.5.5 0 0 1 .5.5zM2 8a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5zm10.657-4.657a.5.5 0 0 1 .708 0l1.06 1.06a.5.5 0 1 1-.708.708l-1.06-1.06a.5.5 0 0 1 0-.708zM3.575 11.575a.5.5 0 0 1 .708 0l1.06 1.06a.5.5 0 1 1-.708.708L3.575 12.283a.5.5 0 0 1 0-.708zm9.9 1.06a.5.5 0 0 1 0-.708l1.06-1.06a.5.5 0 1 1 .708.708l-1.06 1.06a.5.5 0 0 1-.708 0zM3.575 4.425a.5.5 0 0 1 0 .708L2.515 6.193a.5.5 0 1 1-.708-.708l1.06-1.06a.5.5 0 0 1 .708 0z" />
            </svg>
            Kontrast
          </button>
        </div>

        {/* Grüner Banner */}
        <nav
          className={`navbar navbar-expand-lg navbar-dark shadow-sm p-2 ${
            isContrast ? "contrast-mode" : "green-mode"
          }`}
        >
          <div className="container-fluid">
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img
                src={logo}
                alt="Logo"
                width="300"
                height="100"
                className="d-inline-block align-text-center me-2"
                style={{ marginLeft: "50px" }}
              />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0 fw-bold fs-5">
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/">
                    Startseite
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/about">
                    Über uns
                  </Link>
                </li>
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/admin">
                        Verwaltung
                      </Link>
                    </li>
                    <li className="nav-item">
                      <button
                        className="nav-link btn btn-link text-white"
                        onClick={handleLogout}
                      >
                        Abmelden
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/Login">
                      Anmelden
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Schmaler grauer Banner */}
        <div
          id="gray-banner"
          className="d-flex justify-content-start align-items-center"
          style={{
            backgroundColor: "#e0e0e0",
            padding: "0.3rem 1rem",
          }}
        >
          <span className="fw-bold" style={{ marginLeft: "60px" }}>
            H5P-Viewer
          </span>
        </div>

        {/* Hauptinhalt */}
        <div className="flex-grow-1 d-flex flex-column">
          <div
            className="mt-4 mx-auto"
            style={{
              // maxWidth: "1400px",
              width: "100%",
              marginBottom: "5rem",
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <div className="row">
                    <div className="col-md-3 mb-4">
                      <FacultyMenu isContrast={isContrast} />
                    </div>
                    <div className="col-md-9">
                      <PlayH5pGrid isContrast={isContrast} />
                    </div>
                  </div>
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
                    <AdminPanel isContrast={isContrast} />
                  </ProtectedRoute>
                }
              />
              <Route path="/Datenschutz" element={<Datenschutz />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="/:name" element={<FacultyDetail />} />
              <Route path="/leichte-sprache" element={<LeichteSprache />} />
              <Route path="/content" element={<H5PContentPage />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="bg-light border-top py-3 mt-auto">
            <div className="d-flex flex-wrap justify-content-center">
              <Link
                className="text-decoration-none text-secondary me-3"
                to="/Datenschutz"
              >
                Datenschutz
              </Link>
              <a
                className="text-decoration-none text-secondary me-3"
                href="https://www.uni-wuppertal.de/de/impressum"
                target="_blank"
                rel="noopener noreferrer"
              >
                Impressum
              </a>
              <Link
                className="text-decoration-none text-secondary"
                to="/Contact"
              >
                Kontakt
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}
