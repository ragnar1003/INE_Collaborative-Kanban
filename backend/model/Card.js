
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Card = sequelize.define("Card", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // ordering within column
    dueDate: { type: DataTypes.DATE, allowNull: true },
    labels: { type: DataTypes.JSONB || DataTypes.JSON, allowNull: true }, // tags/labels
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: "cards",
    timestamps: true
  });

  return Card;
};
