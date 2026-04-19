# Tasks

- [x] Task 1: 初始化后端基础环境与数据库
  - [x] SubTask 1.1: 在 `backend` 目录安装并配置 Express、SQLite3、Prisma 等必要的依赖。
  - [x] SubTask 1.2: 设计并创建 Prisma schema（Model, Question, Message, Task, TaskResult）。
  - [x] SubTask 1.3: 配置环境变量加载与基础路由结构。

- [x] Task 2: 实现模型中心与题库中心的 API
  - [x] SubTask 2.1: 实现模型的 CRUD API（增删改查及状态切换）。
  - [x] SubTask 2.2: 实现题目（包含关联的对话 Messages）的 CRUD API。

- [x] Task 3: 实现测评执行引擎与 API
  - [x] SubTask 3.1: 实现创建测评任务、查询任务列表及详情的 API。
  - [x] SubTask 3.2: 开发后端测评调度引擎，能根据选择的模型和题目，并发调用对应的大模型 API（兼容 OpenAI 格式），计算响应时间等指标并持久化。
  - [x] SubTask 3.3: 开发 SSE (Server-Sent Events) 接口，向前端实时推送各个模型的流式输出结果。

- [x] Task 4: 开发前端基础布局与路由
  - [x] SubTask 4.1: 在 `frontend` 中配置 React Router，搭建带有左侧边栏导航的主布局（模型中心、题库中心、测评中心）。

- [x] Task 5: 开发前端模型中心页面
  - [x] SubTask 5.1: 实现模型列表页（带筛选、分页）。
  - [x] SubTask 5.2: 实现新增/编辑模型的弹窗或表单页。

- [x] Task 6: 开发前端题库中心页面
  - [x] SubTask 6.1: 实现题目列表页。
  - [x] SubTask 6.2: 实现对话编排页，支持动态添加多轮对话（角色和内容）。

- [x] Task 7: 开发前端测评中心页面
  - [x] SubTask 7.1: 实现测评任务列表页。
  - [x] SubTask 7.2: 实现创建测评任务页（多选模型与题目）。
  - [x] SubTask 7.3: 实现测评详情与横向对比页，接入 SSE 接口展示实时打字机效果及核心指标。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 5 depends on Task 2 and Task 4
- Task 6 depends on Task 2 and Task 4
- Task 7 depends on Task 3, Task 5, and Task 6
