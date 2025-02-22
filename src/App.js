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

import logo from "./logo.svg";

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
      {/* Oberstes Wrapper-Element für Sticky-Footer */}
      <div
        className={`d-flex flex-column min-vh-100 ${
          isContrast ? "contrast-mode" : ""
        }`}
      >
        {/*
          1) Weißes Top-Banner (Uni Wuppertal, Webmail, Kontrast)
             mit "width: calc(100% - 70px)" damit rechts 70px frei bleiben
        */}
        <div
          className="bg-white d-flex justify-content-end align-items-center"
          style={{
            width: "calc(100% - 70px)",
            margin: 0,
            padding: "0 1rem",
          }}
        >
          <button
            className="btn btn-link text-dark me-2"
            onClick={() =>
              window.open("https://www.uni-wuppertal.de", "_blank")
            }
          >
            Universität Wuppertal
          </button>
          <button
            className="btn btn-link text-dark me-2"
            onClick={() =>
              window.open("https://webmail.uni-wuppertal.de", "_blank")
            }
          >
            Webmail
          </button>
          <button
            className="btn btn-link text-dark"
            style={{ minWidth: "100px" }}
            onClick={toggleContrast}
          >
            Kontrast
          </button>
        </div>

        {/*
          2) Grüner Banner (Logo-Banner)
             mit "width: calc(100% - 70px)" -> rechts 70px Abstand
        */}
        <nav
          className="navbar navbar-expand-lg navbar-dark shadow-sm p-2"
          style={{
            backgroundColor: "#89ba17",
            width: "calc(100% - 70px)",
            margin: 0,
          }}
        >
          <div className="container-fluid">
            {/* Logo / Brand */}
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img
                src={logo}
                alt="Logo"
                width="300"
                height="100"
                className="d-inline-block align-text-center me-2"
                style={{ marginLeft: "50px" }}
              />
              {/*
                <span className="fw-bold">H5P-Viewer</span>
              */}
            </Link>

            {/* Toggler (mobil) */}
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

        {/*
          3) Schmaler grauer Banner unter dem grünen Banner,
             links "H5P-Viewer" mit 40px Margin
        */}
        <div
          className="d-flex justify-content-start align-items-center"
          style={{
            backgroundColor: "#e0e0e0",
            width: "calc(100% - 70px)",
            margin: 0,
            padding: "0.3rem 1rem",
          }}
        >
          <span className="fw-bold" style={{ marginLeft: "60px" }}>
            H5P-Viewer
          </span>
        </div>

        {/*
          4) Hauptinhalt zentriert in max. 1100px.
             Sticky-Footer => flex-grow-1 + footer mt-auto
        */}
        <div className="flex-grow-1 d-flex flex-column">
          <div
            className="mt-4 mx-auto"
            style={{ maxWidth: "1100px", width: "100%" }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <div className="row">
                    {/* Linke Spalte für FacultyMenu */}
                    <div className="col-md-3 mb-4">
                      <FacultyMenu />
                    </div>

                    {/* Rechte Spalte für Content */}
                    <div className="col-md-9">
                      <PlayH5pGrid />
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
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route path="/Datenschutz" element={<Datenschutz />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="/:name" element={<FacultyDetail />} />
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
