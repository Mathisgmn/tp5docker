import GameConfig from "../models/gameConfigModel.js";

export async function createConfig(payload = {}) {
  return await GameConfig.create(payload);
}

export async function getConfigById(id) {
  return await GameConfig.findOne({ id });
}

export async function updateConfig(id, values = {}) {
  return await GameConfig.findOneAndUpdate({ id }, values, { new: true, runValidators: true });
}

export async function deleteConfig(id) {
  const res = await GameConfig.deleteOne({ id });
  return res.deletedCount > 0;
}
