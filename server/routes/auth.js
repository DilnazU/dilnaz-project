import { Router } from "express";
import { signup, login, getMe, logout } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

// public routes
router.post("/signup", signup);  // register a new user
router.post("/login", login);    // log in and receive a JWT cookie

// protected routes (require valid JWT)
router.get("/me", auth, getMe);      // get the currently authenticated user
router.post("/logout", auth, logout); // clear the JWT cookie

export default router;