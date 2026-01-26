import { Sequelize } from "sequelize";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const POSTGRES_HOST = process.env.POSTGRES_HOST || "localhost";
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT || 5432);

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: "postgres",
    logging: false,
  }
);

export async function connectMongo() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://mongo:27017/maets";
    await mongoose.connect(uri, { dbName: "maets" });
    console.log("✅ Connexion à MongoDB réussie !");
  } catch (error) {
    console.error("❌ Erreur de connexion à MongoDB :", error);
  }
}
