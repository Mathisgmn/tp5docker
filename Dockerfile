# Utilise Node 20 en version légère
FROM node:20-alpine

# Répertoire de travail
WORKDIR /app

# Copie uniquement les manifestes d'abord (pour la mise en cache)
COPY package*.json ./

# Installe toutes les dépendances (y compris dev pour nodemon)
RUN npm install

# Copie tout le reste du projet
COPY . .

# Expose le port de ton app
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "dev"]
