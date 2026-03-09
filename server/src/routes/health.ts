import { Hono } from 'hono';
import { getDuckDb } from '../db/duckdb';
import { getDb } from '../db/sqlite';

const healthRouter = new Hono();

const serverStartTime = Date.now();

healthRouter.get('/health', (c) => {
  const services: Record<string, string> = {
    sqlite: 'error',
    duckdb: 'error',
  };

  try {
    getDb().prepare('SELECT 1').get();
    services.sqlite = 'connected';
  } catch {
    services.sqlite = 'error';
  }

  try {
    getDuckDb().run('SELECT 1');
    services.duckdb = 'connected';
  } catch {
    services.duckdb = 'error';
  }

  const allConnected = Object.values(services).every((s) => s === 'connected');
  const status = allConnected ? 'healthy' : 'unhealthy';
  const httpStatus = allConnected ? 200 : 503;

  return c.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      services,
    },
    httpStatus
  );
});

export default healthRouter;
