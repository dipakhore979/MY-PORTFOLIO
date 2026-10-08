import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

let server;

const start = async () => {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`API running in ${env.nodeEnv} mode on port ${env.port}`);
    if (!env.mail.enabled) console.warn('Email not configured: contact notifications are disabled');
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received: shutting down`);
  server?.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  shutdown('unhandledRejection');
});

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
