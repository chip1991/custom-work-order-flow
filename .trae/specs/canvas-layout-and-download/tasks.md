# Tasks
- [ ] Task 1: 安装前置依赖库 `dagre`、`@types/dagre` 和 `html-to-image`。在 `frontend` 目录下运行 `npm install`。
- [ ] Task 2: 调整原生控制栏位置。在 `frontend/src/pages/Processes/components/Canvas.tsx` 中，将 `<Controls />` 的 `position` 属性设置为 `"bottom-center"`。
- [ ] Task 3: 实现自动布局算法。在 `Canvas.tsx` 外层创建一个纯函数 `getLayoutedElements(nodes, edges)`。该函数内部实例化 `dagre.graphlib.Graph`，遍历传入的 `nodes` 设置宽高（假定 150x50），遍历 `edges`，调用 `dagre.layout()`，最后将计算出的 `node.x` 和 `node.y` 赋值给返回的新节点数组，并将节点的 `targetPosition` 和 `sourcePosition` 根据布局方向（如 `TB` 或 `LR`）进行相应更新。
- [ ] Task 4: 将“自动布局”集成到 UI。在 `<Controls>` 内添加一个自定义的 `<ControlButton>` (引入 `Layout` 图标)。点击时调用 `getLayoutedElements` 得到新的节点和边，调用 `setNodes` 和 `setEdges` 更新状态，并通过 `requestAnimationFrame` 或 `setTimeout` 延迟调用 `useReactFlow().fitView()` 使画布居中。
- [ ] Task 5: 实现“下载图片”功能。在 `<Controls>` 内添加一个 `<ControlButton>` (引入 `Download` 图标)。点击时，使用 `getNodesBounds(getNodes())` 计算所有节点的边界范围，然后调用 `getViewportForBounds` 计算出所需的 `transform` 缩放矩阵。最后选中 DOM 元素 `.react-flow__viewport`，调用 `toPng` 生成 Base64，动态创建一个 `<a>` 标签触发浏览器下载。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 1]