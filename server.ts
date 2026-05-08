import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/backend/routes/api.ts';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite development
  }));
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // API Routes
  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
