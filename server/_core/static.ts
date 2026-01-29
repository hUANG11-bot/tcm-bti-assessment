import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Node 16 无 import.meta.dirname，用 url 模块兼容
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 生产环境静态文件服务（不依赖 Vite，避免 Node 16 下加载 Vite 报错）。
 * 开发环境仍通过 vite.ts 的 setupVite 提供。
 */
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
