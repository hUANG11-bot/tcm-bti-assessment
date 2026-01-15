# TCM-BTI 微信小程序版本

这是TCM-BTI中医体质评估系统的微信小程序版本，使用Taro框架开发，完全照搬网页版的所有功能和页面。

## 项目结构

```
src/
├── app.tsx                 # 小程序入口文件
├── app.config.ts          # 小程序全局配置
├── app.scss               # 全局样式
├── pages/                 # 页面目录
│   ├── index/             # 首页
│   ├── user-info/         # 用户信息页
│   ├── assessment/        # 测评页
│   ├── result/            # 结果页
│   ├── history/           # 历史记录页
│   ├── invite/            # 邀请页
│   └── admin/             # 管理员页
├── components/            # 组件目录
├── contexts/             # Context目录
├── hooks/                # Hooks目录
├── lib/                  # 工具库目录
└── store/                # 状态管理目录
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev:weapp
```

### 构建生产版本

```bash
pnpm build:weapp
```

## 主要改动说明

1. **路由系统**：从wouter改为Taro的路由系统（app.config.ts配置）
2. **组件系统**：使用Taro组件（View, Text, Button等）替代HTML标签
3. **API调用**：tRPC客户端适配小程序环境，使用Taro.request替代fetch
4. **存储**：使用Taro.setStorageSync替代localStorage
5. **样式**：使用SCSS替代Tailwind CSS（部分样式需要手动转换）
6. **微信功能**：适配微信小程序的分享、授权等功能

## 注意事项

1. 小程序中不支持部分浏览器API，需要使用Taro提供的API
2. 样式需要使用rpx单位（响应式像素）
3. 图片资源需要放在项目目录中，不能使用外部链接
4. 需要配置微信小程序的appid和相关权限

## 功能对照

所有网页版功能均已实现：
- ✅ 首页展示
- ✅ 用户信息收集
- ✅ 体质测评流程
- ✅ 结果展示和报告
- ✅ 历史记录查询
- ✅ 邀请功能
- ✅ 管理员功能

## 待完善

- [ ] 完善UI组件库适配
- [ ] 优化样式系统
- [ ] 完善错误处理
- [ ] 添加加载状态
- [ ] 优化性能
