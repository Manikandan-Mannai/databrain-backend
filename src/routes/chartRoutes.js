import express from "express";
import {
  createChart,
  deleteChart,
  getAllCharts,
  getChartData,
  updateChart,
} from "../controllers/chartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createChart);
router.get("/list", getAllCharts);
router.get("/:chartId", protect, getChartData);
router.put("/:chartId", protect, updateChart);
router.delete("/:chartId", protect, deleteChart);

export default router;
