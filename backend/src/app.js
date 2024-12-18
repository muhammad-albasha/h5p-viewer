import express, { json } from "express";
import sequelize from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

app.use("/h5p", express.static(path.join(__dirname, "public/h5p")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routen
app.use("/auth", authRoutes);
app.use("/api", dataRoutes);

// Synchronisieren mit der Datenbank
sequelize
  .sync()
  .then(() => {
    console.log("Datenbank verbunden");
    app.listen(3000, () => console.log("Server läuft auf Port 3000"));
  })
  .catch((error) => {
    console.error("Fehler beim Verbinden mit der Datenbank:", error);
  });
