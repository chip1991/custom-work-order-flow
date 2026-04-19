# 流程中心增加“条件判断节点”实现计划

## 1. Summary (总结)
本项目计划在物业工单流程编辑器的左侧侧边栏中，增加一个全新的“条件判断节点”（Condition Node）。
该节点具备“一进多出”的分支特性，允许用户根据特定的业务条件（如工单类型、金额等）将流程分流到不同的审批人或处理节点。本次实现将包含左侧 UI 入口、带有多个输出触点的画布节点组件，以及在属性面板中的条件表达式配置。

## 2. Current State Analysis (现状分析)
经过对 `frontend/src/pages/Processes` 目录的探索：
- **侧边栏 (`Sidebar.tsx`)**：目前有 8 个节点，按顺序排列。节点配置是通过写死的 `nodeTypes` 数组循环渲染的。
- **画布节点 (`components/nodes/`)**：现有的所有节点（如受理、评价、审批）均是基于“一进一出”设计的简单节点组件（包含一个 Target Handle 和一个 Source Handle）。
- **注册机制 (`components/nodes/index.ts`)**：所有节点都在此处集中引入，并作为 `nodeTypes` 对象暴露给 `Canvas.tsx` 中的 React Flow 引擎。
- **属性面板 (`PropertiesPanel.tsx`)**：根据选中的 `selectedNode.type` 动态渲染专属配置表单。目前尚未有处理“分支条件”的逻辑。

## 3. Proposed Changes (建议的修改)

### 3.1 编写条件判断节点组件
- **文件**: `frontend/src/pages/Processes/components/nodes/ConditionNode.tsx`
- **What**: 新建一个带有两个输出触点的 React Flow 自定义节点组件。
- **How**: 
  - 引入 `@xyflow/react` 的 `Handle` 组件。
  - 左侧渲染一个 `type="target"` 的 Handle（接收连线）。
  - 右侧渲染两个 `type="source"` 的 Handle，分别设置 `id="true"` 和 `id="false"`，并辅以“是”和“否”的文字提示。
  - 节点 UI 使用分支图标（如 `GitMerge` 或 `Split`），颜色主题可设为橙色或黄色以示区分。

### 3.2 注册新节点
- **文件**: `frontend/src/pages/Processes/components/nodes/index.ts`
- **What**: 将 `ConditionNode` 注册到节点映射表中。
- **How**: 引入刚才创建的 `ConditionNode`，并在导出的对象中添加 `condition: ConditionNode`。

### 3.3 修改左侧侧边栏
- **文件**: `frontend/src/pages/Processes/components/Sidebar.tsx`
- **What**: 在节点列表中增加“条件判断”选项。
- **How**: 在 `nodeTypes` 数组的合适位置（例如放在“处理节点”和“审批节点”之间）插入一条新配置：`{ type: 'condition', label: '条件判断', icon: GitMerge, desc: '根据条件走向不同分支' }`。

### 3.4 扩展右侧属性面板
- **文件**: `frontend/src/pages/Processes/components/PropertiesPanel.tsx`
- **What**: 为选中的“条件判断节点”提供专属的配置 UI。
- **How**: 
  - 在条件渲染区域增加 `selectedNode.type === 'condition'` 的判断。
  - 提供表单让用户输入“判断字段”（如金额）、“判断条件”（如 `>`、`=`、`<`）以及“比较值”。
  - 确保用户输入的数据通过 `onUpdateNodeData` 正确写回节点的 `data` 属性中（例如存储在 `data.conditionConfig` 里）。

## 4. Assumptions & Decisions (假设与决策)
- **决策**: 初始版本的条件节点固定为两个分支（“是”与“否”），暂不支持用户在属性面板中动态无限制地增加 N 个分支，以保证实现简洁稳定，满足绝大多数基础审批分流需求。
- **假设**: 画布连线数据的保存与反序列化由外部父组件及后端 API 统一接管，新节点引入后无需专门调整现有保存接口的逻辑（由于仅扩展了节点的类型和 `data` 结构，与现有架构兼容）。

## 5. Verification steps (验证步骤)
1. 运行 `npm run build`，确保所有修改符合 TypeScript 检查且构建成功。
2. 启动前端服务，打开流程编辑器页面，检查左侧面板是否出现“条件判断”节点。
3. 将“条件判断”节点拖入画布，确认其 UI 是否正确渲染为一个输入点、两个输出点（是/否）。
4. 从其他节点拉出连线连接到条件节点，再从条件节点的“是”、“否”触点分别拉出连线连接到不同的后续节点。
5. 选中条件判断节点，确认右侧属性面板是否正确显示了条件配置表单（判断字段、操作符、比较值），并测试修改是否生效。