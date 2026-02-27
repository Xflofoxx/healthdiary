import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/error";
import illnessesRouter from "./routes/illnesses";
import prescriptionsRouter from "./routes/prescriptions";
import appointmentsRouter from "./routes/appointments";
import healthRouter from "./routes/health";

const app = new Hono();

app.use("*", cors());
app.use("*", logger);

app.get("/", (c) => {
  return c.json({ message: "Healthdiary API v1.0.0" });
});

app.route("/api/v1/illnesses", illnessesRouter);
app.route("/api/v1/prescriptions", prescriptionsRouter);
app.route("/api/v1/appointments", appointmentsRouter);
app.route("", healthRouter);

app.onError(errorHandler);

export default app;
