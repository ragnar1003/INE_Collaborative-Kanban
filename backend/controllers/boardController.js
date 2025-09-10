import { AuditLog, Board, Column, Card, User } from "../model/index.js";

export const getAuditLog = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      where: { boardId: req.params.id },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};
// Duplicate function removed

// Duplicate function removed

// Duplicate function removed

// Duplicate function removed

// Duplicate function removed

// Duplicate function removed

const emitBoardUpdate = async (io, boardId) => {
  const board = await Board.findByPk(boardId, {
    include: [{ model: Column, as: "columns", include: ["cards"] }],
    order: [[{ model: Column, as: "columns" }, "position", "ASC"]]
  });
  io.to(boardId).emit("boardUpdated", board);
};

export const createBoard = async (req, res, next) => {
  try {
    const board = await Board.create({ title: req.body.title, description: req.body.description, userId: req.user.id });
    req.io.emit("boardCreated", board); // Notify all users of a new board
    await AuditLog.create({ eventType: "BoardCreated", boardId: board.id, userId: req.user.id, details: { title: board.title } });
    res.status(201).json(board);
  } catch (err) { next(err); }
};

export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.findAll({ where: { userId: req.user.id } });
    res.json(boards);
  } catch (err) { next(err); }
};

export const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [{ model: Column, as: "columns", include: ["cards"] }, { model: User, as: "owner", attributes: ["id","name","email"] }],
      order: [[{ model: Column, as: "columns" }, "position", "ASC"]]
    });
    await AuditLog.create({ eventType: "BoardViewed", boardId: req.params.id, userId: req.user.id });
    res.json(board);
  } catch (err) { next(err); }
};

export const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found." });

    await board.update({ title: req.body.title, description: req.body.description });
    await emitBoardUpdate(req.io, board.id);
    await AuditLog.create({ eventType: "BoardUpdated", boardId: board.id, userId: req.user.id, details: { title: board.title } });
    res.json(board);
  } catch (err) { next(err); }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found." });
    
    await board.destroy();
    req.io.emit("boardDeleted", { id: req.params.id }); // Notify all users
    await AuditLog.create({ eventType: "BoardDeleted", boardId: req.params.id, userId: req.user.id });
    res.status(204).send();
  } catch (err) { next(err); }
};