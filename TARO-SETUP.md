# Taro 小程序开发设置指南

## 问题解决

### 错误：未找到 pages/index/index.wxml 文件

**原因：** Taro 项目需要先编译才能生成小程序文件（.wxml, .wxss, .js等）

**解决方案：**

### 方法1：使用 Taro 编译（推荐）

1. **安装依赖**（如果还没安装）：
   ```bash
   pnpm install
   ```

2. **编译项目**：
   ```bash
   # 开发模式（监听文件变化，自动重新编译）
   pnpm dev:weapp
   
   # 或者生产模式（只编译一次）
   pnpm build:weapp
   ```

3. **在微信开发者工具中打开**：
   - 打开微信开发者工具
   - 选择"导入项目"
   - **重要：项目目录选择 `dist` 目录**（不是项目根目录）
   - 例如：`D:\tcm-bti-assessment\dist`
   - AppID 填写：`wx04a7af67c8f47620`

### 方法2：检查编译输出

编译成功后，`dist` 目录结构应该是：
```
dist/
├── app.js
├── app.json
├── app.wxss
├── pages/
│   ├── index/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── ...
└── ...
```

### 常见问题

1. **编译失败**
   - 检查 Node.js 版本（建议 16+）
   - 检查依赖是否完整安装：`pnpm install`
   - 查看编译错误信息

2. **找不到模块**
   - 检查 `tsconfig.json` 中的路径别名配置
   - 检查 `config/index.js` 中的 alias 配置

3. **样式不生效**
   - 确保 SCSS 文件路径正确
   - 检查 `@import` 路径

## 开发流程

1. **启动开发服务器**：
   ```bash
   pnpm dev:weapp
   ```

2. **在微信开发者工具中打开 `dist` 目录**

3. **修改代码**：
   - 修改 `src/` 目录下的文件
   - Taro 会自动重新编译
   - 微信开发者工具会自动刷新

4. **真机调试**：
   - 在微信开发者工具中点击"预览"
   - 用微信扫码即可在手机上查看

## 项目结构说明

- `src/` - 源代码目录（TypeScript/React）
- `dist/` - 编译输出目录（小程序代码）
- `config/` - Taro 配置文件
- `app.json` - 小程序配置文件（根目录，用于直接打开项目）

## 注意事项

⚠️ **重要：**
- 微信开发者工具应该打开 `dist` 目录，不是项目根目录
- 如果修改了 `src/app.config.ts`，需要重新编译
- 如果修改了 `config/index.js`，需要重新编译
- 开发时保持 `pnpm dev:weapp` 运行状态
