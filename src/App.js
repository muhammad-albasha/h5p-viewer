import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayH5pGrid from "./components/PlayH5pGrid";
import About from "./components/About";
import License from "./components/license";
import Contact from "./components/contact";
// import Login from "./components/Login";
import "./styles.css";
import logo from "./logo.svg";

export default function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        {/* Banner */}
        <header className="banner">
          {/* Logo und Navigation */}
          <div className="banner-top">
            <div className="banner-logo">
              <img src={logo} alt="Logo" />
            </div>
            <nav className="nav">
              <Link to="/">Startseite</Link>
              <Link to="/about">Über</Link>
              <Link to="/login">Anmelden</Link>
            </nav>
          </div>
        </header>
        <p className="banner-title">H5P-Viewer</p>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<PlayH5pGrid />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/License" element={<License />} />
          <Route path="/Contact" element={<Contact />} />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <nav>
            <Link to="/License">Lizenz</Link>
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
