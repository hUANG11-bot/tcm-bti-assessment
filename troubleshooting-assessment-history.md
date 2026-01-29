# 修复说明：测评历史不显示

## 已完成的修复

1. ✅ **将"AI医生"改名为"问问AI"**
   - 已修改 `dist/pages/profile/index.js`
   - 已提交到 Git

2. ✅ **修复AI界面显示不全问题**
   - 已修改 `dist/pages/ai-chat/index.wxss`
   - 添加了 `overflow: hidden` 和 `flex-shrink: 0` 确保布局正确
   - 聊天消息区域添加了 `overflow-y: auto` 支持滚动
   - 已提交到 Git

## 测评历史不显示的问题

### 可能的原因

1. **数据库中确实没有记录**
   - 用户可能还没有成功保存过测评记录
   - 或者保存时出现了错误

2. **用户ID不匹配**
   - 测评记录保存时的 `userId` 与查询时的用户ID不一致
   - 可能是登录状态变化导致的

3. **前端代码需要重新编译**
   - 修改了后端代码后，前端可能需要重新编译才能生效

### 诊断步骤

1. **检查控制台日志**
   - 查看是否有 `[assessment.create]` 相关的日志
   - 查看是否有 `[myAssessments]` 相关的日志
   - 查看是否有错误信息

2. **检查网络请求**
   - 在开发者工具的 Network 标签中
   - 找到 `assessment.myAssessments` 的请求
   - 查看响应数据

3. **测试保存功能**
   - 完成一次新的测评
   - 点击"保存结果"按钮
   - 查看控制台是否有成功日志

### 解决方案

#### 方案1：重新编译前端代码

```bash
npm run build:weapp
```

然后重新上传到微信开发者工具。

#### 方案2：检查数据库

如果怀疑数据库中没有记录，可以：

1. 连接到数据库
2. 查询该用户的测评记录：
   ```sql
   SELECT * FROM assessments WHERE userId = [您的用户ID];
   ```

#### 方案3：检查服务器日志

在微信云托管控制台查看服务器日志，查找：
- `[assessment.create]` - 创建测评记录的日志
- `[myAssessments]` - 查询测评历史的日志
- `[getUserAssessments]` - 数据库查询日志

## AI 页「测评历史」未调用（getLatest）

若「我的」页有测评记录，但 **AI 助手页** 拿不到最近一次测评（仍显示通用助手）：

1. **getLatest 必须被请求**：AI 页已改为始终调用 `assessment.getLatest.useQuery(undefined, { enabled: 有 openId })`，不能把 useQuery 写在 `if(hasUser)` 里，否则会违反 Hooks 规则导致请求不触发。详见 `troubleshooting-ai-last-assessment.md`。
2. **登录后必须存 session**：后端 `getLatest` 需要登录态。登录接口返回的 **sessionToken** 必须写入 **`wx.setStorageSync('app_session_cookie', sessionToken)`**，否则请求会 401，表现为「没有调用到测评历史」。

## 下一步

1. **重新编译前端代码**（如果还没有）
2. **完成一次新的测评并保存**
3. **检查"我的"页面是否显示测评历史**
4. **如果仍然不显示，请提供服务器日志**
