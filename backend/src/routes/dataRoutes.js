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
    const { facultyId } = req.query;

    // H5P-Daten basierend auf facultyId filtern, falls vorhanden
    const whereCondition = facultyId ? { facultyId } : {};
    const h5pData = await H5PContent.findAll({ where: whereCondition });

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

router.delete("/h5pContent/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const content = await H5PContent.findByPk(id);
    if (!content) {
      return res.status(404).send("H5P-Inhalt nicht gefunden.");
    }

    // Entferne Dateien vom Server
    try {
      fs.rmSync(`public/${content.h5pJsonPath}`, {
        recursive: true,
        force: true,
      });
      fs.unlinkSync(`public/${content.previewImage}`);
    } catch (fileError) {
      console.error("Fehler beim Entfernen der Dateien:", fileError);
    }

    await content.destroy();
    res.status(200).send("H5P-Inhalt erfolgreich entfernt.");
  } catch (error) {
    res.status(500).send("Fehler beim Entfernen des H5P-Inhalts.");
  }
});

router.delete("/faculties/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Hole alle zugehörigen H5P-Inhalte
    const h5pContents = await H5PContent.findAll({ where: { facultyId: id } });

    // Lösche die Dateien der H5P-Inhalte
    h5pContents.forEach((content) => {
      // Lösche H5P-Verzeichnisse
      const h5pDir = path.join(__dirname, `../public/${content.h5pJsonPath}`);
      const imagePath = path.join(
        __dirname,
        `../public/${content.previewImage}`
      );
      try {
        if (fs.existsSync(h5pDir)) {
          fs.rmSync(h5pDir, { recursive: true, force: true });
          console.log(`H5P-Verzeichnis gelöscht: ${h5pDir}`);
        }
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Bilddatei gelöscht: ${imagePath}`);
        }
      } catch (fileError) {
        console.error("Fehler beim Löschen von Dateien:", fileError);
      }
    });

    // Lösche die Fakultät aus der Datenbank (zusammen mit ihren H5P-Inhalten)
    const result = await Faculty.destroy({ where: { id } });

    if (result) {
      res
        .status(200)
        .send("Fachbereich und zugehörige H5P-Inhalte erfolgreich entfernt.");
    } else {
      res.status(404).send("Fachbereich nicht gefunden.");
    }
  } catch (error) {
    console.error("Fehler beim Entfernen des Fachbereichs:", error);
    res.status(500).send("Fehler beim Entfernen des Fachbereichs.");
  }
});

// PUT /faculties/:id
router.put("/faculties/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name ist erforderlich" });
  }

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

// PUT /h5pContent/:id
router.put("/h5pContent/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, category, info } = req.body;

  try {
    const content = await H5PContent.findByPk(id);
    if (!content) return res.status(404).json({ error: "Nicht gefunden" });

    if (name) content.name = name;
    if (category) content.category = category;
    if (info) content.info = info;

    await content.save();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;
