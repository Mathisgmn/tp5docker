
import { Router } from "express";
import { GameController } from "../controllers/index.js";
import { requireAuth } from "../middleware/auth.jwt.js";
import { requireRole } from "../middleware/auth.jwt.js";

const router = Router();

//GET tous les jeux
router.get("/mine", requireAuth, GameController.getMyGames);
router.get("/", GameController.getAllGames);

//GET un jeu par id
router.get("/:id", GameController.getGameById);

//POST création d’un jeu (admin plus tard)
router.post("/", requireAuth, requireRole("admin"), GameController.createGame);

//PATCH mise à jour d’un jeu (admin plus tard)

//DELETE suppression d’un jeu (admin plus tard)
router.delete("/:id", requireAuth, requireRole("admin"), GameController.deleteGame);

router.patch("/:id", requireAuth, requireRole("admin"),GameController.updateGame);

export default router;
