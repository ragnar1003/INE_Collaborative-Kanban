
import express from "express";
import auth from "../middlewares/auth.js";
import {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCardsInColumn
} from "../controllers/cardController.js";

const router = express.Router();
router.use(auth);


router.post("/", createCard);


router.get("/:id", getCard);


router.put("/:id", updateCard);


router.delete("/:id", deleteCard);


router.put("/:id/move", moveCard);


router.put("/reorder", reorderCardsInColumn);

export default router;
