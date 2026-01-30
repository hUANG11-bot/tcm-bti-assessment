import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Node 16 无 import.meta.dirname，用 url 模块兼容；打包后若异常则用 process.cwd() 兜底
let __dirname: string;
try {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  __dirname = typeof dir === "string" && dir ? dir : process.cwd();
} catch {
  __dirname = process.cwd();
}

/**
 * 生产环境静态文件服务（不依赖 Vite，避免 Node 16 下加载 Vite 报错）。
 * 开发环境仍通过 vite.ts 的 setupVite 提供。
 */
export function serveStatic(app: Express) {
  let distPath: string =
    (typeof __dirname === "string" && __dirname && path.resolve(__dirname, "public")) || "";
  if (!distPath || !fs.existsSync(distPath)) {
    distPath = path.join(process.cwd(), "dist", "public");
  }
  if (typeof distPath !== "string" || !distPath || !fs.existsSync(distPath)) {
    console.error(
      `[serveStatic] Could not find build directory (tried ${distPath}), skipping static middleware`
    );
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  const indexHtml = path.resolve(distPath, "index.html");
  app.use("*", (_req, res) => {
    if (typeof indexHtml !== "string" || !indexHtml || !fs.existsSync(indexHtml)) {
      if (!res.headersSent) res.status(404).end();
      return;
    }
    res.sendFile(indexHtml, (err) => {
      if (err && !res.headersSent) res.status(404).end();
    });
  });
}
