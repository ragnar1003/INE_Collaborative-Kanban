import { Card, Column, Board, sequelize } from "../model/index.js";
import { Op } from "sequelize";

// Helper function to emit board updates
const emitBoardUpdate = async (io, boardId) => {
  const board = await Board.findByPk(boardId, {
    include: [{ model: Column, as: "columns", include: ["cards"] }],
    order: [[{ model: Column, as: "columns" }, "position", "ASC"]]
  });
  io.to(boardId).emit("boardUpdated", board);
};

export const createCard = async (req, res, next) => {
  try {
    const { title, columnId } = req.body;
    const card = await Card.create({ title, columnId });
    
    const column = await Column.findByPk(columnId);
    await emitBoardUpdate(req.io, column.boardId);
    req.io.to(column.boardId).emit("notification", {
      type: "CardCreated",
      message: `Card \"${card.title}\" created in column \"${column.title}\".`,
      cardId: card.id,
      boardId: column.boardId
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.title = title ?? card.title;
    card.description = description ?? card.description;
    await card.save();

    const column = await Column.findByPk(card.columnId);
    await emitBoardUpdate(req.io, column.boardId);
    req.io.to(column.boardId).emit("notification", {
      type: "CardUpdated",
      message: `Card \"${card.title}\" updated in column \"${column.title}\".`,
      cardId: card.id,
      boardId: column.boardId
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    
    const column = await Column.findByPk(card.columnId);
    await card.destroy();
    
    await emitBoardUpdate(req.io, column.boardId);
    req.io.to(column.boardId).emit("notification", {
      type: "CardDeleted",
      message: `Card deleted from column \"${column.title}\".`,
      cardId: id,
      boardId: column.boardId
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const moveCard = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params; // cardId is in params
    const { toColumnId, toPosition } = req.body; 

    const card = await Card.findByPk(id, { transaction: t });
    if (!card) throw Object.assign(new Error("Card not found"), { status: 404 });

    const fromColumnId = card.columnId;
    const fromPosition = card.position;

    if (fromColumnId === toColumnId && fromPosition === toPosition) {
      await t.commit();
      return res.json(card);
    }

    await Card.update(
      { position: sequelize.literal("position - 1") },
      { where: { columnId: fromColumnId, position: { [Op.gt]: fromPosition } }, transaction: t }
    );

    await Card.update(
      { position: sequelize.literal("position + 1") },
      { where: { columnId: toColumnId, position: { [Op.gte]: toPosition } }, transaction: t }
    );

    await card.update({ columnId: toColumnId, position: toPosition }, { transaction: t });
    await t.commit();
    
    const column = await Column.findByPk(toColumnId);
    await emitBoardUpdate(req.io, column.boardId);
    req.io.to(column.boardId).emit("notification", {
      type: "CardMoved",
      message: `Card \"${card.title}\" moved to column \"${column.title}\".`,
      cardId: card.id,
      boardId: column.boardId
    });
    res.json(card);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// The following functions are not implemented in the provided routes but are here for completeness.
export const getCard = async (req, res, next) => res.status(501).json({ message: "Not implemented" });
export const reorderCardsInColumn = async (req, res, next) => res.status(501).json({ message: "Not implemented" });