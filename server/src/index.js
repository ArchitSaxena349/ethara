import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const origins = process.env.CLIENT_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}

app.use(cors({ origin: origins?.length ? origins : true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "taskflow-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api", notFound);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
