import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet with customized CSP to allow modern web fonts & scripts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://air-quality-api.open-meteo.com", "https://api.open-meteo.com", "https://generativelanguage.googleapis.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key']
  })
);

// Rate Limiter: 200 requests per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again shortly.' }
});
app.use('/api', limiter);

// JSON body parser with size limit to prevent memory exhaustion
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Safe global error handler middleware (never leak stack traces or server paths)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[BreatheSmart Error Logger]:', err.message);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred. Please try again later.'
  });
});

// Serve static frontend files if built
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>BreatheSmart AI Server</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; text-align: center; }
              .card { max-width: 600px; margin: 40px auto; background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; }
              h1 { color: #10b981; }
              a { color: #38bdf8; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🛡️ BreatheSmart AI Server Active</h1>
              <p>Backend API is running on port ${PORT}.</p>
              <p><a href="/api/health">Check Health Status</a> | <a href="/api/aqi?city=Delhi">View Live AQI API</a></p>
              <p>To view the full UI, run <code>npm run dev</code> or <code>npm run build</code>.</p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[BreatheSmart AI] Server operational at http://localhost:${PORT}`);
  });
}

export default app;
