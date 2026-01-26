import User from "../models/userModel.js";
import Game from "../models/gameModel.js";
import bcrypt from "bcrypt";

export async function createUser({ username, password, is_admin = false }) {
  const password_hash = await bcrypt.hash(password, 10);
  return await User.create({ username, password_hash, is_admin });
}

export async function getUserById(id, { withGames = false } = {}) {
  if (withGames) {
    return await User.findByPk(id, {
      include: [{ model: Game, as: "games" }],
    });
  }
  return await User.findByPk(id);
}

export async function getUserByUsername(username) {
  return await User.findOne({ where: { username } });
}

export async function verifyCredentials(username, password) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}


export async function updateUser(id, values) {
  const user = await User.findByPk(id);
  if (!user) return null;
  // Empêche la mise à jour directe du password_hash
  if (values.password) {
    values.password_hash = await bcrypt.hash(values.password, 10);
    delete values.password;
  }
  return await user.update(values);
}
export async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return true;
}

export async function getAllUsers() {
  return await User.findAll();
}
