# 数据库配置指南

## 📋 快速配置

### 步骤 1：准备数据库

你需要一个 MySQL 数据库。可以使用：
- 本地 MySQL 服务器
- 云数据库（如阿里云、腾讯云等）
- Docker 容器

### 步骤 2：创建数据库

在 MySQL 中创建一个数据库：

```sql
CREATE DATABASE tcm_bti_assessment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 步骤 3：配置连接字符串

在项目根目录创建 `.env` 文件：

```env
# 数据库连接字符串
# 格式: mysql://用户名:密码@主机:端口/数据库名
DATABASE_URL=mysql://root:your_password@localhost:3306/tcm_bti_assessment

# 其他配置（可选）
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

**连接字符串格式说明：**
- `mysql://` - 协议
- `root` - 数据库用户名
- `your_password` - 数据库密码
- `localhost` - 数据库主机（本地使用 localhost，远程使用 IP 或域名）
- `3306` - MySQL 端口（默认 3306）
- `tcm_bti_assessment` - 数据库名称

### 步骤 4：运行数据库迁移

```bash
# 创建数据库表结构
pnpm db:push
```

这会根据 `drizzle/schema.ts` 创建所有必要的表，包括：
- `users` - 用户表
- `assessments` - 测评记录表
- `invitations` - 邀请记录表
- `admin_users` - 管理员账户表

### 步骤 5：创建管理员账户

```bash
pnpm create-admin admin admin123456
```

## 🔧 常见数据库配置示例

### 本地 MySQL

```env
DATABASE_URL=mysql://root:password123@localhost:3306/tcm_bti_assessment
```

### Docker MySQL

```bash
# 启动 MySQL 容器
docker run -d \
  --name mysql-tcm \
  -e MYSQL_ROOT_PASSWORD=password123 \
  -e MYSQL_DATABASE=tcm_bti_assessment \
  -p 3306:3306 \
  mysql:8.0
```

然后配置：
```env
DATABASE_URL=mysql://root:password123@localhost:3306/tcm_bti_assessment
```

### 云数据库（以阿里云为例）

```env
DATABASE_URL=mysql://username:password@rm-xxxxx.mysql.rds.aliyuncs.com:3306/tcm_bti_assessment
```

## ⚠️ 注意事项

1. **密码安全**
   - 不要在代码仓库中提交 `.env` 文件
   - 使用强密码
   - 生产环境使用环境变量而不是文件

2. **字符集**
   - 确保数据库使用 `utf8mb4` 字符集
   - 支持中文和 emoji

3. **权限**
   - 数据库用户需要有创建表、插入、更新、删除的权限

## 🐛 常见问题

### Q1: 提示 "DATABASE_URL is required"

**解决**：创建 `.env` 文件并配置 `DATABASE_URL`

### Q2: 提示 "无法连接到数据库"

**检查清单**：
- [ ] 数据库服务是否正在运行
- [ ] DATABASE_URL 格式是否正确
- [ ] 用户名和密码是否正确
- [ ] 数据库是否存在
- [ ] 防火墙是否允许连接
- [ ] 端口是否正确（默认 3306）

### Q3: 提示 "Table doesn't exist"

**解决**：运行数据库迁移
```bash
pnpm db:push
```

### Q4: 提示 "Access denied"

**解决**：
1. 检查用户名和密码
2. 检查用户是否有访问该数据库的权限
3. 检查用户是否有创建表的权限

## 📚 相关文件

- 数据库配置：`drizzle.config.ts`
- 数据表定义：`drizzle/schema.ts`
- 数据库操作：`server/db.ts`
- 环境变量：`.env`（需要创建）
