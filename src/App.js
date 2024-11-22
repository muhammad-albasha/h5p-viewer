import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayH5pGrid from "./components/PlayH5pGrid";
import About from "./components/About";
import Datenschutz from "./components/Datenschutz";
import Contact from "./components/contact";
import FacultyMenu from "./components/FacultyMenu";
import FacultyDetail from "./components/FacultyDetail";
import "./styles.css";
import logo from "./logo.svg";

export default function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <header className="banner">
          <div className="banner-top">
            <FacultyMenu />
            <div className="banner-logo">
              <img src={logo} alt="Logo" />
            </div>
            <nav className="nav">
              <Link to="/">Startseite</Link>
              <Link to="/about">Über uns</Link>
            </nav>
          </div>
        </header>
        <p className="banner-title">H5P-Viewer</p>
        <Routes>
          <Route path="/" element={<PlayH5pGrid />} />
          <Route path="/about" element={<About />} />
          <Route path="/faculty/:id" element={<FacultyDetail />} />
          <Route path="/Datenschutz" element={<Datenschutz />} />
          <Route path="/Contact" element={<Contact />} />
        </Routes>

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
