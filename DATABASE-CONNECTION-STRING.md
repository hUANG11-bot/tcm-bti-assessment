# 数据库连接字符串配置指南

## 📍 在哪里查看和配置

### 在微信云托管控制台

1. **进入服务设置**
   - 在微信云托管控制台
   - 点击"服务设置"标签
   - 找到"环境变量"部分

2. **查看或添加 `DATABASE_URL`**
   - 在环境变量列表中查找 `DATABASE_URL`
   - 如果不存在，点击"添加环境变量"
   - 变量名：`DATABASE_URL`
   - 变量值：数据库连接字符串

---

## 🔗 数据库连接字符串格式

### MySQL 连接字符串格式

```
mysql://用户名:密码@主机:端口/数据库名
```

### 示例

#### 本地 MySQL
```
mysql://root:password123@localhost:3306/tcm_bti_assessment
```

#### 云数据库（阿里云 RDS）
```
mysql://username:password@rm-xxxxx.mysql.rds.aliyuncs.com:3306/tcm_bti_assessment
```

#### 云数据库（腾讯云 CDB）
```
mysql://username:password@cdb-xxxxx.sql.tencentcdb.com:3306/tcm_bti_assessment
```

#### 云数据库（其他云服务商）
```
mysql://username:password@your-db-host.com:3306/tcm_bti_assessment
```

---

## 🗄️ 如何获取数据库连接信息

### 如果您已经有数据库

您需要以下信息：
1. **主机地址**（Host）
   - 本地：`localhost` 或 `127.0.0.1`
   - 云数据库：通常是类似 `rm-xxxxx.mysql.rds.aliyuncs.com` 的域名

2. **端口**（Port）
   - MySQL 默认端口：`3306`

3. **用户名**（Username）
   - 通常是 `root` 或您创建的用户名

4. **密码**（Password）
   - 数据库用户的密码

5. **数据库名**（Database）
   - 您创建的数据库名称，如 `tcm_bti_assessment`

**组合成连接字符串**：
```
mysql://用户名:密码@主机:3306/数据库名
```

---

### 如果还没有数据库

您需要先创建一个 MySQL 数据库。可以选择：

#### 选项1：使用微信云托管数据库（推荐）

1. **在微信云托管控制台**
2. **找到"数据库"或"云数据库"服务**
3. **创建数据库实例**
4. **获取连接信息**：
   - 主机地址
   - 端口（通常是 3306）
   - 用户名
   - 密码
   - 数据库名

5. **组合成连接字符串**

---

#### 选项2：使用其他云数据库服务

**阿里云 RDS**：
1. 登录阿里云控制台
2. 进入 RDS 管理
3. 创建 MySQL 实例
4. 获取连接地址、用户名、密码
5. 创建数据库

**腾讯云 CDB**：
1. 登录腾讯云控制台
2. 进入云数据库 MySQL
3. 创建实例
4. 获取连接信息

**其他服务商**：
- 华为云 RDS
- AWS RDS
- 其他 MySQL 云服务

---

#### 选项3：使用本地数据库（仅开发测试）

**本地 MySQL**：
```env
DATABASE_URL=mysql://root:your_password@localhost:3306/tcm_bti_assessment
```

**Docker MySQL**：
```bash
# 启动 MySQL 容器
docker run -d \
  --name mysql-tcm \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=tcm_bti_assessment \
  -p 3306:3306 \
  mysql:8.0
```

然后使用：
```env
DATABASE_URL=mysql://root:your_password@localhost:3306/tcm_bti_assessment
```

---

## 📝 在微信云托管中配置步骤

### 详细步骤

1. **进入微信云托管控制台**
   - 找到您的服务（如 `tci-001`）

2. **点击"服务设置"标签**

3. **找到"环境变量"部分**
   - 通常在页面中间或下方

4. **添加或编辑 `DATABASE_URL`**
   - 如果已存在，点击"编辑"
   - 如果不存在，点击"添加环境变量"

5. **填写信息**
   - **变量名**：`DATABASE_URL`
   - **变量值**：`mysql://用户名:密码@主机:端口/数据库名`
   - **示例**：`mysql://root:password123@rm-xxxxx.mysql.rds.aliyuncs.com:3306/tcm_bti_assessment`

6. **保存配置**

7. **重新部署服务**
   - 配置环境变量后，需要重新部署服务才能生效

---

## ⚠️ 注意事项

### 1. 密码中的特殊字符

如果密码包含特殊字符（如 `@`、`:`、`/` 等），需要进行 URL 编码：

- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `#` → `%23`
- `?` → `%3F`
- `&` → `%26`

**示例**：
```
密码：p@ssw:rd
编码后：p%40ssw%3Ard
连接字符串：mysql://root:p%40ssw%3Ard@localhost:3306/db
```

---

### 2. 数据库必须存在

在配置连接字符串前，确保：
- ✅ 数据库已经创建
- ✅ 用户有访问权限
- ✅ 防火墙允许连接（云数据库）

---

### 3. 网络连接

**云数据库**：
- 确保微信云托管服务可以访问数据库
- 可能需要配置白名单（允许微信云托管的 IP 访问）

**本地数据库**：
- 微信云托管无法直接访问本地数据库
- 需要使用云数据库或配置 VPN/内网穿透

---

## 🔍 验证连接字符串

配置后，可以通过以下方式验证：

1. **查看运行日志**
   - 在微信云托管控制台
   - 点击"运行日志"标签
   - 查看是否有数据库连接错误

2. **常见错误**：
   ```
   Error: connect ECONNREFUSED
   ```
   - 说明无法连接到数据库
   - 检查主机地址、端口、防火墙

   ```
   Error: Access denied
   ```
   - 说明用户名或密码错误
   - 检查用户名和密码

   ```
   Error: Unknown database
   ```
   - 说明数据库不存在
   - 需要先创建数据库

---

## 📋 完整配置示例

### 在微信云托管环境变量中配置

```
变量名：DATABASE_URL
变量值：mysql://root:MyPassword123@rm-abc123.mysql.rds.aliyuncs.com:3306/tcm_bti_assessment
```

---

## ✅ 检查清单

配置数据库连接字符串前，请确认：

- [ ] 数据库已创建
- [ ] 知道数据库主机地址
- [ ] 知道数据库端口（通常是 3306）
- [ ] 知道数据库用户名
- [ ] 知道数据库密码
- [ ] 知道数据库名称
- [ ] 密码中的特殊字符已正确编码
- [ ] 网络连接正常（云数据库需要配置白名单）
- [ ] 在微信云托管控制台的环境变量中已配置 `DATABASE_URL`
- [ ] 配置后已重新部署服务

---

## 🎯 现在请

1. **如果您已有数据库**：
   - 获取连接信息
   - 在微信云托管控制台的"服务设置"中配置 `DATABASE_URL`

2. **如果您还没有数据库**：
   - 先创建数据库（推荐使用云数据库）
   - 获取连接信息
   - 配置 `DATABASE_URL`

3. **配置完成后**：
   - 重新部署服务
   - 查看运行日志，确认连接成功

**完成后告诉我结果！**
