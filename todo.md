# TCM-BTI 中医体质评估系统 - 功能开发清单

## 已完成功能
- [x] 基础前端页面（首页、用户信息采集、测评、结果展示）
- [x] 用户信息采集（年龄、性别、生活习惯）
- [x] 28道核心题+8道决胜题逻辑
- [x] 五级梯度评分算法
- [x] 四维体质评估（阴阳、虚实、燥湿、滞敏）
- [x] 雷达图可视化
- [x] 个性化调理建议（饮食、运动、作息、情绪）
- [x] 生活习惯风险分析
- [x] PDF报告下载功能
- [x] 升级为全栈架构（tRPC + 数据库）

## 待开发功能
- [ ] 数据库表结构设计（assessments表）
- [ ] tRPC API接口开发（保存/查询测评记录）
- [ ] 前端对接后端API（提交测评结果到数据库）
- [ ] 管理员后台面板开发
- [ ] 数据统计与可视化（用户数、测评次数、体质分布）
- [ ] 导出功能（CSV/Excel格式）
- [ ] 部署准备与测试


## 最新进展
- [x] 数据库表结构设计（assessments表）
- [x] tRPC API接口开发（保存/查询测评记录）
- [x] 前端对接后端API（提交测评结果到数据库）
- [x] 管理员后台面板开发
- [x] 数据统计与可视化（用户数、测评次数、体质分布）
- [x] 导出功能（CSV格式）
- [x] 单元测试编写与验证（所有测试通过）


## 移动端H5改造与微信社交分享
- [x] 移动端响应式布局优化（首页、测评页、结果页）
- [x] 微信内嵌浏览器适配（视口设置、字体大小）
- [x] 社交分享海报生成功能（Canvas绘制体质卡片）
- [x] 集成微信JS-SDK（分享到朋友圈、分享给好友）
- [x] 自定义分享内容（标题、描述、封面图）
- [x] 邀请裂变机制（邀请码、邀请记录、奖励解锁）
- [x] 移动端交互优化（触摸反馈、滑动体验）


## 紧急修复与Stripe支付集成
- [ ] 修复PDF生成错误（html2canvas不支持oklch颜色）
- [ ] 集成Stripe支付SDK
- [ ] 创建产品/订阅管理页面
- [ ] 实现支付流程（创建订单、跳转支付、回调处理）
- [ ] 测试支付功能


## 紧急修复
- [x] 修复PDF生成错误（html2canvas不支持oklch颜色格式，已转换为rgb/rgba）


## 管理后台权限控制
- [x] 创建权限保护组件(AdminRoute)
- [x] 在Admin页面添加角色验证
- [x] 非管理员访问时重定向到首页并提示
- [x] 测试权限验证功能


## 管理员密码登录功能
- [x] 创建管理员账户表（admin_users）
- [x] 实现密码加密存储（bcrypt）
- [x] 开发管理员登录API接口（/api/trpc/admin.login、checkAuth、logout、initialize）
- [x] 创建管理员登录页面（/admin/login）
- [x] 实现Cookie Session管理
- [x] 修改AdminRoute组件使用Cookie验证
- [x] 添加退出登录功能
- [x] 编写单元测试并验证（7个测试全部通过）


## 体质评估算法升级（增强技术壁垒）
- [x] 评估当前算法的优缺点
- [x] 设计多层次评分体系（基础分40% + 交互分30% + 时序分20% + 个性化修正10%）
- [x] 实现题目间的交叉验证机制（矛盾题对5组）
- [x] 添加答题一致性检测（极端作答模式、矛盾分析）
- [x] 引入年龄、性别、习惯的权重调节系数
- [x] 实现动态阈值算法（年龄系数×性别系数×习惯系数）
- [x] 创建题目交互权重矩阵（algorithmConfig.ts）
- [x] 实现复合体质精准识别（主次体质+占比）
- [x] 优化决胜题触发逻辑（动态阈值）
- [x] 编写算法单元测试（9个测试全部通过）
- [x] 验证新算法功能（矛盾检测、极端作答、动态阈值、复合体质）
- [ ] 将权重矩阵移至后端加密存储（可选）


## 管理员登录页面修复
- [x] 诊断登录页面无法加载的原因（Result.tsx的JSX错误）
- [x] 修复Result.tsx的div标签嵌套错误
- [x] 移除Admin页面对OAuth的依赖，改为Cookie认证
- [x] 修改Cookie设置（sameSite: 'none', secure: true）
- [x] 简化AdminRoute组件，移除对tRPC query的依赖
- [x] 重写AdminLogin组件使用原生fetch API
- [ ] **已知问题**：tRPC fetch请求在浏览器中一直pending，需要进一步调试或改用REST API
- [ ] 后续优化：改用REST API重写登录功能，或深入调试tRPC配置

## 临时解决方案
- 管理员账户：username: admin, password: Admin@2025
- 可通过Manus的Database面板直接查看和管理测评数据
- 后端登录API已实现并通过单元测试，仅前端调用存在问题


## 使用REST API重写管理员登录
- [x] 创建Express REST API路由（/api/admin/login, /api/admin/check, /api/admin/logout）
- [x] 安装cookie-parser依赖并配置Express中间件
- [x] 更新前端AdminLogin组件使用REST API
- [x] 更新AdminRoute组件使用REST API验证
- [x] 测试登录功能（成功登录并访问管理后台）
- [x] 保存检查点（version: c68b8cca）


## 修复测评完成后自动跳转问题
- [x] 定位跳转到manus.com的代码位置（Result页面使用了useAuth钩子）
- [x] 移除Result页面中不必要的useAuth调用
- [x] 修复SharePoster组件的userName参数
- [x] 测试完整的测评流程（成功完成，无跳转问题）
- [ ] 保存检查点


## 历史测评记录功能
- [x] 设计用户识别机制（使用手机号）
- [x] 修改数据库schema，添加phone字段
- [x] 更新UserInfo页面，添加手机号输入框
- [x] 创建历史记录列表页面（/history）
- [x] 实现体质变化趋势图表（recharts折线图）
- [x] 创建REST API查询历史记录（/api/assessments/history）
- [x] 在App.tsx中添加/history路由
- [x] 在Result页面添加“查看历史记录”按钮
- [ ] 测试完整流程
- [ ] 保存检查点
