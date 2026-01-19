# 数据库迁移：添加 birthDate 和 gender 字段

## 问题描述

微信登录失败，错误信息显示：
```
Failed query: insert into `users` (...) on duplicate key update ...
```

这是因为数据库表 `users` 中缺少 `birthDate` 和 `gender` 字段，但代码尝试插入这些字段。

## 解决方案

### 方法 1：使用 Drizzle Kit 自动迁移（推荐）

在项目根目录运行：

```bash
npm run db:push
```

这个命令会：
1. 根据 `drizzle/schema.ts` 生成迁移文件
2. 自动执行迁移，将数据库表结构同步到最新状态

### 方法 2：手动执行 SQL（如果方法 1 失败）

连接到数据库，执行以下 SQL：

```sql
-- 添加 birthDate 字段
ALTER TABLE `users` 
ADD COLUMN `birthDate` VARCHAR(20) NULL 
AFTER `loginMethod`;

-- 添加 gender 字段
ALTER TABLE `users` 
ADD COLUMN `gender` VARCHAR(10) NULL 
AFTER `birthDate`;
```

### 方法 3：在微信云托管中执行

1. 登录微信云托管控制台
2. 找到数据库管理页面
3. 执行上述 SQL 语句

## 验证

迁移完成后，可以运行以下 SQL 验证字段是否已添加：

```sql
DESCRIBE `users`;
```

应该能看到 `birthDate` 和 `gender` 字段。

## 注意事项

- 这些字段都是可选的（允许 NULL）
- 不会影响现有数据
- 添加字段后，需要重启后端服务
