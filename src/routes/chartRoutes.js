import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createChart, getChartData } from "../controllers/chartController.js";

const router = express.Router();

router.post("/", protect, authorize("admin", "editor"), createChart);
router.get("/:chartId", protect, getChartData);

export default router;
