# Tasks
- [ ] Task 1: 外层容器全屏化。在 `Editor.tsx` 和 `FormBuilder.tsx` 中，去除限制高度的 `h-[600px]`、卡片圆角和边距，使 `FormBuilder` 组件完全撑满剩余的屏幕空间（使用 `h-full w-full flex-1 overflow-hidden`）。
- [ ] Task 2: 改造左侧控件库样式。在 `FormBuilder.tsx` 的左侧栏中，增加 `border-r border-gray-200 z-10`，并将头部标题替换为带有 `LayoutGrid` 图标和浅灰底色 `bg-gray-50` 的设计。
- [ ] Task 3: 改造右侧属性面板样式。在 `FormBuilder.tsx` 的右侧栏中，增加 `border-l border-gray-200 z-10 shadow-sm`，将头部标题替换为带有 `SlidersHorizontal` 图标、蓝字和底边框（`border-b-2 border-indigo-600`）的假 Tab 设计。
- [ ] Task 4: 改造中间预览画布样式。移除中间画布多余的“表单预览”文本标题。设置中间容器背景为 `bg-gray-50`，内部渲染表单内容的块保留为 `bg-white p-6 shadow-sm rounded-lg`。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]