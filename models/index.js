import Game from "./gameModel.js";
import User from "./userModel.js";
import UserGame from "./userGameModel.js";

export const associate = () => {
  User.belongsToMany(Game, {
    through: UserGame,
    foreignKey: "idUser",
    otherKey: "idGame",
    as: "games",
  });

  Game.belongsToMany(User, {
    through: UserGame,
    foreignKey: "idGame",
    otherKey: "idUser",
    as: "users",
  });

  // pour que include: { as: "game" } fonctionne
  UserGame.belongsTo(Game, { foreignKey: "idGame", as: "game" });
  UserGame.belongsTo(User, { foreignKey: "idUser", as: "user" });
};

export { Game, User, UserGame };
