import express, { json } from "express";
import sequelize from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

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
