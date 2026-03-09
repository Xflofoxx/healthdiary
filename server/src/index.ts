import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/error';
import appointmentsRouter from './routes/appointments';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import illnessesRouter from './routes/illnesses';
import prescriptionsRouter from './routes/prescriptions';
import { logger } from './utils/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger);

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Healthdiary - Personal Health Diary</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { background: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); padding: 3rem; max-width: 600px; width: 90%; text-align: center; }
    .logo { font-size: 4rem; color: #667eea; margin-bottom: 1rem; }
    h1 { font-size: 2.5rem; color: #1a202c; margin-bottom: 0.5rem; }
    .tagline { color: #718096; font-size: 1.2rem; margin-bottom: 2rem; }
    .description { color: #4a5568; line-height: 1.8; margin-bottom: 2rem; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .feature { padding: 1.5rem; background: #f7fafc; border-radius: 12px; }
    .feature i { font-size: 2rem; color: #667eea; margin-bottom: 0.5rem; }
    .feature h3 { color: #2d3748; font-size: 1rem; margin-bottom: 0.25rem; }
    .feature p { color: #718096; font-size: 0.875rem; }
    .buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover { background: #5a67d8; transform: translateY(-2px); }
    .btn-secondary { background: #edf2f7; color: #4a5568; }
    .btn-secondary:hover { background: #e2e8f0; }
    .footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; color: #a0aec0; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><i class="fas fa-heartbeat"></i></div>
    <h1>Healthdiary</h1>
    <p class="tagline">Your Personal Health Companion</p>
    <p class="description">
      A modern personal health diary for tracking your illnesses, prescriptions, and doctor appointments. 
      Secure, private, and easy to use with passwordless WebAuthn authentication.
    </p>
    <div class="features">
      <div class="feature">
        <i class="fas fa-user-injured"></i>
        <h3>Illness Tracking</h3>
        <p>Track your illnesses with dates and notes</p>
      </div>
      <div class="feature">
        <i class="fas fa-pills"></i>
        <h3>Prescriptions</h3>
        <p>Manage your medications</p>
      </div>
      <div class="feature">
        <i class="fas fa-calendar-check"></i>
        <h3>Appointments</h3>
        <p>Never miss a doctor visit</p>
      </div>
    </div>
    <div class="buttons">
      <a href="/login" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a href="/register" class="btn btn-secondary"><i class="fas fa-user-plus"></i> Register</a>
    </div>
    <div class="footer">
      <p>Built with Bun.js, SQLite, DuckDB & Angular</p>
    </div>
  </div>
</body>
</html>
  `);
});

app.route('/api/v1/auth', authRouter);
app.route('/api/v1/illnesses', illnessesRouter);
app.route('/api/v1/prescriptions', prescriptionsRouter);
app.route('/api/v1/appointments', appointmentsRouter);
app.route('', healthRouter);

app.onError(errorHandler);

export default app;
