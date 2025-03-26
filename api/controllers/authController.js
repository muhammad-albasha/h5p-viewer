// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const { sign, verify } = jwt;

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).send("Email oder Passwort falsch");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Email oder Passwort falsch");

    const token = sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export function protectedRoute(req, res) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Token benötigt");

  try {
    const verified = verify(token, process.env.JWT_SECRET);
    res.json({ message: "Zugriff erlaubt", user: verified });
  } catch (error) {
    res.status(401).send("Ungültiges Token");
  }
}

// Neuer Refresh-Endpunkt
export function refreshToken(req, res) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Token benötigt");

  try {
    // Wir verwenden ignoreExpiration, um den Inhalt des Tokens auszulesen,
    // aber wir prüfen manuell, ob der Token abgelaufen ist.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return res.status(401).send("Token abgelaufen");
    }
    // Erzeuge einen neuen Token mit verlängerter Laufzeit
    const newToken = sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).send("Ungültiges Token");
  }
}
