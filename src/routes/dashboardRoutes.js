import express from "express";
import {
  deleteDashboard,
  getAllDashboards,
  getDashboard,
  removeChartFromDashboard,
  saveDashboard,
  updateDashboard,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, saveDashboard);
router.get("/list", protect, getAllDashboards);
router.get("/:id", protect, getDashboard);
router.put("/:id", protect, updateDashboard);
router.delete("/:id", protect, deleteDashboard);
router.delete(
  "/:dashboardId/chart/:chartId",
  protect,
  removeChartFromDashboard
);

export default router;
