# 如何切换到项目目录 - 详细步骤

## 方法1：使用文件资源管理器（最简单）

### 步骤1：打开项目文件夹

1. 打开"文件资源管理器"（按 `Win + E`）
2. 在地址栏输入：`d:\tcm-bti-assessment`
3. 按回车，进入项目文件夹

### 步骤2：在当前文件夹打开命令行

1. 在项目文件夹的空白处，**按住 Shift 键，然后右键点击**
2. 选择"在此处打开 PowerShell 窗口"或"在此处打开命令窗口"
3. 命令行会自动在项目目录中打开

### 步骤3：验证目录

命令行提示符应该显示：
```
d:\tcm-bti-assessment>
```

### 步骤4：运行命令

```cmd
pnpm install
```

然后：

```cmd
pnpm dev:weapp
```

---

## 方法2：使用命令行切换目录

### 步骤1：打开命令行

1. 按 `Win + R` 键
2. 输入 `cmd` 或 `powershell`
3. 按回车

### 步骤2：切换目录

在命令行中输入：

```cmd
cd d:\tcm-bti-assessment
```

按回车执行。

### 步骤3：验证目录

输入：

```cmd
dir
```

应该能看到 `package.json`、`src`、`config` 等文件夹。

### 步骤4：运行命令

```cmd
pnpm install
```

然后：

```cmd
pnpm dev:weapp
```

---

## 方法3：直接输入完整路径

如果 `cd` 命令不工作，可以尝试：

```cmd
cd /d d:\tcm-bti-assessment
```

或者：

```cmd
d:
cd tcm-bti-assessment
```

---

## 如何确认在正确的目录？

运行以下命令检查：

```cmd
dir package.json
```

如果能看到 `package.json` 文件，说明目录正确！

或者：

```cmd
cd
```

会显示当前目录路径，应该是：`d:\tcm-bti-assessment`

---

## 完整操作示例

### 示例1：使用文件资源管理器

```
1. 打开文件资源管理器
2. 地址栏输入：d:\tcm-bti-assessment
3. Shift + 右键 → "在此处打开 PowerShell"
4. 命令行自动在项目目录打开
5. 输入：pnpm install
6. 输入：pnpm dev:weapp
```

### 示例2：使用命令行

```
1. Win + R → 输入 cmd → 回车
2. 输入：cd d:\tcm-bti-assessment
3. 输入：dir（确认看到 package.json）
4. 输入：pnpm install
5. 输入：pnpm dev:weapp
```

---

## 常见问题

### Q: 提示"系统找不到指定的路径"

**A:** 检查项目路径是否正确：
- 项目应该在：`d:\tcm-bti-assessment`
- 如果项目在其他位置，使用实际路径

### Q: 如何查看项目在哪里？

**A:** 
1. 打开文件资源管理器
2. 找到项目文件夹
3. 在地址栏可以看到完整路径
4. 复制这个路径，在命令行中使用

### Q: 命令行提示符显示什么？

**A:** 
- 正确：`d:\tcm-bti-assessment>`
- 错误：`C:\Users\Administrator>`（这是用户目录，不是项目目录）

---

## 推荐方法

**最简单的方法**：
1. 打开文件资源管理器
2. 进入 `d:\tcm-bti-assessment` 文件夹
3. 在文件夹空白处：**Shift + 右键**
4. 选择"在此处打开 PowerShell 窗口"
5. 命令行会自动在正确的位置打开！
