import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadCSV } from "../controllers/dataController.js";

const router = express.Router();

router.post("/upload", protect, authorize("admin", "editor"), uploadCSV);

export default router;
