# .env 文件位置和创建指南

## ✅ 位置确认

`.env` 文件必须放在**项目根目录**，和 `package.json` 在同一级。

**正确位置**：
```
D:\tcm-bti-assessment\          ← 项目根目录
├── package.json                ← 和这个文件同级
├── .env                        ← 在这里创建！
├── .env.example                ← 模板文件（已创建）
├── src\
├── server\
└── ...
```

## 🚀 创建方法（3种方式）

### 方法1：复制模板文件（最简单）⭐

1. **找到 `.env.example` 文件**
   - 在项目根目录：`D:\tcm-bti-assessment\.env.example`

2. **复制并重命名**
   - 右键点击 `.env.example`
   - 选择"复制"
   - 粘贴到同一目录
   - 重命名为 `.env`（删除 `.example` 部分）

3. **编辑内容**
   - 用记事本打开 `.env` 文件
   - 修改配置值（替换"你的..."部分）

### 方法2：使用文本编辑器创建

1. **打开项目根目录**
   - 路径：`D:\tcm-bti-assessment`

2. **创建新文件**
   - 右键点击空白处
   - 选择"新建" → "文本文档"
   - 将文件名改为 `.env`（注意：文件名就是 `.env`，没有其他扩展名）

3. **如果Windows提示"如果改变文件扩展名，可能导致文件不可用"**
   - 点击"是"确认

4. **编辑内容**
   - 打开 `.env` 文件
   - 复制 `.env.example` 的内容
   - 修改配置值

### 方法3：使用命令行创建（Windows CMD）

```bash
# 1. 进入项目目录
cd D:\tcm-bti-assessment

# 2. 复制模板文件
copy .env.example .env

# 3. 编辑文件
notepad .env
```

## 📝 必需配置项

创建 `.env` 文件后，必须配置以下项：

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信AppSecret

# AI服务配置（推荐DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek API密钥

# JWT密钥（运行 pnpm generate-jwt 生成）
JWT_SECRET=你的JWT密钥
```

## ✅ 验证创建成功

### 方法1：使用检查脚本

```bash
pnpm check-env
```

### 方法2：手动检查

1. **查看文件是否存在**
   - 在项目根目录应该能看到 `.env` 文件
   - 如果看不到，可能是被隐藏了
   - 在文件资源管理器中：查看 → 显示 → 隐藏的项目

2. **检查文件内容**
   - 用记事本打开 `.env` 文件
   - 确认配置项都已填写（没有"你的..."占位符）

3. **测试启动**
   ```bash
   pnpm dev
   ```
   - 如果启动成功，说明配置正确
   - 如果有错误，查看错误信息

## ⚠️ 常见错误

### 错误1：文件位置不对

❌ **错误**：放在 `src/` 或 `server/` 目录下
✅ **正确**：必须放在项目根目录（和 `package.json` 同级）

### 错误2：文件名不对

❌ **错误**：`.env.txt`、`env`、`env.txt`
✅ **正确**：`.env`（注意前面有点，没有扩展名）

### 错误3：配置值有空格

❌ **错误**：
```env
WX_SECRET = your_secret  # 等号两边有空格
```

✅ **正确**：
```env
WX_SECRET=your_secret  # 等号两边没有空格
```

### 错误4：配置值有引号

❌ **错误**：
```env
WX_SECRET="your_secret"  # 不需要引号
```

✅ **正确**：
```env
WX_SECRET=your_secret  # 直接写值，不需要引号
```

## 🔍 如何查看隐藏文件

如果看不到 `.env` 文件：

1. **文件资源管理器**
   - 点击"查看"标签
   - 勾选"隐藏的项目"

2. **命令行查看**
   ```bash
   dir /a .env
   ```

## 📋 完整配置示例

```env
# 微信小程序配置
WX_APPID=wx04a7af67c8f47620
WX_SECRET=abc123def456ghi789

# AI服务配置（DeepSeek）
AI_PROVIDER=deepseek
AI_API_KEY=sk-1234567890abcdefghijklmnop

# JWT密钥
JWT_SECRET=ca340fa1b3614f303f2cf02e4f01148d65a3883626abe277308bcf81d51c55bb

# API服务器地址
TARO_APP_API_URL=http://localhost:3000
```

## 🎯 快速检查清单

- [ ] `.env` 文件在项目根目录（和 `package.json` 同级）
- [ ] 文件名是 `.env`（没有扩展名）
- [ ] 已配置 `WX_APPID` 和 `WX_SECRET`
- [ ] 已配置 `AI_PROVIDER` 和 `AI_API_KEY`
- [ ] 已配置 `JWT_SECRET`
- [ ] 配置值没有多余的空格和引号
- [ ] 运行 `pnpm check-env` 检查通过

## 🎉 完成！

配置完成后，运行 `pnpm dev` 启动服务即可！
