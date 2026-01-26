import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const UserGame = sequelize.define("UserGame", {
  idUser:  { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  idGame:  { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  idConfig:{ type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "user_game",
  timestamps: false,
});

export default UserGame;
