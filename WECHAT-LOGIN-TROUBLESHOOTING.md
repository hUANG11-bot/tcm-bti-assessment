# 微信登录错误排查指南

## 错误：INVALID_TOKEN, invalid credential, access_token is invalid or not latest

这个错误通常表示微信 API 调用失败，可能的原因和解决方法如下：

### 1. 检查 AppSecret 配置

**问题**：`WX_SECRET` 环境变量未配置或配置错误

**解决方法**：
1. 在项目根目录创建或编辑 `.env` 文件
2. 添加正确的微信小程序 AppSecret：

```env
WX_APPID=wx04a7af67c8f47620
WX_SECRET=你的微信小程序AppSecret
```

3. 重启后端服务器

**如何获取 AppSecret**：
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 在"AppSecret"部分，点击"生成"或"重置"
4. 复制生成的 AppSecret（注意：AppSecret 只显示一次，请妥善保管）

### 2. 检查 AppID 是否正确

**问题**：AppID 配置错误

**解决方法**：
- 确认 `.env` 文件中的 `WX_APPID` 与微信开发者工具中的 AppID 一致
- 确认 AppID 是**小程序**的 AppID，不是公众号或其他类型的 AppID

### 3. 检查 code 是否过期

**问题**：微信登录 code 只能使用一次，且有效期很短（约5分钟）

**解决方法**：
- 确保前端调用 `Taro.login()` 后立即将 code 发送到后端
- 不要重复使用同一个 code
- 如果 code 过期，需要重新调用 `Taro.login()` 获取新的 code

### 4. 检查网络连接

**问题**：后端服务器无法访问微信 API

**解决方法**：
- 确认后端服务器可以访问外网
- 检查防火墙设置
- 如果使用代理，确保代理配置正确

### 5. 检查微信小程序配置

**问题**：微信小程序后台配置不正确

**解决方法**：
1. 登录微信公众平台
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 检查以下配置：
   - **服务器域名**：确保后端 API 域名已添加到"request合法域名"
   - **AppID**：确认与代码中的 AppID 一致
   - **AppSecret**：确认已生成并正确配置

### 6. 开发环境特殊设置

**问题**：在开发环境中，微信开发者工具可能阻止某些请求

**解决方法**：
1. 在微信开发者工具中：
   - 点击右上角"详情"
   - 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
   - 注意：此设置仅用于开发，生产环境必须配置合法域名

### 7. 常见错误码对照表

| 错误码 | 错误信息 | 解决方法 |
|--------|---------|---------|
| 40013 | invalid appid | 检查 AppID 是否正确 |
| 40125 | invalid secret | 检查 AppSecret 是否正确 |
| 40029 | invalid code | code 已过期，重新获取 |
| 40163 | code been used | code 已被使用，重新获取 |
| 45011 | api minute-quota reach limit | API 调用频率超限，稍后重试 |

### 8. 调试步骤

1. **检查环境变量**：
   ```bash
   # 在服务器上检查环境变量
   echo $WX_APPID
   echo $WX_SECRET
   ```

2. **查看后端日志**：
   后端会输出详细的错误信息，包括：
   - AppID 和 AppSecret 是否正确配置
   - 微信 API 返回的具体错误码和错误信息

3. **测试微信 API**：
   可以在浏览器中直接访问（替换为实际的 code）：
   ```
   https://api.weixin.qq.com/sns/jscode2session?appid=你的AppID&secret=你的AppSecret&js_code=测试code&grant_type=authorization_code
   ```

### 9. 生产环境注意事项

1. **安全**：
   - 不要在前端代码中暴露 AppSecret
   - 使用环境变量存储敏感信息
   - 定期更换 AppSecret

2. **域名配置**：
   - 必须在微信公众平台配置合法域名
   - 域名必须使用 HTTPS
   - 域名必须通过 ICP 备案（国内服务器）

3. **错误处理**：
   - 实现友好的错误提示
   - 记录详细的错误日志
   - 设置错误监控和告警

### 10. 联系支持

如果以上方法都无法解决问题，请：
1. 检查微信公众平台是否有相关公告
2. 查看微信开发者文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
3. 联系微信技术支持
