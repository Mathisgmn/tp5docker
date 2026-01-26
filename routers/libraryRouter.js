import { Router } from "express";
import { LibraryController } from "../controllers/index.js";
import { requireAuth, requireRole } from "../middleware/auth.jwt.js";
import { getUserGameConfig } from "../controllers/libraryController.js";

const router = Router();

router.get("/", requireAuth, LibraryController.myLibrary);

/**
 * ➕ Admin : ajouter un jeu à un user
 * POST /api/lib/:idUser/:idGame
 * Body optionnel = config initiale Mongo { ... }
 */
router.post("/:idUser/:idGame",
  requireAuth, requireRole("admin"),
  LibraryController.addGameForUser
);

/**
 * ➖ Admin : retirer un jeu d’un user
 * DELETE /api/lib/:idUser/:idGame
 */
router.delete("/:idUser/:idGame",
  requireAuth, requireRole("admin"),
  LibraryController.removeGameForUser
);

/**
 * ⚙️ Ma config pour un jeu
 * GET /api/lib/:idGame/config
 * PATCH /api/lib/:idGame/config
 */
router.get("/:idGame/config",
  requireAuth,
  LibraryController.getMyGameConfig
);

router.patch("/:idGame/config",
  requireAuth,
  LibraryController.updateMyGameConfig
);

router.delete("/:idGame",
  requireAuth,
  LibraryController.removeMyGame
);

router.get("/:idGame/config", requireAuth, getUserGameConfig);

export default router;
