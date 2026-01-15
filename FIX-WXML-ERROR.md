# 修复 "未找到 pages/index/index.wxml" 错误

## 错误原因

这个错误说明：
1. ❌ 项目还没有编译，或者
2. ❌ 微信开发者工具打开了错误的目录

## ✅ 正确的操作步骤

### 步骤1：确保在项目目录中

打开命令行（CMD 或 PowerShell），执行：

```cmd
cd d:\tcm-bti-assessment
```

### 步骤2：安装依赖（如果还没安装）

```cmd
pnpm install
```

等待安装完成（可能需要几分钟）。

### 步骤3：编译项目

```cmd
pnpm dev:weapp
```

**重要**：这个命令会：
- 将 `src/` 目录的代码编译成小程序代码
- 在 `dist/` 目录生成 `.wxml`, `.wxss`, `.js` 等文件
- 保持运行状态，监听文件变化自动重新编译

**等待编译完成**，看到类似这样的输出：
```
✔ 编译成功
```

### 步骤4：在微信开发者工具中打开正确的目录

**关键**：必须打开 `dist` 目录，不是项目根目录！

1. 打开微信开发者工具
2. 点击"导入项目"或"新建项目"
3. **项目目录选择**：`d:\tcm-bti-assessment\dist`
   - ⚠️ 注意：是 `dist` 目录，不是项目根目录
4. AppID：`wx04a7af67c8f47620`
5. 项目名称：`TCM-BTI 中医体质评估`

### 步骤5：验证

打开 `dist` 目录后，应该能看到：
- `app.json`
- `app.js`
- `app.wxss`
- `pages/` 文件夹
  - `index/` 文件夹
    - `index.wxml` ✅
    - `index.js`
    - `index.wxss`
    - `index.json`

## 常见问题

### Q: 编译失败怎么办？

**A:** 检查：
1. 是否在项目目录中运行命令
2. 依赖是否完整安装（运行 `pnpm install`）
3. 查看编译错误信息，根据错误提示修复

### Q: 编译成功但还是找不到文件？

**A:** 
1. 确认微信开发者工具打开的是 `dist` 目录
2. 检查 `dist` 目录中是否有 `pages/index/index.wxml` 文件
3. 如果没有，说明编译没有成功，检查编译输出

### Q: 修改代码后没有更新？

**A:**
1. 确保 `pnpm dev:weapp` 正在运行
2. 修改 `src/` 目录下的文件
3. Taro 会自动重新编译
4. 在微信开发者工具中点击"编译"按钮刷新

## 完整流程总结

```
1. cd d:\tcm-bti-assessment          # 进入项目目录
2. pnpm install                       # 安装依赖
3. pnpm dev:weapp                     # 编译项目（保持运行）
4. 在微信开发者工具中打开 dist 目录  # 关键步骤！
```

## 检查清单

- [ ] 在项目目录 `d:\tcm-bti-assessment` 中
- [ ] 已运行 `pnpm install` 安装依赖
- [ ] 已运行 `pnpm dev:weapp` 编译项目
- [ ] 编译成功（看到 "✔ 编译成功"）
- [ ] 微信开发者工具打开的是 `dist` 目录
- [ ] `dist/pages/index/index.wxml` 文件存在

## 如果还是不行

1. **检查 dist 目录是否存在**：
   ```cmd
   dir d:\tcm-bti-assessment\dist
   ```

2. **检查 pages 目录**：
   ```cmd
   dir d:\tcm-bti-assessment\dist\pages\index
   ```

3. **如果 dist 目录不存在或为空**：
   - 确保 `pnpm dev:weapp` 正在运行
   - 等待编译完成
   - 查看编译输出是否有错误

4. **重新编译**：
   ```cmd
   # 停止当前的编译（Ctrl+C）
   # 删除 dist 目录
   rmdir /s /q dist
   # 重新编译
   pnpm dev:weapp
   ```
