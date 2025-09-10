import express from "express";
import auth from "../middleware/auth.js";
import {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
} from "../controllers/columnController.js";

const router = express.Router();
router.use(auth);

router.post("/", createColumn);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);
// The reorder route is defined but the controller logic is not yet implemented
router.put("/reorder", reorderColumns);

export default router;