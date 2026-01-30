# 在 er1.store 上部署（Git 拉取 + 重启）

---

## 小白版：一步步在 er1.store 上部署

**目标**：让 er1.store 这台服务器跑上「最新代码」，这样小程序请求「测评历史第一条」时就不会 404。

**你需要先有**：
- er1.store 这台服务器的**登录方式**。常见两种：
  - **SSH**：用终端（PowerShell、Xshell、宝塔终端等）输入账号密码或密钥连接；
  - **宝塔面板**：用浏览器打开服务器提供的面板地址，用账号密码登录，在「终端」里操作。

下面按「在服务器上打开终端」之后来说，每一步你**复制一行，执行完再看下一行**。

---

### 第 0 步（仅当 node / npm 未安装时）：在服务器上安装 Node.js

若在终端执行 `node -v` 或 `npm -v` 提示 **command not found**，说明服务器还没有 Node.js，需要先安装：

1. **用宝塔安装 Node.js**
   - 打开宝塔面板 → 左侧点 **「软件商店」**。
   - 搜索 **「Node 版本管理器」** 或 **「Node.js」**。
   - 点击 **「安装」**，等待安装完成。
   - 安装好后，在「软件商店」里找到该插件，点 **「设置」** 或 **「管理」**，在里边安装一个 Node 版本（建议 **Node 18** 或 **20**），并设为默认。
2. **让终端能找到 node / npm**
   - 宝塔的「终端」有时不会自动加载 Node 环境。安装完 Node 后，在终端里先执行一次：
     ```bash
     source /etc/profile
     source ~/.bashrc
     ```
   - 再执行 `node -v`、`npm -v`，若仍提示 command not found，在 Node 版本管理器的设置页里查看它给出的 **Node 安装路径**（例如 `/www/server/nvm/versions/node/v18.x.x/bin`），在终端里用**完整路径**测试，例如：
     ```bash
     /www/server/nvm/versions/node/v18.20.0/bin/node -v
     ```
     （路径以你面板里显示的为准。）若这样能输出版本号，说明 Node 已装好，只是 PATH 未生效。可以临时把该路径加入 PATH 再继续：
     ```bash
     export PATH="/www/server/nvm/versions/node/v18.20.0/bin:$PATH"
     ```
     （同样把路径换成你实际的。）然后执行 `pnpm`、`pm2` 的安装与部署命令即可。
3. **安装 pnpm 和 pm2**
   - 在终端里（确保 `node -v`、`npm -v` 可用后）执行：
     ```bash
     npm install -g pnpm
     npm install -g pm2
     ```
   - 执行 `pnpm -v`、`pm2 -v` 确认安装成功。之后从下面「第 1 步」继续部署。

---

### 第 1 步：登录到 er1.store 服务器

- **用 SSH 的**：打开 PowerShell 或 Xshell，输入（把 `你的用户名` 和 `er1.store` 换成你自己的）：
  ```bash
  ssh 你的用户名@er1.store
  ```
  按提示输入密码。
- **用宝塔的**：浏览器打开宝塔面板 → 左侧点「终端」→ 会弹出一个黑色窗口，相当于已经登录服务器。

---

### 第 2 步：找到项目在服务器上的目录

项目代码在服务器上的**文件夹路径**要搞清楚，例如可能是：
- `/www/wwwroot/tcm-bti-assessment`
- 或 `/home/你的用户名/tcm-bti-assessment`

**先进入这个目录**（把路径换成你实际的）：

```bash
cd /www/wwwroot/tcm-bti-assessment
```

如果不知道路径：在终端里输入 `ls` 回车，看当前目录下有哪些文件夹；或问当时帮你部署的人「项目放在哪个目录」。

输入下面命令确认当前在项目里（会列出 package.json、server 等）：

```bash
ls
```

能看到 `package.json`、`server` 就说明目录对了。

---

### 第 3 步：拉取最新代码

在**同一个项目目录下**执行（用 main 分支的话）：

```bash
git pull origin main
```

如果提示要输入账号密码，就输入你 Git 的账号密码；如果项目用的是其他分支（比如 `master`），把 `main` 改成那个分支名。

