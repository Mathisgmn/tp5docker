// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// --- Adapté à ton projet (garde ces imports si tu as ces fichiers) ---
import { sequelize, connectMongo } from './config/database.js';
import { associate } from './models/index.js';
import apiRouter from './routers/index.js';
// ---------------------------------------------------------------------

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Chargement du document OpenAPI (Swagger)
 * Si tu n'as pas de fichier, commente ce bloc.
 */
let openapiDocument = undefined;
try {
  const openapiPath = path.resolve(__dirname, './docs/openapi.yaml');
  if (fs.existsSync(openapiPath)) {
    openapiDocument = YAML.load(openapiPath);
  } else {
    console.warn('ℹ️  docs/openapi.yaml introuvable, Swagger sera désactivé.');
  }
} catch (e) {
  console.warn('ℹ️  Impossible de charger openapi.yaml :', e?.message);
}

const app = express();

/** Middlewares */
app.use(cors()); // ajuste si tu veux restreindre
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/** Swagger UI */
if (openapiDocument) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));
  app.get('/', (_req, res) => res.redirect('/docs'));
} else {
  app.get('/', (_req, res) => res.send('API en ligne. Ajoute /docs si tu actives Swagger.'));
}

/** DB init (SQL + Mongo) */
async function initDatabases() {
  try {
    if (associate) associate();
    if (sequelize) {
      await sequelize.sync({ alter: true });
      console.log('✅ Base SQL synchronisée');
    }
    if (connectMongo) {
      await connectMongo();
      console.log('✅ Connexion Mongo OK');
    }
  } catch (err) {
    console.error('❌ Erreur d’initialisation BDD :', err);
    // En dev, on laisse quand même le serveur démarrer pour déboguer les configs.
  }
}

/** Routes API */
app.use('/api', apiRouter);

/** Lancement serveurs HTTP/HTTPS */
async function start() {
  await initDatabases();

  // HTTP
  const HTTP_PORT = Number(process.env.PORT || 3000);
  const httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP:  http://localhost:${HTTP_PORT}`);
  });

  // HTTPS (optionnel via env HTTPS=true)
  const wantHttps = String(process.env.HTTPS || '').toLowerCase() === 'true';
  if (wantHttps) {
    const keyPath = process.env.SSL_KEY_PATH || './certs/key.pem';
    const certPath = process.env.SSL_CERT_PATH || './certs/cert.pem';

    const missing = [];
    if (!fs.existsSync(keyPath)) missing.push(keyPath);
    if (!fs.existsSync(certPath)) missing.push(certPath);

    if (missing.length) {
      console.warn(
        `⚠️  HTTPS désactivé: certificats introuvables (${missing.join(
          ', '
        )}). Vérifie SSL_KEY_PATH / SSL_CERT_PATH.`
      );
    } else {
      try {
        const creds = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        const HTTPS_PORT = Number(process.env.HTTPS_PORT || 3443);
        const httpsServer = https.createServer(creds, app);
        httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
          console.log(`🔒 HTTPS: https://localhost:${HTTPS_PORT}`);
        });
      } catch (e) {
        console.error('❌ Erreur au démarrage HTTPS :', e);
      }
    }
  }
}

// Démarrage
if (process.env.NODE_ENV !== 'test') {
  start().catch((e) => {
    console.error('❌ Erreur au démarrage de l’application :', e);
    process.exit(1);
  });
}

export { start };
export default app;
