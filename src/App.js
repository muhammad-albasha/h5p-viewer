import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayH5pGrid from "./components/PlayH5pGrid";
import About from "./components/About";
import License from "./components/license";
import Impressum from "./components/Impressum";
import Contact from "./components/contact";
import Login from "./components/Login";
import "./styles.css";
import logo from "./logo.svg";
import h5pData from "./h5pPaths.json";

export default function App() {
  return (
    <Router>
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
          <Route path="/" element={<PlayH5pGrid h5pData={h5pData} />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/License" element={<License />} />
          <Route path="/Impressum" element={<Impressum />} />
          <Route path="/Contact" element={<Contact />} />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <nav>
            <Link to="/License">Lizenz</Link>
            <Link to="/Impressum">Impressum</Link>
            <Link to="/Contact">Kontakt</Link>
          </nav>
        </footer>
      </div>
    </Router>
  );
}
