# 修正 DATABASE_URL 格式

## ⚠️ 发现的问题

您输入的 `DATABASE_URL` 中，密码部分有问题：

**当前输入**：
```
mysql://root:Huangte991,, @sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
```

**问题**：
- 密码后面有 `,, `（两个逗号和一个空格）
- 这会导致连接失败

---

## ✅ 正确的格式

### 如果密码是 `Huangte991`（不包含逗号）

**正确的格式**：
```
mysql://root:Huangte991@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
```

**修改**：删除密码后面的 `,, `（两个逗号和一个空格）

---

### 如果密码真的包含逗号

如果您的密码真的包含逗号（如：`Huangte991,,`），需要进行 URL 编码：

**URL 编码规则**：
- `,` → `%2C`
- 空格 → `%20`

**如果密码是 `Huangte991,,`**：
```
mysql://root:Huangte991%2C%2C@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
```

---

## 🔧 修正步骤

### 步骤1：确认实际密码

**请确认**：
- 您的实际密码是什么？
- 是 `Huangte991`（不包含逗号）？
- 还是 `Huangte991,,`（包含逗号）？

---

### 步骤2：修正连接字符串

#### 情况1：密码是 `Huangte991`（不包含逗号）

**删除密码后面的 `,, `**，使用：
```
mysql://root:Huangte991@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
```

---

#### 情况2：密码包含逗号

**如果密码真的包含逗号**，需要进行 URL 编码：
```
mysql://root:Huangte991%2C%2C@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
```

---

## 📋 格式检查清单

正确的 `DATABASE_URL` 应该：

- ✅ 协议：`mysql://`
- ✅ 用户名：`root`
- ✅ 密码：`Huangte991`（没有额外的逗号或空格）
- ✅ 分隔符：`@`（紧跟在密码后面，没有空格）
- ✅ 主机地址：`sh-cdb-pvaed2ys.sql.tencentcdb.com`
- ✅ 端口：`23371`
- ✅ 数据库名：`tcm_bti_assessment`

---

## 🎯 现在请

1. **确认您的实际密码**：
   - 是 `Huangte991`（不包含逗号）？
   - 还是包含逗号？

2. **修正连接字符串**：
   - 如果密码是 `Huangte991`，删除 `,, `，使用：
     ```
     mysql://root:Huangte991@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
     ```
   - 如果密码包含逗号，进行 URL 编码

3. **在环境变量中更新**：
   - 删除密码后面的 `,, `（两个逗号和一个空格）
   - 确保密码和 `@` 之间没有空格

4. **保存配置**

---

## ✅ 正确的完整格式

**推荐格式**（假设密码是 `Huangte991`）：
```
mysql://root:Huangte991@sh-cdb-pvaed2ys.sql.tencentcdb.com:23371/tcm_bti_assessment
```

**关键点**：
- 密码：`Huangte991`（没有逗号，没有空格）
- 密码后面直接是 `@`，没有空格
- 格式：`密码@主机地址`

---

## 💡 提示

1. **密码和 @ 之间不能有空格或逗号**（除非密码本身包含这些字符）
2. **如果密码包含特殊字符**，需要进行 URL 编码
3. **保存前检查格式**，确保没有多余的空格或字符

**请修正密码部分，删除 `,, `，然后保存配置！**
