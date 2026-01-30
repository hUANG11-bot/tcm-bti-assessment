/**
 * 生产环境专用入口。不引用 vite，避免 dist/index.js 在 Node 16 下加载
 * node_modules/vite 时报错（如 node:fs/promises constants）。
 * 开发环境请用 server/_core/index.ts（pnpm dev）。
 */
/** 必须在任何其他 import 之前执行，为 Node 16 提供 Headers/Request polyfill */
import "./polyfill-node16";

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./static";
import cookieParser from "cookie-parser";
import adminAuthRouter from "../api/admin-auth";
import historyRouter from "../api/history";
import wechatLoginRouter from "../api/wechat-login";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  // 更具体的 /api/* 路由必须先挂载，避免被 /api 的 historyRouter 拦截导致 404 或 write after end
  app.use("/api/admin", adminAuthRouter);
  app.use("/api/wechat", wechatLoginRouter);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  app.use("/api", historyRouter);
  registerOAuthRoutes(app);
  serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
