# Tasks
- [x] Task 1: 引入并初始化 Tab 状态。在 `src/pages/Processes/Editor.tsx` 中定义 `activeTab` 状态，可选值为 `'basic'`, `'form'`, `'node'`，默认值为 `'node'`。
- [x] Task 2: 改造 Header UI。为 Header 增加相对定位，并在其中添加绝对定位居中的 Tab 按钮组；调整左右两侧容器的布局以保持页面对称。
- [x] Task 3: 改造主体渲染逻辑。将原先固定的画布和侧边栏区域用动态 CSS（`flex` 和 `hidden`）包裹起来，确保在非 `'node'` 状态下仅隐藏而不卸载；并为 `'basic'` 和 `'form'` 添加对应的占位 UI。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]