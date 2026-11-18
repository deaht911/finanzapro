const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

if (!process.env.JWT_SECRET) {
  console.error('Falta la variable JWT_SECRET');
  process.exit(1);
}

const app = express();

// Paso 5.4 de la guía: orígenes permitidos por CORS.
// Se aceptan los de desarrollo local, el dominio de Vercel y los extra que lleguen por CORS_ORIGIN.
const origins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://finanzapro-eight.vercel.app', // dominio de producción en Vercel
  ...(process.env.CORS_ORIGIN || '').split(','),
]
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: [...new Set(origins)], credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API FinanzaPro escuchando en el puerto ${PORT}`)))
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
