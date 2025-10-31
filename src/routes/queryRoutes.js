import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { runQuery } from "../controllers/queryController.js";

const router = express.Router();

router.post("/run", protect, authorize("admin", "editor"), runQuery);

export default router;
