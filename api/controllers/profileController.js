// controllers/profileController.js
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export async function getProfile(req, res) {
  try {
    // Nur die E‑Mail wird zurückgegeben (das Passwort bleibt verborgen)
    const user = await User.findByPk(req.user.id, { attributes: ["email"] });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function updateProfile(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).send("User not found");

    // Aktualisiere die E‑Mail, falls angegeben
    if (email) user.email = email;
    // Passwort nur ändern, wenn ein neuer Wert übergeben wurde
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ message: "Profile updated successfully", email: user.email });
  } catch (error) {
    res.status(500).send(error.message);
  }
}
