import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';
import { uploadDir } from './services/storage.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

app.disable('x-powered-by');
// Number of reverse proxies in front of the API (1 = Render/Railway only, 2 = Vercel/Netlify proxy + host)
app.set('trust proxy', env.trustProxy);

// Images in /uploads must be embeddable by the frontend on another origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin: (origin, cb) => {
      // No Origin header => same-origin, curl, health checks
      if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
      return cb(new ApiError(403, `Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.get('/', (_req, res) => res.json({ success: true, name: 'portfolio-api', docs: '/api/health' }));

app.use('/uploads', express.static(uploadDir, { maxAge: '7d', index: false }));
app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
