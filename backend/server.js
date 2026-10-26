import "dotenv/config";
import cors from "cors";
import express from "express";
import "./config/database.js";
import "./config/redis.js";
import apiRoutes from "./routes/index.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// Trang chủ API
app.get("/", (_req, res) => {
  res.json({
    message:
      "Chào mừng đến với API Dịch Vụ Minh Đức (Minh Duc Home Maintenance & Repair Service System)",
    status: "ONLINE",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
    },
  });
});

// Toàn bộ API tập trung vào /api
app.use("/api", apiRoutes);


app.listen(port, () => {
  console.log(`Minh Duc Service API listening on port ${port}`);
  console.log(`API docs at http://localhost:${port}/api/health`);
});
