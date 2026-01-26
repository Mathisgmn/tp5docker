import { Router } from "express";
import { UserController } from "../controllers/index.js";
import { requireAuth, requireRole } from "../middleware/auth.jwt.js";

const router = Router();

// GET /api/users/me  (profil connecté)
router.get("/me", requireAuth, UserController.me);

// GET /api/users     (liste users - réservé admin)
router.get("/", requireAuth, requireRole("admin"), UserController.list);

export default router;
