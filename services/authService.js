// services/authService.js
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/index.js";
import dotenv from "dotenv";

dotenv.config();

export async function register({ username, password, is_admin = false }) {
  const existing = await UserRepository.getUserByUsername(username);
  if (existing) {
    const e = new Error("Username already taken");
    e.status = 409;
    throw e;
  }
  const user = await UserRepository.createUser({ username, password, is_admin });
  return { id: user.id, username: user.username, is_admin: user.is_admin };
}

export async function login({ username, password }) {
  const user = await UserRepository.verifyCredentials(username, password);
  if (!user) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }
  const token = jwt.sign(
    { sub: user.id, roles: user.is_admin ? ["admin"] : ["user"] },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return {
    token,
    user: { id: user.id, username: user.username, is_admin: user.is_admin },
  };
}
