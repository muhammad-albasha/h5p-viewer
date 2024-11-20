// Login Component
import React from "react";

export default function Login() {
  return (
    <div className="login-container">
      <h2 className="login-title">Anmelden</h2>
      <form className="login-form">
        <input type="text" placeholder="Benutzername" className="login-input" />
        <input type="password" placeholder="Passwort" className="login-input" />
        <button type="submit" className="login-button">
          Anmelden
        </button>
      </form>
    </div>
  );
}
