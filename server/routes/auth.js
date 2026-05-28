import { Router } from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/me", auth, getCurrentUser);

// Управление аккаунтом (только для вошедших)
router.put("/password", auth, changePassword);
router.delete("/account", auth, deleteAccount);

export default router;