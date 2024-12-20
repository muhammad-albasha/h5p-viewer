import { Router } from "express";
import Faculty from "../models/faculty.js";
import H5PContent from "../models/H5PContent.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

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

router.get("/h5pData", async (req, res) => {
  const { facultyId } = req.query;

  try {
    const query = facultyId ? { where: { facultyId } } : {};

    const h5pData = await H5PContent.findAll(query);
    res.json(h5pData);
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

export default router;
