import React, { useState, useEffect } from "react";
import AddH5PForm from "./AddH5PForm";

const AdminPanel = ({ isContrast }) => {
  const [faculties, setFaculties] = useState([]);
  const [h5pContents, setH5pContents] = useState([]);
  const [editFaculty, setEditFaculty] = useState(null);
  const [editH5PContent, setEditH5PContent] = useState(null);
  const [isFacultyFormVisible, setIsFacultyFormVisible] = useState(false);
  const [isH5PFormVisible, setIsH5PFormVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facultyRes = await fetch(
          `${process.env.REACT_APP_API_URL}/faculties`
        );
        const h5pRes = await fetch(
          `${process.env.REACT_APP_API_URL}/h5pContent`
        );

        setFaculties(await facultyRes.json());
        setH5pContents(await h5pRes.json());
      } catch (error) {
        console.error("Fehler beim Abrufen:", error);
      }
    };

    fetchData();
  }, []);

  const addFaculty = async (name) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/faculties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({ name }),
        }
      );

      if (response.ok) {
        const newFaculty = await response.json();
        // Neue Fakultät oben einfügen:
        setFaculties([newFaculty, ...faculties]);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen eines Fachbereichs:", error);
    }
  };

  const removeFaculty = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/faculties/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      if (response.ok) {
        setFaculties(faculties.filter((faculty) => faculty.id !== id));
      }
    } catch (error) {
      console.error("Fehler beim Entfernen eines Fachbereichs:", error);
    }
  };

  const editFacultyHandler = async (id, name) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/faculties/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({ name }),
        }
      );

      if (response.ok) {
        const updatedFaculty = await response.json();
        setFaculties(
          faculties.map((faculty) =>
            faculty.id === id ? updatedFaculty : faculty
          )
        );
        setEditFaculty(null);
      }
    } catch (error) {
      console.error("Fehler beim Bearbeiten eines Fachbereichs:", error);
    }
  };

  const addH5PContent = (newContent) => {
    setH5pContents([newContent, ...h5pContents]);
  };

  const removeH5PContent = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/h5pContent/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      if (response.ok) {
        setH5pContents(h5pContents.filter((content) => content.id !== id));
      }
    } catch (error) {
      console.error("Fehler beim Entfernen eines H5P-Inhalts:", error);
    }
  };

  const editH5PContentHandler = async (id, updates) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/h5pContent/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        const updatedContent = await response.json();
        setH5pContents(
          h5pContents.map((content) =>
            content.id === id ? updatedContent : content
          )
        );
        setEditH5PContent(null);
      }
    } catch (error) {
      console.error("Fehler beim Bearbeiten eines H5P-Inhalts:", error);
    }
  };

  return (
    <div
      className="admin-panel"
      style={
        isContrast
          ? { "--primary-color": "#000", "--primary-hover": "#000" }
          : {}
      }
    >
      {/* Fachbereiche */}
      <div className="section">
        <h3 style={{ color: isContrast ? "#000" : "#2c3e50" }}>Thema</h3>
        <button
          className="add-button"
          style={{
            background: "var(--primary-color)",
            color: "#fff",
          }}
          onClick={() => setIsFacultyFormVisible(!isFacultyFormVisible)}
        >
          +
        </button>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((faculty, index) => (
              <tr key={faculty.id}>
                {/* Frontend-ID als fortlaufende Nummer */}
                <td>{index + 1}</td>
                <td>
                  {editFaculty?.id === faculty.id ? (
                    <input
                      type="text"
                      value={editFaculty.name}
                      onChange={(e) =>
                        setEditFaculty({ ...editFaculty, name: e.target.value })
                      }
                    />
                  ) : (
                    faculty.name
                  )}
                </td>
                <td>
                  {editFaculty?.id === faculty.id ? (
                    <>
                      <button
                        className="icon-button save"
                        onClick={() =>
                          editFacultyHandler(faculty.id, editFaculty.name)
                        }
                      >
                        💾
                      </button>
                      <button
                        className="icon-button cancel"
                        onClick={() => setEditFaculty(null)}
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-button edit"
                        onClick={() => setEditFaculty(faculty)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button delete"
                        onClick={() => removeFaculty(faculty.id)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isFacultyFormVisible && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addFaculty(e.target.name.value);
              e.target.reset();
            }}
          >
            <input name="name" placeholder="Fachbereich Name" required />
            <button
              type="submit"
              style={{
                background: "var(--primary-color)",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                marginLeft: "0.5rem",
              }}
            >
              Hinzufügen
            </button>
          </form>
        )}
      </div>

      {/* H5P-Inhalte */}
      <div className="section">
        <h3 style={{ color: isContrast ? "#000" : "#2c3e50" }}>H5P-Inhalte</h3>
        <button
          className="add-button"
          style={{
            background: "var(--primary-color)",
            color: "#fff",
          }}
          onClick={() => setIsH5PFormVisible(!isH5PFormVisible)}
        >
          +
        </button>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Tag</th>
              <th>Info</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {h5pContents.map((content, index) => (
              <tr key={content.id}>
                <td>{index + 1}</td>
                <td>
                  {editH5PContent?.id === content.id ? (
                    <input
                      type="text"
                      value={editH5PContent.name}
                      onChange={(e) =>
                        setEditH5PContent({
                          ...editH5PContent,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    content.name
                  )}
                </td>
                <td>
                  {editH5PContent?.id === content.id ? (
                    <input
                      type="text"
                      value={editH5PContent.category}
                      onChange={(e) =>
                        setEditH5PContent({
                          ...editH5PContent,
                          category: e.target.value,
                        })
                      }
                    />
                  ) : (
                    content.category
                  )}
                </td>
                <td>
                  {editH5PContent?.id === content.id ? (
                    <textarea
                      value={editH5PContent.info}
                      onChange={(e) =>
                        setEditH5PContent({
                          ...editH5PContent,
                          info: e.target.value,
                        })
                      }
                    />
                  ) : (
                    content.info
                  )}
                </td>
                <td>
                  {editH5PContent?.id === content.id ? (
                    <>
                      <button
                        className="icon-button save"
                        onClick={() =>
                          editH5PContentHandler(content.id, {
                            name: editH5PContent.name,
                            category: editH5PContent.category,
                            info: editH5PContent.info,
                          })
                        }
                      >
                        💾
                      </button>
                      <button
                        className="icon-button cancel"
                        onClick={() => setEditH5PContent(null)}
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-button edit"
                        onClick={() => setEditH5PContent(content)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button delete"
                        onClick={() => removeH5PContent(content.id)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isH5PFormVisible && (
          <AddH5PForm onAdd={(newContent) => addH5PContent(newContent)} />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
