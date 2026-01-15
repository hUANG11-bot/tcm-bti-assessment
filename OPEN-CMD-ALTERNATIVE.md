# 如何打开 CMD（如果右键菜单只有 PowerShell）

## 方法1：使用 Win+R 打开 CMD（最简单）

1. **按 `Win + R` 键**（Win 键是键盘左下角有 Windows 图标的键）

2. **输入 `cmd`**

3. **按回车**

4. **切换到项目目录**：
   ```cmd
   cd d:\tcm-bti-assessment
   ```

5. **运行命令**：
   ```cmd
   pnpm install
   ```

---

## 方法2：修改 PowerShell 执行策略（推荐）

既然只有 PowerShell，我们就修改执行策略让它能运行脚本：

### 步骤1：以管理员身份打开 PowerShell

1. 按 `Win + X` 键
2. 选择"**Windows PowerShell (管理员)**"或"**终端 (管理员)**"
3. 如果提示"用户账户控制"，点击"是"

### 步骤2：修改执行策略

在管理员 PowerShell 中输入：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 步骤3：确认

- 会提示是否要更改执行策略
- 输入 `Y` 并按回车

### 步骤4：关闭管理员 PowerShell

### 步骤5：在项目目录的普通 PowerShell 中运行

现在在项目文件夹中，Shift + 右键 → 选择 PowerShell，然后运行：

```powershell
pnpm install
```

应该可以正常工作了！

---

## 方法3：在 PowerShell 中临时绕过（一次性）

在当前的 PowerShell 中，输入：

```powershell
powershell -ExecutionPolicy Bypass -Command "pnpm install"
```

这会临时绕过执行策略，只对这一次命令有效。

---

## 方法4：使用 npm 代替 pnpm

如果 pnpm 一直有问题，可以直接使用 npm：

```powershell
npm install
```

然后编译：

```powershell
npm run dev:weapp
```

---

## 推荐操作流程

### 最简单的方法（使用 CMD）：

1. **按 `Win + R`**
2. **输入 `cmd`，按回车**
3. **输入**：
   ```cmd
   cd d:\tcm-bti-assessment
   ```
4. **输入**：
   ```cmd
   pnpm install
   ```

### 如果想继续用 PowerShell：

1. **按 `Win + X`**
2. **选择"Windows PowerShell (管理员)"**
3. **输入**：
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
4. **输入 `Y` 确认**
5. **关闭管理员窗口**
6. **在项目文件夹的 PowerShell 中运行**：
   ```powershell
   pnpm install
   ```

---

## 如何确认是 CMD？

CMD 窗口：
- 标题栏显示"**命令提示符**"
- 提示符是：`d:\tcm-bti-assessment>`（没有 PS）

PowerShell 窗口：
- 标题栏显示"**Windows PowerShell**"
- 提示符是：`PS d:\tcm-bti-assessment>`（有 PS）
