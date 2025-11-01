import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { runQuery, getQueryById } from "../controllers/queryController.js";

const router = express.Router();

router.post("/run", protect, authorize("admin", "editor"), runQuery);
router.get("/:id", protect, getQueryById);

export default router;
