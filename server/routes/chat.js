import { Router } from "express";
import {
  sendMessage,
  guestMessage,
  getChats,
  getChat,
  deleteChat,
} from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = Router();

// guest chat — no auth required
router.post("/guest", guestMessage);

// authenticated chat routes
router.post("/", auth, sendMessage);
router.get("/", auth, getChats);
router.get("/:id", auth, getChat);
router.delete("/:id", auth, deleteChat);

export default router;
