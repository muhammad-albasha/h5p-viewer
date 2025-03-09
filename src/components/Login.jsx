import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setAuthenticated(true);
        navigate("/");
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Anmeldung fehlgeschlagen.");
      }
    } catch (err) {
      setError("Fehler beim Anmelden. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Anmelden</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">
          Anmelden
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
