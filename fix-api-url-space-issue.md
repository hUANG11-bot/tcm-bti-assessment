# 修复 API URL 空格问题

## 问题描述

错误信息显示：
```
GET https://er1.store%20/api/trpc/auth.me
net::ERR_NAME_NOT_RESOLVED
```

其中 `%20` 是空格的URL编码，说明API基础URL配置中末尾有一个空格。

## 原因

API基础URL配置为 `https://er1.store `（末尾有空格），导致所有API请求都失败。

## 解决方案

### 方法1：使用修复脚本（推荐，最简单）

运行以下命令自动修复：

```bash
npm run fix:api-url
```

这个脚本会自动扫描 `dist` 目录中的所有 `.js` 文件，去除 API URL 中的空格。

### 方法2：检查微信开发者工具的项目配置

1. **打开微信开发者工具**
2. **点击右上角的"详情"按钮**
3. **选择"本地设置"标签**
4. **查找"API地址"或"服务器地址"配置**
5. **确保URL末尾没有空格**：
   - ❌ 错误：`https://er1.store `（末尾有空格）
   - ✅ 正确：`https://er1.store`（无空格）

**重要**：如果在这里修改了配置，需要：
- 清除缓存（工具 → 清除缓存）
- 重新编译项目

### 方法2：检查项目配置文件

检查以下文件中的API URL配置：

1. **`dist/project.config.json`**
   ```json
   {
     "setting": {
       "urlCheck": false
     },
     "appid": "...",
     "projectname": "..."
   }
   ```

2. **环境变量文件**（如果有）
   - `.env`
   - `.env.local`
   - `.env.production`

   确保 `TARO_APP_API_URL` 或类似的环境变量值末尾没有空格：
   ```
   TARO_APP_API_URL=https://er1.store
   ```
   而不是：
   ```
   TARO_APP_API_URL=https://er1.store 
   ```

### 方法3：在代码中自动trim（如果可能）

如果前端代码中有读取API URL的地方，确保使用 `.trim()` 去除空格：

```javascript
const apiBaseUrl = (process.env.TARO_APP_API_URL || 'https://er1.store').trim();
```

## 验证

修复后，重新编译并运行：

```bash
npm run build:weapp
```

然后在微信开发者工具中：
1. 清除缓存
2. 重新编译
3. 测试登录功能

应该不再出现 `ERR_NAME_NOT_RESOLVED` 错误。

## 注意事项

- URL末尾的空格很难发现，但会导致所有API请求失败
- 修复后需要重新编译前端代码
- 如果问题仍然存在，检查是否有多个地方配置了API URL
