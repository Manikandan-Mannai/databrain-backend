import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  uploadCSV,
  getDataSources,
  deleteDataSource,
  previewDataSource,
} from "../controllers/dataController.js";

const router = express.Router();

router.post("/upload", protect, authorize("admin", "editor"), uploadCSV);
router.get("/", protect, getDataSources);
router.delete("/:id", protect, authorize("admin", "editor"), deleteDataSource);
router.get("/preview/:id", protect, previewDataSource);

export default router;
