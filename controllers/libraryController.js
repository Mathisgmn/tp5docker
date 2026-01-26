import { LibraryService as LibraryServiceImpl } from "../services/index.js";

function getLibraryService() {
  return globalThis.__TEST_SERVICES__?.LibraryService ?? LibraryServiceImpl;
}

// GET /api/lib
export async function myLibrary(req, res, next) {
  try {
    const items = await getLibraryService().listLibrary(req.user.sub);
    res.json({ ok: true, data: items });
  } catch (err) { next(err); }
}

// POST /api/lib/:idUser/:idGame
export async function addGameForUser(req, res, next) {
  try {
    const { idUser, idGame } = req.params;
    const initialConfig = req.body ?? {};
    const out = await getLibraryService().addGameForUser({ idUser, idGame, initialConfig });
    res.status(201).json({ ok: true, data: out });
  } catch (err) { next(err); }
}

// DELETE /api/lib/:idUser/:idGame
export async function removeGameForUser(req, res, next) {
  try {
    const { idUser, idGame } = req.params;
    await getLibraryService().removeGameForUser({ idUser, idGame });
    res.status(204).send();
  } catch (err) { next(err); }
}

// GET /api/lib/:idGame/config
export async function getMyGameConfig(req, res, next) {
  try {
    const { idGame } = req.params;
    const cfg = await getLibraryService().getGameConfigForUser({ idUser: req.user.sub, idGame });
    res.json({ ok: true, data: cfg });
  } catch (err) { next(err); }
}

// PATCH /api/lib/:idGame/config
export async function updateMyGameConfig(req, res, next) {
  try {
    const { idGame } = req.params;
    const values = req.body ?? {};
    const cfg = await getLibraryService().updateGameConfigForUser({ idUser: req.user.sub, idGame, values });
    res.json({ ok: true, data: cfg });
  } catch (err) { next(err); }
}

export async function removeMyGame(req, res, next) {
  try {
    const { idGame } = req.params;
    await getLibraryService().removeGameForUser({ idUser: req.user.sub, idGame });
    res.status(204).send();
  } catch (err) { next(err); }
}

export const getUserGameConfig = async (req, res) => {
  try {
    const { idGame } = req.params;
    const idUser = req.user.id; // récupéré grâce à authenticateToken

    const config = await libraryService.getUserGameConfig(idUser, idGame);

    if (!config) {
      return res.status(404).json({ message: "Aucune configuration trouvée pour ce jeu." });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateUserGameConfig = async (req, res) => {
  try {
    const { idGame } = req.params;
    const idUser = req.user.id;
    const { idConfig } = req.body;

    if (!idConfig || typeof idConfig !== "string") {
      return res.status(400).json({ message: "idConfig est requis (string)." });
    }

    const result = await libraryService.updateUserGameConfig(idUser, idGame, idConfig);

    if (!result) {
      return res.status(404).json({ message: "Jeu non trouvé dans ta bibliothèque." });
    }

    return res.status(200).json({ message: "Configuration mise à jour.", idConfig: result.idConfig });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
