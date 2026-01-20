# 修复运行时语法错误

## ❌ 错误信息

微信开发者工具报错：
```
Error: file: pages/profile/index.js
unknown: Missing semicolon. (1:13013)
```

## 🔍 问题分析

编译后的代码被压缩成一行，在第13013个字符处缺少分号。这可能是因为：
1. 代码压缩/混淆导致的问题
2. 源代码中有语法错误
3. 编译配置问题

## ✅ 解决方案

### 方案1：清理并重新编译

**在 PowerShell 中运行**：

```powershell
cd d:\tcm-bti-assessment

# 清理 dist 目录
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 重新编译
pnpm build:weapp:prod
```

### 方案2：检查源代码

检查 `src/pages/profile/index.tsx` 是否有语法错误，特别是：
- 缺少分号
- 字符串拼接问题
- 模板字符串问题

### 方案3：禁用代码压缩（临时测试）

如果问题持续，可以临时禁用代码压缩来查看具体错误：

修改 `config/index.js` 中的 `minify` 配置。

---

## 🚀 立即操作

**请先清理 dist 目录并重新编译**：

```powershell
cd d:\tcm-bti-assessment
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm build:weapp:prod
```

---

**如果问题仍然存在，请提供具体的错误信息！**
