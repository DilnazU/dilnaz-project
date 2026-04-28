import { Router } from "express";
import { signup, login, logout, getCurrentUser } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/me", auth, getCurrentUser);

export default router;