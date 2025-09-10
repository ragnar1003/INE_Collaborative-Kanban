
import { Board, Column, User } from "../models/index.js";

export const createBoard = async (req, res, next) => {
  try {
    const board = await Board.create({ title: req.body.title, description: req.body.description, userId: req.user.id });
    res.status(201).json(board);
  } catch (err) { next(err); }
};

export const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [{ model: Column, as: "columns", include: ["cards"] }, { model: User, as: "owner", attributes: ["id","name","email"] }],
      order: [[{ model: Column, as: "columns" }, "position", "ASC"]]
    });
    res.json(board);
  } catch (err) { next(err); }
};
