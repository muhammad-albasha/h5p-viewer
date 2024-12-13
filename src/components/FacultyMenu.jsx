import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FacultyMenu = () => {
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        const data = await response.json();
        setFaculties(data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Fakultätsdaten:", error);
      }
    };

    fetchFaculties();
  }, []);

  return (
    <div className="faculty-menu">
      <h3>Fachbereich</h3>
      <ul>
        {faculties.map((faculty) => (
          <li key={faculty.id}>
            <Link to={`/${encodeURIComponent(faculty.name)}`}>
              {faculty.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FacultyMenu;
