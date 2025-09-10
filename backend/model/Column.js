
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Column = sequelize.define("Column", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // ordering
  }, {
    tableName: "columns",
    timestamps: true
  });

  return Column;
};
