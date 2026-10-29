import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestContext } from "./middlewares/request-context.js";
import { errorHandler, notFound } from "./middlewares/error-handler.js";
import { createRoutes } from "./routes/index.js";

// Tạo ứng dụng Express, gắn middleware và các tuyến API /api/v1.
export function createApp({
  authService,
  sessionService,
  adminAccountService,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      exposedHeaders: ["X-Request-Id"],
    }),
  );
  app.use(express.json({ limit: "32kb", strict: true }));
  app.get("/", (_req, res) => {
    res.status(200).json({ message: "Đã kết nối đến server" });
  });
  app.use(
    "/api/v1",
    createRoutes(authService, sessionService, adminAccountService),
  );
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
