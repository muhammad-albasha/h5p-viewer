import { Router } from "express";
import Faculty from "../models/faculty.js";
import H5PContent from "../models/H5PContent.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import extract from "extract-zip";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDataDir = path.join(__dirname, "../data");

const ensureDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`'${dir}'-Verzeichnis wurde erstellt.`);
  }
};

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    if (typeof fs.rmSync === "function") {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`Ordner gelöscht (fs.rmSync): ${folderPath}`);
    } else {
      fs.rmdirSync(folderPath, { recursive: true });
      console.log(`Ordner gelöscht (fs.rmdirSync): ${folderPath}`);
    }
  } else {
    console.log(`Ordner existiert nicht: ${folderPath}`);
  }
};

// ------------------------------
// Routen
// ------------------------------

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
    const faculties = await Faculty.findAll({ include: H5PContent });
    res.json(faculties);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// H5P-Daten abrufen
router.get("/h5pContent", async (req, res) => {
  try {
    const { facultyId } = req.query;
    const whereCondition = facultyId ? { facultyId } : {};
    const h5pData = await H5PContent.findAll({ where: whereCondition });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedData = h5pData.map((item) => ({
      ...item.toJSON(),
      previewImage: `${baseUrl}/${item.previewImage}`,
      h5pJsonPath: `${baseUrl}/h5p-viewer/api/data/h5p/${item.h5pJsonPath}`,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Fehler beim Abrufen der H5P-Daten:", error);
    res.status(500).send(error.message);
  }
});

// Einzelnes H5P Content Item abrufen
router.get("/h5pContent/:id", async (req, res) => {
  try {
    const content = await H5PContent.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ error: "Content nicht gefunden" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedData = {
      id: content.id,
      name: content.name,
      category: content.category,
      info: content.info,
      facultyId: content.facultyId,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      previewImage: `${baseUrl}/${content.previewImage}`,
      h5pJsonPath: `${baseUrl}/h5p-viewer/api/data/h5p/${content.h5pJsonPath}`,
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Fehler beim Abrufen des Contents:", error);
    res
      .status(500)
      .json({ error: "Interner Serverfehler", details: error.message });
  }
});

// Neue Fakultät hinzufügen
router.post("/faculties", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ error: "Name der Fakultät ist erforderlich" });
  try {
    const newFaculty = await Faculty.create({ name });
    res.status(201).json(newFaculty);
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Fakultät:", error);
    res.status(500).send(error.message);
  }
});

// Storage-Konfiguration für Multer (temporärer Upload)
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
const upload = multer({ storage: h5pStorage });

// H5P-Inhalt hochladen und speichern
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

      // H5P-Datei entpacken in ein eindeutiges Verzeichnis unter baseDataDir/h5p-viewer/
      const h5pDir = path.join(baseDataDir, "h5p", Date.now().toString());
      ensureDirectory(h5pDir);

      try {
        console.log("Entpacken der H5P-Datei...");
        await extract(h5pFile.path, { dir: path.resolve(h5pDir) });
        console.log("Entpacken erfolgreich.");
        fs.unlink(h5pFile.path, (err) => {
          if (err) console.error("Fehler beim Löschen der .h5p-Datei:", err);
          else console.log("Hochgeladene .h5p-Datei erfolgreich gelöscht.");
        });
      } catch (error) {
        console.error("Fehler beim Entpacken der H5P-Datei:", error);
        return res.status(400).json({ error: "Ungültige H5P-Datei." });
      }

      // Bild verschieben in baseDataDir/previewimages
      const imageDir = path.join(baseDataDir, "previewimages");
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

      // Datenbankeintrag erstellen – speichere den Ordnernamen (z. B. "1691234567890")
      try {
        const newContent = await H5PContent.create({
          name: path.basename(h5pFile.originalname, ".h5p"),
          category: req.body.category,
          previewImage: `previewimages/${imageFile.filename}`,
          h5pJsonPath: path.basename(h5pDir),
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

// H5P-Inhalt löschen
router.delete("/h5pContent/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const content = await H5PContent.findByPk(id);
    if (!content) return res.status(404).send("H5P-Inhalt nicht gefunden.");
    try {
      // Absoluter Pfad zum entpackten H5P-Ordner
      const h5pFolderPath = path.join(baseDataDir, "h5p", content.h5pJsonPath);
      console.log("Lösche Ordner:", h5pFolderPath);
      deleteFolderRecursive(h5pFolderPath);

      // Absoluter Pfad zum Vorschaubild
      const imagePath = path.join(
        baseDataDir,
        "previewimages",
        path.basename(content.previewImage)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Bilddatei gelöscht: ${imagePath}`);
      } else {
        console.log(`Vorschaubild nicht gefunden: ${imagePath}`);
      }
    } catch (fileError) {
      console.error("Fehler beim Entfernen der Dateien:", fileError);
    }
    await content.destroy();
    res.status(200).send("H5P-Inhalt erfolgreich entfernt.");
  } catch (error) {
    res.status(500).send("Fehler beim Entfernen des H5P-Inhalts.");
  }
});

// Fakultät löschen (inkl. zugehöriger H5P-Inhalte)
router.delete("/faculties/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const h5pContents = await H5PContent.findAll({ where: { facultyId: id } });
    for (const content of h5pContents) {
      const h5pFolderPath = path.join(baseDataDir, "h5p", content.h5pJsonPath);
      deleteFolderRecursive(h5pFolderPath);
      const imagePath = path.join(
        baseDataDir,
        "previewimages",
        path.basename(content.previewImage)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Bilddatei gelöscht: ${imagePath}`);
      }
    }
    const result = await Faculty.destroy({ where: { id } });
    if (result)
      res
        .status(200)
        .send("Fachbereich und zugehörige H5P-Inhalte erfolgreich entfernt.");
    else res.status(404).send("Fachbereich nicht gefunden.");
  } catch (error) {
    console.error("Fehler beim Entfernen des Fachbereichs:", error);
    res.status(500).send("Fehler beim Entfernen des Fachbereichs.");
  }
});

// Fakultät bearbeiten
router.put("/faculties/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name ist erforderlich" });
  try {
    const faculty = await Faculty.findByPk(id);
    if (!faculty) return res.status(404).json({ error: "Nicht gefunden" });
    faculty.name = name;
    await faculty.save();
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

// H5P-Inhalt bearbeiten
router.put("/h5pContent/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  // Erweitere die Destrukturierung um facultyId
  const { name, category, info, facultyId } = req.body;
  try {
    const content = await H5PContent.findByPk(id);
    if (!content) return res.status(404).json({ error: "Nicht gefunden" });
    if (name) content.name = name;
    if (category) content.category = category;
    if (info) content.info = info;
    if (facultyId) content.facultyId = facultyId;
    await content.save();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;
