# 如何切换到 D 盘的项目目录

## 问题

在 CMD 中，如果当前在 C 盘，直接 `cd d:\tcm-bti-assessment` 可能不会切换成功。

## 正确的步骤

### 方法1：分两步切换（推荐）

1. **先切换到 D 盘**：
   ```cmd
   d:
   ```
   按回车

2. **再进入项目文件夹**：
   ```cmd
   cd tcm-bti-assessment
   ```
   按回车

3. **验证目录**：
   ```cmd
   dir package.json
   ```
   应该能看到 `package.json` 文件

4. **安装依赖**：
   ```cmd
   pnpm install
   ```

### 方法2：使用 /d 参数

```cmd
cd /d d:\tcm-bti-assessment
```

这个命令会同时切换盘符和目录。

---

## 完整操作示例

```
C:\Users\Administrator> d:
D:\> cd tcm-bti-assessment
D:\tcm-bti-assessment> dir package.json
（应该能看到 package.json 文件）
D:\tcm-bti-assessment> pnpm install
（开始安装依赖）
```

---

## 如何确认切换成功？

切换成功后，命令提示符应该显示：

```
D:\tcm-bti-assessment>
```

如果还是显示 `C:\Users\Administrator>`，说明没有切换成功。

---

## 快速检查清单

- [ ] 执行了 `d:` 切换到 D 盘
- [ ] 执行了 `cd tcm-bti-assessment` 进入项目文件夹
- [ ] 提示符显示 `D:\tcm-bti-assessment>`
- [ ] 运行 `dir package.json` 能看到文件
- [ ] 运行 `pnpm install` 开始安装
