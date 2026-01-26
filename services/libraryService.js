// services/libraryService.js
import {
  UserGameRepository,
  GameRepository,
  GameConfigRepository
} from "../repository/index.js";

/**
 * 📚 Liste la librairie d’un utilisateur (avec leurs jeux + config associée)
 */
export async function listLibrary(idUser) {
  const userGames = await UserGameRepository.listUserLibrary(idUser);
  return userGames.map(link => ({
    idGame: link.idGame,
    title: link.game?.title,
    idConfig: link.idConfig,
  }));
}

/**
 * ➕ Ajoute un jeu à la librairie d’un utilisateur
 * Crée un document de config dans MongoDB, puis le lien SQL (UserGame)
 */
export async function addGameForUser({ idUser, idGame, initialConfig = {} }) {
  // Vérifie si le jeu existe
  const game = await GameRepository.getGameById(idGame);
  if (!game) {
    const e = new Error("Game not found");
    e.status = 404;
    throw e;
  }

  // Vérifie que l’utilisateur n’a pas déjà le jeu
  const existing = await UserGameRepository.getUserGameLink({ idUser, idGame });
  if (existing) {
    const e = new Error("User already owns this game");
    e.status = 409;
    throw e;
  }

  // Crée la configuration dans MongoDB
  const config = await GameConfigRepository.createConfig(initialConfig);

  // Crée le lien dans la table SQL (UserGame)
  const link = await UserGameRepository.addUserGameLink({
    idUser,
    idGame,
    idConfig: config.id,
  });

  return { link, config };
}

/**
 * ➖ Supprime un jeu de la librairie d’un utilisateur
 * Supprime le lien UserGame et la config associée
 */
export async function removeGameForUser({ idUser, idGame }) {
  const link = await UserGameRepository.getUserGameLink({ idUser, idGame });
  if (!link) {
    const e = new Error("This user does not own this game");
    e.status = 404;
    throw e;
  }

  // Supprime la config Mongo
  await GameConfigRepository.deleteConfig(link.idConfig);
  // Supprime le lien SQL
  await UserGameRepository.removeUserGameLink({ idUser, idGame });

  return true;
}

/**
 * ⚙️ Récupère la config d’un jeu pour un utilisateur
 */
export async function getGameConfigForUser({ idUser, idGame }) {
  const link = await UserGameRepository.getUserGameLink({ idUser, idGame });
  if (!link) {
    const e = new Error("Game not found in user's library");
    e.status = 404;
    throw e;
  }

  const config = await GameConfigRepository.getConfigById(link.idConfig);
  return config;
}

/**
 * ✏️ Met à jour la config d’un jeu pour un utilisateur
 */
export async function updateGameConfigForUser({ idUser, idGame, values }) {
  const link = await UserGameRepository.getUserGameLink({ idUser, idGame });
  if (!link) {
    const e = new Error("Game not found in user's library");
    e.status = 404;
    throw e;
  }

  const updated = await GameConfigRepository.updateConfig(link.idConfig, values);
  return updated;
}

export const getUserGameConfig = async (idUser, idGame) => {
  const userGame = await userGameRepository.getUserGameLink(idUser, idGame);
  if (!userGame) return null;

  return { idConfig: userGame.idConfig };
};

