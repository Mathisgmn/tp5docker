import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("user", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
  username: { type: DataTypes.STRING(25), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
}, { timestamps: false });

export default User;
