import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: false,
});

export default AuditLog;
