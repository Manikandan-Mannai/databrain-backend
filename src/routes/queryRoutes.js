import express from "express";
import { getQueryById, runQuery } from "../controllers/queryController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run", protect, authorize("admin", "editor"), runQuery);
router.get("/:id", protect, getQueryById);

export default router;
