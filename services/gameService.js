import { GameRepository as gameRepo } from "../repository/index.js";
import { UserGameRepository} from "../repository/index.js";

export async function createGame({ title }) {
  const exists = await gameRepo.gameExists(title);
  if (exists) {
    const e = new Error("Game title already exists");
    e.status = 409;
    throw e;
  }
  return await gameRepo.createGame({ title });
}

export async function getGameById(id) {
  const game = await gameRepo.getGameById(id);
  if (!game) {
    const e = new Error("Game not found");
    e.status = 404;
    throw e;
  }
  return game;
}

export async function getAllGames() {
  return await gameRepo.getAllGames();
}

export async function updateGame(id, values) {
  const updated = await gameRepo.updateGame(id, values);
  if (!updated) {
    const e = new Error("Game not found");
    e.status = 404;
    throw e;
  }
  return updated;
}

export async function deleteGame(id) {
  const ok = await gameRepo.deleteGame(id);
  if (!ok) {
    const e = new Error("Game not found");
    e.status = 404;
    throw e;
  }
  return true;
}

export async function getGamesForUser(idUser) {
  const games = await UserGameRepository.listUserLibrary(idUser);
  return games.map(link => link.game);
}

