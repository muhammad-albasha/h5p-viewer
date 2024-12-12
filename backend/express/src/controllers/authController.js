import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const { sign, verify } = jwt; // Extrahieren der Funktionen

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
