
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Board = sequelize.define("Board", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: "boards",
    timestamps: true
  });

  return Board;
};
