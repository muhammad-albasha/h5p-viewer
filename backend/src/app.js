import express, { json } from "express";
import sequelize from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ensureAdminUser } from "./models/user.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Statische Dateien bereitstellen
console.log("Static Path für H5P:", path.join(__dirname, "../public/h5p"));
app.use("/h5p", express.static(path.join(__dirname, "../public/h5p")));

console.log(
  "Static Path für Assets:",
  path.join(__dirname, "../public/assets")
);
app.use("/assets", express.static(path.join(__dirname, "../public/assets")));

console.log(
  "Static Path für Images:",
  path.join(__dirname, "../public/images")
);
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// API-Routen
app.use("/auth", authRoutes);
app.use("/api", dataRoutes);

// Server und Datenbank initialisieren
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log("Datenbank verbunden");

    await ensureAdminUser();

    const PORT = process.env.PORT || 3500;
    app.listen(PORT, () => {
      console.log(`Server läuft auf Port ${PORT}`);
    });
  } catch (error) {
    console.error("Fehler beim Starten des Servers:", error);
  }
};

startServer();
