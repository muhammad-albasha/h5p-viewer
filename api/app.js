import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import { ensureAdminUser } from "./models/user.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

const staticPaths = {
  h5pRoot: path.join(__dirname, "data", "h5p"),
  h5pAlt: path.join(__dirname, "../api/data/h5p"),
  previewimages: path.join(__dirname, "../api/data/previewimages"),
};

app.use("/h5p-viwer/data/h5p", express.static(staticPaths.h5pRoot));
app.use("/h5p", express.static(staticPaths.h5pAlt));
app.use("/previewimages", express.static(staticPaths.previewimages));

console.log("Static path for H5P (root):", staticPaths.h5pRoot);
console.log("Static path for H5P (alternative):", staticPaths.h5pAlt);
console.log("Static path for previewimages:", staticPaths.previewimages);

app.use("/api/auth", authRoutes);
app.use("/api", dataRoutes);
app.use("/api/profile", profileRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3500;

const startServer = async () => {
  try {
    await sequelize.sync();
    console.log("Database connected successfully.");

    await ensureAdminUser();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
