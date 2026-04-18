# Tasks

- [x] Task 1: 数据库模型设计与迁移
  - [x] SubTask 1.1: 在 Prisma schema (如 `backend/prisma/schema.prisma` 或 `apps/api/prisma/schema.prisma`，视项目主数据源而定) 中新增工单流程模型（WorkOrderFlow），包含字段：id, name, description, formSchema (JSON), workflowData (JSON), createdAt, updatedAt。
  - [x] SubTask 1.2: 执行 prisma generate 和 prisma migrate 部署数据库变更。

- [x] Task 2: 后端 API 开发
  - [x] SubTask 2.1: 实现工单流程的 CRUD 路由（获取列表、获取单条、创建、更新、删除）。
  - [x] SubTask 2.2: 将新增路由挂载到后端服务主入口中。
  - [x] SubTask 2.3: 添加单元测试或 API 连通性测试。

- [x] Task 3: 前端路由与列表页
  - [x] SubTask 3.1: 在前端项目中新增“工单流程管理”路由，添加左侧菜单导航（如适用）。
  - [x] SubTask 3.2: 开发 `WorkOrderFlowList.tsx` 页面，展示流程列表，支持创建和删除流程。

- [x] Task 4: 前端可视化编辑器（复用智能体 UI）
  - [x] SubTask 4.1: 创建 `WorkOrderFlowEditor.tsx`，基于 `@xyflow/react` 搭建画布。
  - [x] SubTask 4.2: 提取并复用 `AgentEditor` 中的节点样式（如 `KnowledgeBaseNode` 的圆角和边框设计），创建专属于工单的流转节点（如：提交节点、审批节点、处理节点）。
  - [x] SubTask 4.3: 实现画布上的拖拽、连线、删除节点功能，并与后端接口对接，支持保存 `workflowData`。

- [x] Task 5: 前端自定义表单配置面板
  - [x] SubTask 5.1: 在编辑器右侧新增“表单配置”面板，支持定义全局或节点的自定义字段（字段类型：文本、数字、下拉、日期等）。
  - [x] SubTask 5.2: 实现字段的增删改查 UI，并在保存流程时同步更新到后端的 `formSchema`。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]
