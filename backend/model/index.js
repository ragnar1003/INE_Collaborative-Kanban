
import sequelize from "../database/db.js";
import initUser from "./User.js";
import initBoard from "./Board.js";
import initColumn from "./Column.js";
import initCard from "./Card.js";
import AuditLog from "./AuditLog.js";

const User = initUser(sequelize);
const Board = initBoard(sequelize);
const Column = initColumn(sequelize);
const Card = initCard(sequelize);

User.hasMany(Board, { foreignKey: "userId", onDelete: "CASCADE", as: "boards" });
Board.belongsTo(User, { foreignKey: "userId", as: "owner" });


Board.hasMany(Column, { foreignKey: "boardId", onDelete: "CASCADE", as: "columns" });
Column.belongsTo(Board, { foreignKey: "boardId", as: "board" });


Column.hasMany(Card, { foreignKey: "columnId", onDelete: "CASCADE", as: "cards" });
Card.belongsTo(Column, { foreignKey: "columnId", as: "column" });



export { sequelize, User, Board, Column, Card, AuditLog };

