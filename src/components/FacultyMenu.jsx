import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FacultyMenu = () => {
  const [faculties, setFaculties] = useState([]);
  const jsonPath = `${process.env.PUBLIC_URL}/faculties.json`;

  useEffect(() => {
    // Abrufen der Fakultätsdaten von der JSON-Datei
    const fetchFaculties = async () => {
      try {
        const response = await fetch(jsonPath);
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
  }, [jsonPath]);

  return (
    <div className="faculty-menu">
      <h3>Fakultäten</h3>
      <ul>
        {faculties.map((faculty) => (
          <li key={faculty.id}>
            <Link to={`/faculty/${faculty.id}`}>{faculty.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FacultyMenu;
