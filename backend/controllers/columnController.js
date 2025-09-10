import { Column, Board } from "../model/index.js";

// Helper function to emit board updates
const emitBoardUpdate = async (io, boardId) => {
  const board = await Board.findByPk(boardId, {
    include: [{ model: Column, as: "columns", include: ["cards"] }],
    order: [[{ model: Column, as: "columns" }, "position", "ASC"]]
  });
  io.to(boardId).emit("boardUpdated", board);
};

export const createColumn = async (req, res, next) => {
  try {
    const { title, boardId } = req.body;
    
    // 1. Count existing columns to determine the new position
    const columnCount = await Column.count({ where: { boardId } });
    
    // 2. Create the new column with the calculated position
    const column = await Column.create({ 
      title, 
      boardId, 
      position: columnCount 
    });
    
    // 3. Emit the update
    await emitBoardUpdate(req.io, boardId);
    res.status(201).json(column);
  } catch (err) {
    next(err);
  }
};
export const updateColumn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const column = await Column.findByPk(id);
    if (!column) return res.status(404).json({ message: "Column not found" });
    
    column.title = title;
    await column.save();
    
    await emitBoardUpdate(req.io, column.boardId);
    res.json(column);
  } catch (err) {
    next(err);
  }
};

export const deleteColumn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const column = await Column.findByPk(id);
    if (!column) return res.status(404).json({ message: "Column not found" });

    const { boardId } = column;
    await column.destroy();

    await emitBoardUpdate(req.io, boardId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// This controller is not yet implemented in the provided route but is here for completeness.
export const reorderColumns = async (req, res, next) => {
  // Logic for reordering columns would go here
  res.status(501).json({ message: "Not implemented" });
};