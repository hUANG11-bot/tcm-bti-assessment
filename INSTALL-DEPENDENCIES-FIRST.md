# 先安装依赖

## ❌ 当前问题

从错误信息来看：
1. **`'taro' 不是内部或外部命令`** - Taro CLI 未安装或不在 PATH 中
2. **`WARN Local package.json exists, but node_modules missing`** - 项目依赖未安装

## ✅ 解决方案

### 步骤1：安装项目依赖

**在 PowerShell 中运行**：

```powershell
cd d:\tcm-bti-assessment

# 安装所有依赖（包括 Taro CLI）
pnpm install
```

**这会安装**：
- Taro CLI 工具（`@tarojs/cli`）
- 所有项目依赖（`node_modules`）
- 所有必需的包

### 步骤2：验证安装

**检查 Taro CLI 是否可用**：

```powershell
# 检查本地 Taro CLI
pnpm taro --version

# 或使用 npx
npx taro --version
```

### 步骤3：重新编译

**依赖安装完成后，重新编译**：

```powershell
# 编译生产版本
pnpm build:weapp:prod
```

---

## 📋 当前配置

- ✅ `package.json` 已修复：`TARO_APP_API_URL=https://er1.store`
- ⏳ 需要安装依赖

---

## ⚠️ 如果 `pnpm install` 失败

**检查**：
1. Node.js 是否已安装：`node --version`
2. pnpm 是否已安装：`pnpm --version`
3. 网络连接是否正常

---

**请先运行 `pnpm install` 安装依赖！**