看到类似 “Already up to date” 或 “Updated …” 就表示代码已更新。

---

### 第 4 步：安装依赖

继续在同一目录执行：

```bash
pnpm install
```

如果没有装 pnpm，先装：`npm install -g pnpm`，再执行上面这句。  
等它跑完，不要报错即可。

---

### 第 5 步：构建服务端（生成新的 dist/index.js）

```bash
pnpm run build:server
```

跑完后目录下会有一个 `dist` 文件夹，里面应有 `index.js`。这一步是「把最新接口（如 assessments.getLatest）打进要运行的程序里」。

---

### 第 6 步：重启服务（让新程序生效）

**方式一：你用的是 pm2（推荐）**

先看有没有在跑这个项目：

```bash
pm2 list
```

列表里如果有 `tcm-bti-assessment` 或类似名字，执行：

```bash
pm2 restart tcm-bti-assessment
```

（名字以你 `pm2 list` 里看到的为准。）

如果从没用过 pm2，列表里没有这个项目，可以启动一次：

```bash
pm2 start dist/index.js --name tcm-bti-assessment
```

**方式二：没有用 pm2，是直接 node 跑的**

- 先找到正在跑的 node 进程（多半是 `node dist/index.js` 或 `node index.js`），在服务器上把它关掉（例如在跑它的那个终端里按 Ctrl+C，或用任务管理器结束对应进程）。
- 再到项目目录下执行：
  ```bash
  node dist/index.js
  ```
  让它一直在后台跑（或配合 nohup / 屏幕会话）。

---

### 第 7 步：验证是否成功

在你**自己的电脑浏览器**里打开这个链接：

```
https://er1.store/api/trpc/assessments.getLatest?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D
```

- 如果页面显示一段 **JSON 报错**（例如未登录相关），或**不是「无法访问 / 404」**，一般就说明接口已经在了（200 或 401 都算成功）。
- 如果还是 **404 或打不开**，说明服务没起来或没用到新构建的 `dist/index.js`，需要回到第 6 步再确认重启的是不是当前目录下的服务。

---

**小结（小白版）**：登录服务器 → 进项目目录 → `git pull origin main` → `pnpm install` → `pnpm run build:server` → 用 pm2 或 node 重启服务 → 浏览器打开上面链接验证。

---

## 0. 一键部署（推荐）

SSH 登录到 er1.store 后，进入项目目录，执行：

```bash
cd /path/to/tcm-bti-assessment   # 换成你项目在服务器上的实际路径
bash scripts/deploy-er1.sh
```

脚本会自动：拉取当前分支最新代码 → 安装依赖 → 构建服务端 → 用 pm2 重启（若已安装 pm2）。

- 默认拉取分支为 `main`。若部署其他分支，例如 `restore-v1.4-closest`：
  ```bash
  DEPLOY_BRANCH=restore-v1.4-closest bash scripts/deploy-er1.sh
  ```
- 若服务器未安装 pm2，脚本会提示你手动执行 `node dist/index.js` 或先安装 pm2。

---

## 1. 本地先构建再推送（可选）

服务端路由在 `server/routers.ts`，线上跑的是 **打包后的** `dist/index.js`。改完路由后必须重新打包，再推送到 Git，er1.store 拉取后才会生效。

在**本机**执行：

```powershell
cd i:\ing\tcm-bti-assessment

# 只打服务端包（不构建前端）
pnpm run build:server

# 提交打包结果（若 dist/index.js 有变化）
git add dist/index.js
git commit -m "chore: rebuild server bundle for assessments route"
git push origin restore-v1.4-closest
```

（如你主分支是 `main`，把上面最后一句改成 `git push origin main`。）

---

## 2. 在 er1.store 服务器上部署

SSH 登录到 er1.store 后，在项目目录执行：

### 方式 A：直接用 Node 跑（不用 Docker）

