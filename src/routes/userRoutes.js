
import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  registerUser,
  updateUserRole,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/all", protect, getAllUsers);
router.put("/role", protect, updateUserRole);
router.delete("/:userId", protect, deleteUser);

export default router;
