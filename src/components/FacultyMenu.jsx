import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

const FacultyMenu = ({ isContrast }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/faculties`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Alphabetisch sortieren nach dem Namen
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setFaculties(sortedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mx-3 my-4">
        Error loading faculties: {error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Überschrift */}
      <h2 className={`faculty-menu-title ${isContrast ? "contrast" : ""}`}>
        Themen:
      </h2>

      {/* Container der Buttons: zentriert, aber Inhalte linksbündig */}
      <div className="faculty-menu-buttons">
        {/* Button "Alle" führt zur Startseite */}
        <Link to="/" className={`faculty-btn ${isContrast ? "contrast" : ""}`}>
          Alle
        </Link>
        {faculties.map((faculty) => (
          <Link
            key={faculty.id}
            to={`/${encodeURIComponent(faculty.name)}`}
            className={`faculty-btn ${isContrast ? "contrast" : ""}`}
          >
            {faculty.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

FacultyMenu.propTypes = {
  isContrast: PropTypes.bool,
};

export default FacultyMenu;
