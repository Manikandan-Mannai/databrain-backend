import express from "express";
import {
  deleteDataSource,
  getDataSources,
  previewDataSource,
  uploadCSV,
} from "../controllers/dataController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", protect, authorize("admin", "editor"), uploadCSV);
router.get("/", protect, getDataSources);
router.delete("/:id", protect, authorize("admin", "editor"), deleteDataSource);
router.get("/preview/:id", protect, previewDataSource);

export default router;
