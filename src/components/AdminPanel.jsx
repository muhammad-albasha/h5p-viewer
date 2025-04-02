import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddH5PForm from "./AddH5PForm";

// Bestätigungsmodal-Komponente mit optimierten Styles
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "300px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  };

  const buttonStyle = {
    padding: "6px 12px",
    fontSize: "14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "0 5px",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p>{message}</p>
        <div style={{ marginTop: "15px" }}>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: "#89ba17",
              color: "#fff",
            }}
            onClick={onConfirm}
          >
            Ja
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#000" }}
            onClick={onCancel}
          >
            Nein
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ isContrast }) => {
  const [faculties, setFaculties] = useState([]);
  const [h5pContents, setH5pContents] = useState([]);
  const [editFaculty, setEditFaculty] = useState(null);
  const [editH5PContent, setEditH5PContent] = useState(null);
  const [isFacultyFormVisible, setIsFacultyFormVisible] = useState(false);
  const [isH5PFormVisible, setIsH5PFormVisible] = useState(false);

  // States für Profil-Daten
  const [profile, setProfile] = useState({ email: "", password: "" });
  const [isProfileEdit, setIsProfileEdit] = useState(false);

  // State für das Bestätigungsmodal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facultyRes = await fetch(
          `${process.env.REACT_APP_API_URL}/faculties`
        );
        const h5pRes = await fetch(
          `${process.env.REACT_APP_API_URL}/h5pContent`
        );
        const fetchedFaculties = await facultyRes.json();
        // Alphabetisch sortieren nach dem Namen
        const sortedFaculties = fetchedFaculties.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setFaculties(sortedFaculties);
        setH5pContents(await h5pRes.json());
      } catch (error) {
        console.error("Fehler beim Abrufen:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/profile`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfile({ email: data.email, password: "" });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Funktionen für Fakultäten
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
        setFaculties([newFaculty, ...faculties]);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen eines Fachbereichs:", error);
    }
  };

  const handleDeleteFaculty = (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Möchten Sie diesen Fachbereich wirklich löschen?",
      onConfirm: async () => {
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
        } finally {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        }
      },
    });
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

  // Funktionen für H5P-Inhalte
  const addH5PContent = (newContent) => {
    setH5pContents([newContent, ...h5pContents]);
  };

  const handleDeleteH5PContent = (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Möchten Sie diesen H5P-Inhalt wirklich löschen?",
      onConfirm: async () => {
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
        } finally {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        }
      },
    });
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

  // Profil aktualisieren
  const updateProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile({ email: updatedProfile.email, password: "" });
        setIsProfileEdit(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
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
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({ isOpen: false, message: "", onConfirm: null })
        }
      />

      {/* Profil-Sektion */}
      <div className="profile-section">
        <h3>Profil</h3>
        {isProfileEdit ? (
          <div className="profile-form">
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              placeholder="E-Mail"
            />
            <input
              type="password"
              value={profile.password}
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
              placeholder="Neues Passwort (optional)"
            />
            <div className="form-actions">
              <button className="save-btn" onClick={updateProfile}>
                Speichern
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsProfileEdit(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="profile-info">E-Mail: {profile.email}</p>
            <button
              className="profile-btn"
              onClick={() => setIsProfileEdit(true)}
            >
              Profil bearbeiten
            </button>
          </div>
        )}
      </div>

      {/* Fakultäten */}
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
                <td>{index + 1}</td>
                <td>
                  {editFaculty?.id === faculty.id ? (
                    <input
                      type="text"
                      value={editFaculty.name}
                      onChange={(e) =>
                        setEditFaculty({
                          ...editFaculty,
                          name: e.target.value,
                        })
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
                        onClick={() => handleDeleteFaculty(faculty.id)}
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
              <th>Thema</th> {/* Neue Spalte für das Thema */}
              <th>Tag</th>
              <th>Info</th>
              <th>Viewe</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {h5pContents.map((content, index) => {
              // Finde den zugehörigen Fachbereich anhand von facultyId
              const associatedFaculty = faculties.find(
                (faculty) => faculty.id === content.facultyId
              );
              return (
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
                      // Dropdown zur Auswahl des Themas (Fakultät) während der Bearbeitung
                      <select
                        value={editH5PContent.facultyId}
                        onChange={(e) =>
                          setEditH5PContent({
                            ...editH5PContent,
                            facultyId: parseInt(e.target.value, 10),
                          })
                        }
                      >
                        {faculties.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                    ) : associatedFaculty ? (
                      associatedFaculty.name
                    ) : (
                      "Unbekannt"
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
                    <Link to={`/content?id=${content.id}`}>Viewe</Link>
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
                              facultyId: editH5PContent.facultyId, // Übergebe den neuen Wert
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
                          onClick={() => handleDeleteH5PContent(content.id)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
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
