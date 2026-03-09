import type { MiddlewareHandler } from 'hono';
import type { ErrorMessage } from './types';

export const errorHandler: MiddlewareHandler = async (c, err) => {
  console.error('Error:', err);

  const errorMessage: ErrorMessage = {
    error: err.message || 'Internal Server Error',
    status: c.res.status || 500,
  };

  return c.json(errorMessage, errorMessage.status);
};
