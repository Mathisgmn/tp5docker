import { Game } from "../models/index.js";

export async function createGame({ title }) {
  const game = await Game.create({ title });
  return game;
}

export async function getGameById(id) {
  const game = await Game.findByPk(id);
  return game || null;
}

export async function updateGame(id, values) {
  const game = await getGameById(id);
  if (!game) {
    return null;
  }

  return await game.update(values);
}

export async function deleteGame(id) {
  const game = await getGameById(id);
  if (!game) {
    return null;
  }

  await game.destroy();
  return true;
}

export async function getAllGames() {
  return await Game.findAll();
}

export async function gameExists(title) {
  const game = await Game.findOne({ where: { title } });
  return Boolean(game);
}
