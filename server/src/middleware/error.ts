import type { MiddlewareHandler } from 'hono';
import type { ErrorMessage } from './types';

export const errorHandler: MiddlewareHandler = async (c, err) => {
  console.error('Error:', err);

  const status = c.res?.status || 500;

  const errorMessage: ErrorMessage = {
    error: err.message || 'Internal Server Error',
    status,
  };

  return new Response(JSON.stringify(errorMessage), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
