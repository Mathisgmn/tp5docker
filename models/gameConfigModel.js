import mongoose from "mongoose";
import crypto from "crypto";

const gameConfigSchema = new mongoose.Schema({
  id: { type: String, default: () => crypto.randomUUID(), required: true },
  resolution: { type: String, default: "1920x1080" },
  volume: { type: Number, default: 100 },
}, { timestamps: false });

export default mongoose.model("GameConfig", gameConfigSchema);
