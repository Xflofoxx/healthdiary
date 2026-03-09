import type { MiddlewareHandler } from 'hono';

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;
  const duration = end - start;

  const logMessage = `${method} ${path} ${status} ${duration}ms`;

  if (status >= 500) {
    console.error(logMessage);
  } else if (status >= 400) {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
};
