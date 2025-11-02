import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  saveDashboard,
  getAllDashboards,
  getDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.post(
  "/save",
  protect,
  authorize("admin", "editor", "user"),
  saveDashboard
);
router.get("/list", protect, getAllDashboards);
router.get("/:id", getDashboard); 

export default router;
