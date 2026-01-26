import express from "express";
import gameRouter from "./gameRouter.js";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import libraryRouter from "./libraryRouter.js";

const router = express.Router();

// Regroupe toutes les sous-routes
router.use("/games", gameRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/lib", libraryRouter);

export default router;
