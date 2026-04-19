# 登录功能与预设账号实现计划

## 摘要
为大模型测评平台实现完整的“账号ID/邮箱 + 密码”登录功能。后端将新增 `User` 数据模型和鉴权接口，并预设管理员账号（账号：`admin`，密码：`admin123`）。前端将修改现有的登录页 UI 对接该接口，并实现基础的路由鉴权（未登录跳转到登录页）。

## 当前状态分析
- **数据库**：目前的 `schema.prisma` 中仅有业务相关模型（Model, Question, Message, Task 等），缺失用户（User）模型。
- **后端**：没有提供登录验证相关的接口，API 处于未设防状态，没有安装加密和 JWT 相关的依赖。
- **前端**：现有的登录页 (`Home.tsx`) 是纯静态 UI，包含“手机号”和“邮箱”两种切换，没有真实的数据交互和状态保存逻辑；应用入口 (`App.tsx`) 未做路由鉴权保护。

## 拟议变更 (Proposed Changes)

### 1. 数据库与后端环境配置
- **安装依赖**：在 `backend` 目录下安装密码哈希库 `bcryptjs` 和 JWT 库 `jsonwebtoken`。
- **更新 Schema** (`backend/prisma/schema.prisma`)：
  - 新增 `User` 模型，包含字段：`id`, `account` (唯一), `email` (唯一，可选), `password` (哈希值), `createdAt`, `updatedAt`。
  - 运行 `npx prisma db push` 更新数据库结构。
- **编写初始化脚本** (`backend/prisma/seed.js`)：
  - 编写一个可执行脚本，在数据库中查询是否已存在 `admin` 账号，若无，则插入预设账号（`account: "admin"`, `password: "admin123"` 的哈希值）。

### 2. 后端鉴权接口实现
- **新建鉴权路由** (`backend/routes/auth.js`)：
  - 实现 `POST /api/auth/login` 接口。
  - 接收参数：`identifier` (对应账号ID或邮箱) 和 `password`。
  - 逻辑：通过 `identifier` 在 `User` 表中通过 `OR` 条件查询用户；使用 `bcryptjs.compare` 校验密码；校验通过后签发 JWT Token。
- **挂载路由** (`backend/server.js`)：
  - 引入并挂载 `app.use('/api/auth', require('./routes/auth'))`。
- **（可选拓展）**：后续可在需要保护的路由上添加 token 验证中间件，但本次优先保证登录主流程的畅通。

### 3. 前端对接与路由保护
- **更新登录页 UI 与逻辑** (`frontend/src/pages/Home.tsx`)：
  - 将默认的登录方式改为“账号/邮箱”。
  - 修改对应的输入框提示文字为“请输入账号或邮箱”，绑定 `identifier` 状态。
  - 在点击“登录/注册”时，调用后端的 `/api/auth/login` 接口。
  - 若登录成功，将返回的 Token 存入 `localStorage`，并跳转到平台首页 (`/models`)。若失败则提示错误信息。
- **封装 API 请求** (`frontend/src/lib/api.ts` 等)：
  - 添加登录请求的封装，并在现有的 API 拦截器（如果有）中统一附加 `Authorization: Bearer <token>` 请求头。
- **路由鉴权拦截** (`frontend/src/components/Layout.tsx` 或 `App.tsx`)：
  - 在进入 Layout 布局时，检查 `localStorage` 中是否存在 token。如果不存在，则重定向回 `/login`。
  - 在侧边栏或顶部增加一个“退出登录”按钮（清除 token 并跳回 `/login`）。

## 假设与决策 (Assumptions & Decisions)
- **密码安全**：为了安全，即便是预设密码 `admin123`，在数据库中也必须使用 `bcryptjs` 加密存储。
- **登录交互**：保留前端现有的手机号登录 UI，但将其作为占位符，默认激活“账号/邮箱”登录 Tab，确保用户优先看到可用的登录方式。
- **状态管理**：目前采用最轻量的 `localStorage` 来存储 JWT Token。

## 验证步骤 (Verification)
1. 运行 `node prisma/seed.js` 后，数据库的 `User` 表中存在 `admin` 账号。
2. 启动前后端服务，未登录状态下访问 `/models` 将自动跳回 `/login` 登录页。
3. 在登录页输入 `admin` 和 `admin123`，点击登录能成功进入平台。
4. 输入错误的密码会提示登录失败。
