import React, { useState, useEffect } from "react";
import AddH5PForm from "./AddH5PForm";

const AdminPanel = () => {
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
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );
        const h5pRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/h5pContent`
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
        `${process.env.REACT_APP_API_URL}/api/faculties`,
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
        setFaculties([...faculties, newFaculty]);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen eines Fachbereichs:", error);
    }
  };

  const removeFaculty = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/faculties/${id}`,
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
        `${process.env.REACT_APP_API_URL}/api/faculties/${id}`,
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
    setH5pContents([...h5pContents, newContent]);
  };

  const removeH5PContent = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/h5pContent/${id}`,
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
        `${process.env.REACT_APP_API_URL}/api/h5pContent/${id}`,
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
    <div className="admin-panel">
      {/* Fachbereiche */}
      <div className="section">
        <h3>Fachbereiche</h3>
        <button
          className="add-button"
          onClick={() => setIsFacultyFormVisible(!isFacultyFormVisible)}
        >
          +
        </button>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((faculty) => (
              <tr key={faculty.id}>
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
            <button type="submit">Hinzufügen</button>
          </form>
        )}
      </div>

      {/* H5P-Inhalte */}
      <div className="section">
        <h3>H5P-Inhalte</h3>
        <button
          className="add-button"
          onClick={() => setIsH5PFormVisible(!isH5PFormVisible)}
        >
          +
        </button>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kategorie</th>
              <th>Info</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {h5pContents.map((content) => (
              <tr key={content.id}>
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
