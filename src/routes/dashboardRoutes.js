import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  saveDashboard,
  getAllDashboards,
  getDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

// 🧱 Save or update a dashboard
router.post(
  "/save",
  protect,
  authorize("admin", "editor", "user"),
  saveDashboard
);

// 📋 Get all dashboards for the logged-in user
router.get("/list", protect, getAllDashboards);

// 🔍 Get single dashboard by ID
router.get("/:id", protect, getDashboard);

export default router;
