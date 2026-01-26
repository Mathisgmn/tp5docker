import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Game = sequelize.define("game", {
  idGame: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
  title: { type: DataTypes.STRING(100), allowNull: false, unique: true },
}, { timestamps: false });

export default Game;
