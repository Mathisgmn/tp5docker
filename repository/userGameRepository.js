import { UserGame, Game } from "../models/index.js";

export async function addUserGameLink({ idUser, idGame, idConfig }) {
  return await UserGame.create({ idUser, idGame, idConfig });
}

export async function removeUserGameLink({ idUser, idGame }) {
  return (await UserGame.destroy({ where: { idUser, idGame } })) > 0;
}

export async function getUserGameLink({ idUser, idGame }) {
  return await UserGame.findOne({ where: { idUser, idGame } });
}

export async function listUserLibrary(idUser) {
  return await UserGame.findAll({
    where: { idUser },
    include: [{ model: Game, as: "game" }],
    order: [["idGame", "ASC"]],
  });
}

