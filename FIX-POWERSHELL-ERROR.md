# 修复 PowerShell 执行策略错误

## 错误原因

Windows PowerShell 默认禁止运行脚本，这是安全设置。

## 解决方案

### 方法1：使用 CMD（最简单，推荐）

1. **关闭当前的 PowerShell 窗口**

2. **打开 CMD（命令提示符）**：
   - 按 `Win + R`
   - 输入 `cmd`
   - 按回车

3. **切换到项目目录**：
   ```cmd
   cd d:\tcm-bti-assessment
   ```

4. **运行命令**：
   ```cmd
   pnpm install
   ```

CMD 不受执行策略限制，可以直接运行。

---

### 方法2：修改 PowerShell 执行策略（需要管理员权限）

1. **以管理员身份打开 PowerShell**：
   - 按 `Win + X`
   - 选择"Windows PowerShell (管理员)"或"终端 (管理员)"

2. **修改执行策略**：
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **确认**：输入 `Y` 并按回车

4. **关闭管理员 PowerShell**

5. **重新打开普通 PowerShell**，在项目目录中运行：
   ```powershell
   cd d:\tcm-bti-assessment
   pnpm install
   ```

---

### 方法3：临时绕过执行策略（不推荐）

在 PowerShell 中运行：

```powershell
powershell -ExecutionPolicy Bypass -Command "pnpm install"
```

---

### 方法4：使用 npm 代替 pnpm

如果 pnpm 有问题，可以使用 npm：

```cmd
npm install
```

然后编译：

```cmd
npm run dev:weapp
```

---

## 推荐操作步骤（使用 CMD）

### 步骤1：打开 CMD

1. 按 `Win + R`
2. 输入 `cmd`
3. 按回车

### 步骤2：切换到项目目录

```cmd
cd d:\tcm-bti-assessment
```

### 步骤3：安装依赖

```cmd
pnpm install
```

### 步骤4：编译项目

```cmd
pnpm dev:weapp
```

---

## 如何确认使用 CMD？

CMD 窗口的标题栏显示"命令提示符"，提示符是：

```
d:\tcm-bti-assessment>
```

（没有 `PS` 前缀）

PowerShell 的提示符是：

```
PS d:\tcm-bti-assessment>
```

（有 `PS` 前缀）

---

## 如果 CMD 中也找不到 pnpm

使用 npm 安装 pnpm：

```cmd
npm install -g pnpm
```

然后再运行：

```cmd
pnpm install
```
