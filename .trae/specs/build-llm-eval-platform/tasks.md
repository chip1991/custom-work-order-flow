# Tasks

- [x] Task 1: 初始化全栈工程骨架（前端 + 后端 + 共享包）
  - [x] 创建 monorepo（npm workspaces），约定 `apps/web` 与 `apps/api`
  - [x] 提供根目录脚本：`npm run dev`、`npm run build`、`npm run lint`、`npm run test`
  - [x] 提供开发与生产构建配置（TypeScript、环境变量模板、基础日志）

- [x] Task 2: 数据库与领域模型落地（真实持久化）
  - [x] 选择并接入数据库（默认 Postgres；提供 docker compose 便捷启动）
  - [x] 建立 schema 与迁移：User、Project、Model、ModelVersion、ApiKey、Dataset、Sample、PromptTemplate、Metric、EvaluationPlan、EvaluationRun、RunCase、MetricResult
  - [x] 提供基础种子脚本（仅创建管理员账号；不生成假评测数据）

- [x] Task 2b: 无 Docker 环境可运行的数据库模式（SQLite）
  - [x] 将开发/演示环境默认数据库切换为 SQLite 文件（真实持久化）
  - [x] 更新 Prisma schema、迁移与 seed 以兼容 SQLite
  - [x] 更新环境变量示例与 README，确保在无 docker 环境也能完整跑通前后端

- [x] Task 3: 后端 API（鉴权 + CRUD + 运行引擎）
  - [x] 实现认证：注册（可选/默认关闭）、登录、登出、获取当前用户
  - [x] 实现 Project/Model/ModelVersion/Dataset/Sample/PromptTemplate/Metric/EvaluationPlan 的 CRUD API
  - [x] 实现数据集导入 API（JSONL），包括失败行定位与回滚策略
  - [x] 实现运行 API：创建运行、查询运行列表/详情、取消运行
  - [x] 实现评测执行引擎（Worker 形态可与 API 分进程运行）：
    - [x] 从计划解析样本集合（ALL/RANDOM_N）
    - [x] 渲染 Prompt（变量从 sample/input/context/metadata 提取）
    - [x] 调用模型 endpoint（OPENAI 兼容优先；支持超时/重试/并发控制）
    - [x] 计算并落库指标（MVP 指标集）
    - [x] 更新 run 状态与错误信息
  - [x] 实现健康检查 API（ModelVersion ping）

- [x] Task 4: 前端 Web（真实数据驱动）
  - [x] 实现登录页与受保护路由
  - [x] 实现仪表盘（最近运行列表、核心指标概览）
  - [x] 实现各实体页面（列表/表单/详情）：
    - [x] 项目
    - [x] 模型与版本
    - [x] 数据集与样本（含导入）
    - [x] Prompt 模板
    - [x] 指标
    - [x] 评测计划（创建/编辑/详情/触发运行）
    - [x] 评测运行（列表/详情/案例筛选）
  - [x] 实现对比页（选择两个运行，对比指标与差异案例）

- [x] Task 5: 校验、构建与本地预览
  - [x] 确保 `npm run build` 在根目录可通过（前端与后端均构建成功）
  - [x] 提供 `npm run dev` 启动前端与后端（必要时分别启动）
  - [x] 提供最小 E2E 验证脚本/说明：创建项目→导入数据集→配置模型→创建计划→触发运行→查看结果

- [x] Task 6: 内置本地模型推理（用于无外部 Key 的真实跑通）
  - [x] 在后端增加 `local://` baseUrl 支持，使用本地可下载的小模型完成真实推理
  - [x] 健康检查与运行引擎同时支持 `local://` 与 HTTP OpenAI 兼容两种模式
  - [x] 更新前端模型版本表单提示与 README，给出可直接跑通的本地模型示例

- [x] Task 7: RunCase 执行与资源字段补齐
  - [x] 在 RunCase 中持久化 latencyMs/token/cost/errorType，并在运行详情返回
  - [x] 指标计算与前端详情展示可引用这些字段（至少可见）

# Task Dependencies
- Task 2 depends on Task 1
- Task 2b depends on Task 2
- Task 3 depends on Task 2b
- Task 4 depends on Task 3
- Task 5 depends on Task 3 and Task 4
- Task 6 depends on Task 3 and Task 4
- Task 7 depends on Task 3 and Task 4
