import { Router } from "express";
import Faculty from "../models/faculty.js";
import H5PContent from "../models/H5PContent.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import extract from "extract-zip";

const router = Router();

// Fakultäten abrufen
router.get("/faculties", async (req, res) => {
  try {
    const faculties = await Faculty.findAll();
    res.json(faculties);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Fakultäten mit H5P-Daten abrufen
router.get("/faculties-with-h5p", async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      include: H5PContent,
    });
    res.json(faculties);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/h5pContent", async (req, res) => {
  try {
    const h5pData = await H5PContent.findAll();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedData = h5pData.map((item) => ({
      ...item.toJSON(),
      previewImage: `${baseUrl}/${item.previewImage}`,
      h5pJsonPath: `${baseUrl}/${item.h5pJsonPath}`,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Fehler beim Abrufen der H5P-Daten:", error);
    res.status(500).send(error.message);
  }
});

router.post("/faculties", authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ error: "Name der Fakultät ist erforderlich" });
  }

  try {
    const newFaculty = await Faculty.create({ name });
    res.status(201).json(newFaculty);
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Fakultät:", error);
    res.status(500).send(error.message);
  }
});

// Storage-Konfiguration für Multer
const h5pStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("'uploads'-Verzeichnis wurde erstellt.");
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const ensureDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`'${dir}'-Verzeichnis wurde erstellt.`);
  }
};

const upload = multer({ storage: h5pStorage });

router.post(
  "/h5pContent",
  authenticateToken,
  upload.fields([
    { name: "h5pFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Anfrage erhalten:", req.body);
      console.log("Dateien hochgeladen:", req.files);

      if (!req.files.h5pFile || !req.files.imageFile) {
        console.log("Fehler: Fehlende Dateien");
        return res
          .status(400)
          .json({ error: "H5P- und Bilddateien sind erforderlich." });
      }

      const h5pFile = req.files.h5pFile[0];
      const imageFile = req.files.imageFile[0];

      // H5P-Datei entpacken
      const h5pDir = `public/h5p/${Date.now()}`;
      ensureDirectory(h5pDir);

      try {
        console.log("Entpacken der H5P-Datei...");
        await extract(h5pFile.path, { dir: path.resolve(h5pDir) });
        console.log("Entpacken erfolgreich.");
      } catch (error) {
        console.error("Fehler beim Entpacken der H5P-Datei:", error);
        return res.status(400).json({ error: "Ungültige H5P-Datei." });
      }

      // Bild verschieben
      const imageDir = `public/images`;
      ensureDirectory(imageDir);

      const imageDest = path.join(imageDir, imageFile.filename);

      try {
        fs.renameSync(imageFile.path, imageDest);
        console.log("Bild erfolgreich verschoben nach:", imageDest);
      } catch (error) {
        console.error("Fehler beim Verschieben des Bildes:", error);
        return res
          .status(500)
          .json({ error: "Fehler beim Speichern des Bildes." });
      }

      // Datenbankeintrag erstellen
      try {
        const newContent = await H5PContent.create({
          name: path.basename(h5pFile.originalname, ".h5p"),
          category: req.body.category,
          previewImage: `images/${imageFile.filename}`, // Pfad relativ zu `public/`
          h5pJsonPath: h5pDir.replace("public/", ""), // Pfad relativ zu `public/`
          info: req.body.info,
          facultyId: req.body.facultyId,
        });

        console.log("Neuer Inhalt gespeichert:", newContent);
        res.status(201).json(newContent);
      } catch (error) {
        console.error("Fehler beim Erstellen des Datenbankeintrags:", error);
        res
          .status(500)
          .json({ error: "Fehler beim Speichern in der Datenbank." });
      }
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Anfrage:", error);
      res.status(500).send("Interner Serverfehler.");
    }
  }
);

export default router;
