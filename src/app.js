import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

// Routes
app.use("/api", routes);

// Global error handler
app.use(errorMiddleware);

export default app;