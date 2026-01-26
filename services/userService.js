import { UserRepository } from "../repository/index.js";

export async function getMe(userId) {
  const me = await UserRepository.getUserById(userId, { withGames: true });
  if (!me) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return me;
}

export async function getAllUsers() {
  return await UserRepository.getAllUsers();
}
