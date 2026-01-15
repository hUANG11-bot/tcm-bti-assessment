# 快速启动指南

## ⚠️ 重要：必须先编译才能运行

Taro 项目需要先编译，将 TypeScript/React 代码转换为小程序代码（.wxml, .wxss, .js等）

## 步骤1：安装依赖

```bash
pnpm install
```

## 步骤2：编译项目

```bash
# 开发模式（推荐，会自动监听文件变化）
pnpm dev:weapp

# 或者生产模式（只编译一次）
pnpm build:weapp
```

编译成功后，会在项目根目录生成 `dist` 文件夹，里面包含所有小程序文件。

## 步骤3：在微信开发者工具中打开

1. 打开微信开发者工具
2. 选择"导入项目"或"新建项目"
3. **关键：项目目录选择 `dist` 目录**
   - 路径示例：`D:\tcm-bti-assessment\dist`
   - **不要选择项目根目录**
4. AppID 填写：`wx04a7af67c8f47620`
5. 项目名称：`TCM-BTI 中医体质评估`

## 步骤4：真机调试

1. 在微信开发者工具中点击"预览"
2. 用微信扫码即可在手机上查看

## 常见问题

### Q: 提示找不到 pages/index/index.wxml
**A:** 说明还没有编译，请先运行 `pnpm dev:weapp` 或 `pnpm build:weapp`

### Q: 编译失败
**A:** 
- 检查 Node.js 版本（建议 16+）
- 删除 `node_modules` 和 `pnpm-lock.yaml`，重新运行 `pnpm install`
- 检查是否有 TypeScript 错误

### Q: 修改代码后没有更新
**A:** 
- 确保 `pnpm dev:weapp` 正在运行（开发模式会自动重新编译）
- 在微信开发者工具中点击"编译"按钮

### Q: 样式不生效
**A:**
- 检查 SCSS 文件路径是否正确
- 确保样式文件已正确导入
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

4. **查看效果**：
   - 在微信开发者工具中查看
   - 或使用"预览"功能在手机上查看

## 项目结构

```
tcm-bti-assessment/
├── src/              # 源代码（TypeScript/React）
│   ├── pages/        # 页面
│   ├── components/   # 组件
│   └── ...
├── dist/             # 编译输出（小程序代码）⭐ 在微信开发者工具中打开这个目录
├── config/           # Taro 配置
└── app.json          # 小程序配置（根目录）
```

## 注意事项

⚠️ **重要提示：**
- 微信开发者工具必须打开 `dist` 目录，不是项目根目录
- 开发时保持 `pnpm dev:weapp` 运行状态
- 如果修改了配置文件（`config/index.js`, `src/app.config.ts`），需要重启编译
- 首次编译可能需要几分钟时间
