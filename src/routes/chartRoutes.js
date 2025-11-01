import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createChart,
  getChartData,
  getAllCharts,
} from "../controllers/chartController.js";

const router = express.Router();

router.get("/list", protect, getAllCharts);
router.get("/:chartId", protect, getChartData);
router.post("/create", protect, authorize("admin", "editor"), createChart);

export default router;
