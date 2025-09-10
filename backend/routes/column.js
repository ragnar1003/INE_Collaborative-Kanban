
import express from "express";
import auth from "../middlewares/auth.js";
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


router.put("/reorder", reorderColumns);

export default router;
