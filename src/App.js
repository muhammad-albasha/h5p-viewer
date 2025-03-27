// src/App.js
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
import Impressum from "./components/Impressum";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/Login" />;
};

export default function App() {
  const [isContrast, setIsContrast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Aktualisiere root font-size (rem-basierte Werte)
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Globaler Fetch-Interceptor: Bei 401 wird automatisch ausgeloggt und zur Login-Seite weitergeleitet
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

  // Erfasse Benutzeraktivität (Mausbewegung, Tastendruck, Klick)
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
    };
  }, []);

  // Bei aktiver Nutzung den Token regelmäßig verlängern
  useEffect(() => {
    const interval = setInterval(async () => {
      if (Date.now() - lastActivity < 60000) {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/refresh`,
            {
              headers: {
                Authorization: token,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  const toggleContrast = () => {
    setIsContrast(!isContrast);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div
        className="d-flex flex-column min-vh-100"
        style={{
          overflowX: "hidden",
          padding: "0 5px",
          ...(isContrast && {
            "--primary-color": "#000",
            "--primary-hover": "#000",
          }),
        }}
      >
        {/* Top-Banner */}
        <div
          id="top-banner"
          className="bg-white d-flex flex-wrap justify-content-end align-items-center fs-6"
        >
          {/* Leichte Sprache Button */}
          <Link
            className="btn btn-link text-dark me-2 d-flex align-items-center"
            to="/leichte-sprache"
            style={{ fontSize: "0.9rem" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-chat-left-text me-1"
              viewBox="0 0 16 16"
            >
              <path d="M14 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v3.586L6.586 11H14a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 2h12v7H6a1 1 0 0 0-1 1v3.293L3.707 10H2V2z" />
              <path d="M4 4.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 4.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z" />
            </svg>
            Leichte Sprache
          </Link>

          {/* Schriftgröße-Steuerung */}
          <div className="d-flex align-items-center me-2">
            <button
              className="btn btn-link text-dark"
              onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
            >
              {/* Minus-Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-dash"
                viewBox="0 0 16 16"
              >
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
              </svg>
            </button>
            <span className="mx-1">{fontSize}</span>
            <button
              className="btn btn-link text-dark"
              onClick={() => setFontSize((prev) => prev + 1)}
            >
              {/* Plus-Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus"
                viewBox="0 0 16 16"
              >
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
            </button>
          </div>

          {/* Kontrast Button */}
          <button
            className="btn btn-link text-dark d-flex align-items-center"
            style={{ minWidth: "80px", fontSize: "0.9rem" }}
            onClick={toggleContrast}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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

        <div className="flex-grow-1 d-flex flex-column">
          <div className="mt-4 mx-auto" style={{ width: "100%" }}>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="row">
                    <div className="col-md-3">
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
              <Route
                path="/:name"
                element={<FacultyDetail isContrast={isContrast} />}
              />
              <Route path="/leichte-sprache" element={<LeichteSprache />} />
              <Route path="/content" element={<H5PContentPage />} />
              <Route path="/impressum" element={<Impressum />} />
            </Routes>
          </div>

          <footer className="bg-light border-top py-3 mt-auto">
            <div className="d-flex flex-wrap justify-content-center">
              <Link
                className="text-decoration-none text-secondary me-3"
                to="/Datenschutz"
              >
                Datenschutz
              </Link>
              <Link
                className="text-decoration-none text-secondary me-3"
                to="/impressum"
              >
                Impressum
              </Link>
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
