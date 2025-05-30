// server.js para correr /api/auth.js como endpoint local
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde /api/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Importar la función exportada por auth.js
const authHandler = require('./auth');

// Exponer el endpoint /api/auth
app.all('/api/auth', (req, res) => authHandler(req, res));

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}/api/auth`);
});
