import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";

const FacultyMenu = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFaculties(data);
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
    <Card className="shadow-sm faculty-menu">
      <Card.Header className="bg-primary text-white">
        <h3 className="mb-0">Fachbereiche</h3>
      </Card.Header>
      <ListGroup variant="flush">
        {faculties.map((faculty) => (
          <ListGroup.Item
            key={faculty.id}
            action
            as={Link}
            to={`/${encodeURIComponent(faculty.name)}`}
            className="faculty-link"
          >
            {faculty.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

FacultyMenu.propTypes = {
  faculties: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default FacultyMenu;
