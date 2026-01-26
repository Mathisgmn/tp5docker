import { GameService as GameServiceImpl } from "../services/index.js";
// import { GameError } from "../errors/index.error.js"; // tu pourras définir ça plus tard si tu veux gérer des erreurs custom

function getGameService() {
  return globalThis.__TEST_SERVICES__?.GameService ?? GameServiceImpl;
}

export async function getAllGames(req, res, next) {
  try {
    const games = await getGameService().getAllGames();
    res.json(games);
  } catch (error) {
    next(error);
  }
}

export async function getGameById(req, res, next) {
  try {
    const id = req.params.id;
    const game = await getGameService().getGameById(id);
    res.json(game);
  } catch (error) {
    next(error);
  }
}

export async function createGame(req, res, next) {
  try {
    const { title } = req.body;
    const newGame = await getGameService().createGame({ title });
    res.json(newGame);
  } catch (error) {
    next(error);
  }
}

export async function updateGame(req, res, next) {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const updatedGame = await getGameService().updateGame(id, { title });
    res.json(updatedGame);
  } catch (error) {
    next(error);
  }
}

export async function deleteGame(req, res, next) {
  try {
    const id = req.params.id;
    const deletedGame = await getGameService().deleteGame(id);
    res.json(deletedGame);
  } catch (error) {
    next(error);
  }
}

export async function getMyGames(req, res, next) {
  try {
    const idUser = req.user.sub; // vient du JWT décodé par requireAuth
    const games = await getGameService().getGamesForUser(idUser);
    res.json({ ok: true, data: games });
  } catch (error) {
    next(error);
  }
}
