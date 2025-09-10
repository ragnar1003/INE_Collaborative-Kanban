
import { Card, sequelize } from "../models/index.js";
import { Op } from "sequelize";

export const moveCard = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { cardId } = req.params;
    const { toColumnId, toPosition } = req.body; 

    const card = await Card.findByPk(cardId, { transaction: t });
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
    res.json(card);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
