# Tasks
- [ ] Task 1: 完善 `Process` 类型声明。在 `frontend/src/api/processes.ts` 中补充 `communities`、`nodes`、`status`、`createdAt`、`updatedAt` 等字段的类型定义。
- [ ] Task 2: 扩展 `index.tsx` 的表格列。在 `frontend/src/pages/Processes/index.tsx` 中，引入 `dayjs`，将原本只有“名称”和“描述”的表格头部和 `tbody` 映射逻辑，扩充为：流程名称、描述、适用项目(Tag)、节点数(解析JSON长度)、状态(Badge)、版本(固定为V1.0)、创建时间、更新时间。
- [ ] Task 3: 扩展 `index.tsx` 的操作列功能。在操作列新增“查看版本信息”(Toast 提示暂无记录)、“复制流程”(调用 `createProcess`，使用当前选中的流程数据并将其名称改为 `原名称 - 副本`，完成后调用 `fetchProcesses`)，保留并调整原有的“编辑流程”和“删除流程”按钮。
- [ ] Task 4: 优化“编辑流程”的路由跳转。在 `index.tsx` 的“编辑流程”点击事件中，将 `navigate(\`/processes/\${process.id}/edit\`)` 修改为 `navigate(\`/processes/\${process.id}/edit?tab=basic\`)`。
- [ ] Task 5: 优化 `Editor.tsx` 的 Tab 初始状态。在 `frontend/src/pages/Processes/Editor.tsx` 中引入 `useSearchParams`，将 `const [activeTab, setActiveTab] = useState<TabType>('node');` 修改为根据 URL 中的 `tab` 参数初始化（如果不存在则回退到 `'node'`）。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] can run in parallel with [Task 3]
- [Task 5] depends on [Task 4]