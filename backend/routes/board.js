import express from "express";
import auth from "../middleware/auth.js";
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  getAuditLog
} from "../controllers/boardController.js";

const router = express.Router();

router.use(auth);

router.post("/", createBoard);
router.get("/", getBoards);
router.get("/:id", getBoard);

router.get("/:id/audit", getAuditLog);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;