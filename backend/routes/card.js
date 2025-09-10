import express from "express";
import auth from "../middleware/auth.js";
import {
  createCard,
  updateCard,
  deleteCard,
  moveCard
} from "../controllers/cardController.js";

const router = express.Router();
router.use(auth);

router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);
router.put("/:id/move", moveCard);

export default router;