```bash
cd /path/to/tcm-bti-assessment   # 换成你项目在服务器上的路径

git pull origin restore-v1.4-closest   # 或 main

pnpm install --prod
pnpm run build:server   # 若本地已构建并提交了 dist，可省略

# 用 pm2 的话
pm2 restart tcm-bti-assessment
# 或
pm2 start dist/index.js --name tcm-bti-assessment
```

### 方式 B：用 Docker

```bash
cd /path/to/tcm-bti-assessment

git pull origin restore-v1.4-closest

docker build -t tcm-bti:latest .
docker stop tcm-bti-container 2>/dev/null; docker rm tcm-bti-container 2>/dev/null
docker run -d --name tcm-bti-container -p 3000:3000 --env-file .env tcm-bti:latest
```

（容器名、端口、环境变量按你实际配置改。）

---

## 3. 验证

部署完成后，在浏览器或本机请求（需带登录态 Cookie 或 `x-session-token` 时可能返回 401，属正常；**不应再出现 404**）：

- 测评历史列表：`https://er1.store/api/trpc/assessments.myAssessments?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`
- **AI 页调取最近一次测评（必验）**：`https://er1.store/api/trpc/assessments.getLatest?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`

**重要**：tRPC 的 GET 请求**必须带查询参数** `?batch=1&input=...`，否则服务端会返回 404。用 curl 验证时请用完整 URL，例如：

```bash
curl -s -o /dev/null -w "%{http_code}" "https://er1.store/api/trpc/assessments.getLatest?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D"
```

返回 **200**（已登录）或 **401**（未登录）即表示接口正常；若返回 **404** 才说明路由或代理有问题。

若上述 **assessments.getLatest** 返回 **404**，说明线上仍在跑旧版本服务端，AI 助手无法调取测评历史第一条。请确认已在 er1.store 上拉取**含 `server/routers.ts` 中 `assessment.getLatest` 与 `assessments.getLatest` 的最新代码**，并重新执行 `pnpm run build`（或 `pnpm run build:server`）后重启进程。

**查看 pm2 日志**（若提示 `pm2: command not found`，先设置 PATH 再执行）：

```bash
export PATH="/www/server/nodejs/v24.13.0/bin:$PATH"
pm2 logs er1-store --lines 30
```

---

## 4. 若小程序仍报 404（测评历史未调用）

**现象**：控制台出现 `assessment.getLatest` 或 `assessments.getLatest` **404 (Not Found)**，AI 页显示「通用养生助手」、无法调取测评历史第一条。

**常见原因**：

1. **HTTPS 未转发到 Node**：小程序请求的是 `https://er1.store/api/trpc/...`。若 Nginx 只配置了 **80 端口** 的 `/api/trpc` 代理，而 **443（HTTPS）** 的 `server` 块里没有相同配置，则走 HTTPS 的请求会落到静态站点或默认页，返回 404。  
   **处理**：按下面「具体操作步骤」在 Nginx 的 **443** 对应 `server` 块中同样添加 `location /api/trpc`，保存后重载 Nginx。

---

### 具体操作步骤（宝塔 + Nginx，解决 HTTPS 下 /api/trpc 404）

1. **打开 Nginx 配置**
   - 登录 **宝塔面板** → 左侧点 **「网站」**。
   - 找到 **er1.store**，点右侧 **「设置」**。
   - 在弹窗里点 **「配置文件」**（或「Nginx 配置」），会打开该站点的 Nginx 配置全文。

2. **找到 443 端口的 server 块**
   - 在配置文件里搜索 **`listen 443`** 或 **`ssl`**，会看到一段类似：
     ```nginx
     server {
         listen 443 ssl http2;
         server_name er1.store;
         # ... 下面有 ssl_certificate、ssl_certificate_key、location / 等
     ```
   - 你要改的就是**这一段**（有 `listen 443` 的那一整块 `server { ... }`）。

3. **在 443 的 server 里加上 /api/trpc 代理**
   - 在这段 `server { ... }` **内部**，找一个合适位置（例如在 `location /` 上面或下面），**新增**下面这一整段（可直接复制）：
     ```nginx
     location /api/trpc {
         proxy_pass http://127.0.0.1:3000;
         proxy_http_version 1.1;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
     }
     ```
   - 注意：不要删掉原有的 `location /`、SSL 证书等，只**增加**这一段。

