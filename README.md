# LLM Eval Platform

大模型测评平台（LLM Evaluation Platform）。

## 开发

```bash
npm install
cp .env.example .env
npm run db:init
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/health

## 数据库

```bash
npm run db:init
```

默认使用 SQLite 文件持久化（无 Docker 依赖）。`DATABASE_URL=file:./.data/dev.db` 的相对路径以 [schema.prisma](file:///workspace/apps/api/prisma/schema.prisma) 所在目录为基准，实际数据库文件会落在 `apps/api/prisma/.data/dev.db`（已被 gitignore）。

如仍想用 Docker 启动一个 Postgres 容器（可选，不影响默认 SQLite 模式）：

```bash
npm run db:up
npm run db:down
```

开发时如果需要生成新迁移：

```bash
npm run db:migrate:dev -- --name <migration_name>
```

## 构建 / Lint / Test

```bash
npm run build
npm run lint
npm run test
```

## 最小验证流程（E2E）

1. 启动：按“开发”章节完成 `db:init` 与 `dev`
2. 登录：使用 `.env` 中 `ADMIN_EMAIL / ADMIN_PASSWORD` 登录
3. 创建项目：进入 Projects -> New
4. 创建数据集与导入样本：
   - 进入 Datasets -> New
   - 进入数据集详情 -> Import JSONL，粘贴 JSONL（每行一个对象，至少包含 `input` 字段）
5. 配置模型与版本：
   - 进入 Models -> New
   - 在模型详情创建 Version：
     - OpenAI 兼容模式：Base URL 例如 https://api.openai.com/v1，并在 Config(JSON) 中填入 {"apiKey":"..."}
     - 本地推理模式：Base URL 填入 local://Xenova/gpt2（无需任何外部 key）
6. 创建指标：
   - 进入 Metrics -> New（如 EXACT_MATCH/CONTAINS/LENGTH）
7. 创建评测计划并运行：
   - 进入 Plans -> New，选择数据集、Prompt 模板、候选 ModelVersion、指标
   - 在计划详情点击 Run
8. 查看结果与对比：
   - 进入 Runs 查看运行详情与案例筛选
   - 进入 Compare 选择两个 runId 查看指标差值与差异案例
