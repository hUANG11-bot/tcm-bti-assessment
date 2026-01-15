# 如何找到项目文件夹

## 当前问题

您现在在 `D:\Program Files\Listary>`，这不是项目目录。

项目应该在 `d:\tcm-bti-assessment`，但可能实际位置不同。

## 方法1：使用文件资源管理器查找（最简单）

### 步骤1：打开文件资源管理器

1. 按 `Win + E` 打开文件资源管理器
2. 或者双击桌面上的"此电脑"图标

### 步骤2：搜索项目文件夹

1. 在文件资源管理器的**搜索框**（右上角）中输入：`tcm-bti-assessment`
2. 等待搜索结果
3. 找到 `tcm-bti-assessment` 文件夹
4. **记住它的完整路径**（在地址栏可以看到）

### 步骤3：在文件夹中打开 CMD

1. 双击进入 `tcm-bti-assessment` 文件夹
2. 在文件夹的**地址栏**（顶部显示路径的地方）输入：`cmd`
3. 按回车
4. CMD 会在当前文件夹打开，**自动就在正确的目录了**！

---

## 方法2：手动查找

### 步骤1：检查常见位置

项目可能在以下位置之一：

- `D:\tcm-bti-assessment`
- `C:\Users\Administrator\Desktop\tcm-bti-assessment`
- `C:\Users\Administrator\Documents\tcm-bti-assessment`
- `D:\` 盘根目录

### 步骤2：在 CMD 中查找

在 CMD 中输入：

```cmd
dir d:\tcm-bti-assessment
```

如果能看到文件夹，说明存在。

或者：

```cmd
dir /s /b d:\ | findstr tcm-bti-assessment
```

这会搜索整个 D 盘，找到包含 `tcm-bti-assessment` 的路径。

---

## 方法3：使用文件资源管理器直接打开 CMD

### 步骤1：找到项目文件夹

1. 打开文件资源管理器
2. 浏览到项目文件夹 `tcm-bti-assessment`
3. 双击进入

### 步骤2：在地址栏打开 CMD

1. 点击地址栏（显示路径的地方）
2. 输入：`cmd`
3. 按回车
4. CMD 会在当前文件夹打开！

---

## 推荐操作流程

### 最简单的方法：

1. **打开文件资源管理器**（`Win + E`）
2. **在搜索框输入**：`tcm-bti-assessment`
3. **找到文件夹后，双击进入**
4. **在地址栏输入**：`cmd`，按回车
5. **CMD 自动在正确目录打开**
6. **直接运行**：`pnpm install`

---

## 如果找不到项目文件夹

项目可能在其他位置，或者名称不同。请：

1. 打开文件资源管理器
2. 查看您通常存放项目的位置
3. 或者告诉我项目文件夹的实际位置，我帮您切换过去

---

## 找到后的操作

一旦在正确的目录中打开 CMD（提示符显示 `D:\tcm-bti-assessment>` 或类似），运行：

```cmd
pnpm install
```

然后：

```cmd
pnpm dev:weapp
```