4. **保存并重载 Nginx**
   - 点编辑器下方 **「保存」**。
   - 宝塔若提示「Nginx 配置已更新」或自动重载，即完成。
   - 若没有自动重载：点左侧 **「软件商店」** → 找到 **Nginx** → **「设置」** → **「服务」** → **「重载配置」**；或在终端执行：
     ```bash
     nginx -t && nginx -s reload
     ```

5. **验证**
   - 浏览器或手机访问：`https://er1.store/api/trpc/assessments.getLatest?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`
   - 若返回 **401**（未登录）或 **200**（已登录），说明代理生效，不再 404。
   - 再打开小程序，用已登录账号进 AI 助手，看是否还能报 404；不报即修复完成。

2. **Express 路由顺序**：若 pm2 日志里出现 `ERR_STREAM_WRITE_AFTER_END` 且 curl 仍返回 404，多半是 `/api` 的 historyRouter 先于 `/api/trpc` 注册，把 tRPC 请求拦下并返回 404，随后 tRPC 再写响应导致 “write after end”。  
   **处理**：已在本仓库中把 `/api/trpc`、`/api/wechat`、`/api/admin` 放在 `/api`（historyRouter）**之前**注册。部署时拉取最新代码、重新构建并重启即可。

3. **服务端未挂载路由**：er1.store 当前运行的服务端**没有**挂载 `assessment.getLatest` / `assessments.getLatest` 路由（多为未部署最新代码或未用新构建的 `dist/index.js` 重启）。

**处理**：
1. 若同时出现 **auth.me 503**、**assessments.getLatest 404**：先确认 Node 进程是否在跑、是否用了新构建。
   - 在服务器终端执行：`export PATH="/www/server/nodejs/你的版本/bin:$PATH"`（若 node 未在 PATH 中），然后 `cd /www/wwwroot/er1.store`，执行 `pm2 list`。若无进程或进程报错，执行 `pm2 start dist/index.js --name er1-store` 或 `pm2 restart 项目名`。
   - 确认**当前运行的**是含 getLatest 的代码：在项目目录执行 `pnpm run build:server` 生成新 `dist/index.js`，再执行 `pm2 restart 项目名`。
2. 在 er1.store 上进入项目目录，执行 `git pull` 拉取**包含 `server/routers.ts` 中 assessment 与 assessments 路由**的最新代码（若尚未拉取）。
3. 执行 `pnpm run build:server`（若未提交 `dist/index.js` 则必须在服务器上构建）。
4. 用 pm2 重启服务：`pm2 restart 项目名`，使新 `dist/index.js` 生效。
5. 再次访问上面的 **assessments.getLatest** 验证链接，确认返回 200 或 401（不要 404）。

---

## 5. 占位图加载失败（via.placeholder.com）

**现象**：控制台或渲染层报 `Failed to load image https://via.placeholder.com/100?text=User`、`net::ERR_NAME_NOT_RESOLVED`。

**原因**：小程序「我的」页或某处使用了 `via.placeholder.com` 作为头像占位图，该域名在国内可能无法解析或不可用。

**处理**：在源码中查找并替换为本地图片（如 `/images/avatar-default.png`）或去掉该图片、仅用文字/图标占位。修改后重新执行小程序构建（如 `pnpm run build:weapp`）并上传。

---

## 小结

- **本地**：改完 `server/routers.ts` 后执行 `pnpm run build:server`，提交并推送 `dist/index.js`（或至少推送含新路由的代码，在服务器上再构建）。
- **er1.store**：`git pull` 拉最新代码，按上面方式 A 或 B 重启/重建容器，使新 `dist/index.js` 生效。
- **AI 测评历史**：小程序依赖 `assessments.getLatest`（或 `assessment.getLatest`），部署后必须保证该接口在 er1.store 上可访问（非 404）。
- **HTTPS 404**：若小程序走 `https://er1.store` 仍 404，优先检查 Nginx **443** 的 `server` 块是否已配置 `location /api/trpc` 代理到 Node。
