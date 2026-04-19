# 表单配置器视觉布局对齐 Spec

## Why
目前流程编辑器的“表单配置”页面（`FormBuilder.tsx`）在视觉布局上依然是一个带有固定高度、圆角边框的“卡片式”设计。为了与旁边的“节点配置”页面保持无缝的视觉一致性和专业感，需要对其进行全屏化和面板细节样式的对齐重构，提供一致的背景色、阴影、层级以及标题栏样式。

## What Changes
- **外层容器全屏化**：在 `Editor.tsx` 和 `FormBuilder.tsx` 中移除限制高度的包装层，使表单配置器和节点配置器一样撑满全屏（`h-full w-full flex-1`）。
- **左侧控件库样式对齐**：为左侧栏增加右侧边框（`border-r`）、Z轴层级（`z-10`），并将头部替换为带有图标（如 `LayoutGrid`）、浅灰底色（`bg-gray-50`）的规范标题。
- **右侧属性面板样式对齐**：为右侧栏增加左侧边框（`border-l`）、Z轴层级（`z-10`）和左侧阴影（`shadow-sm`）。将头部替换为带有底部蓝条、蓝字和调节图标（如 `SlidersHorizontal`）的“假 Tab”样式。
- **中间预览画布样式对齐**：移除中间画布多余的“表单预览”标题。设置画布整体背景为浅灰色（`bg-gray-50`），内部表单内容使用白色块悬浮，留出足够的内边距。

## Impact
- Affected specs: UI/UX 一致性（UI/UX Consistency）、页面布局（Layout）。
- Affected code:
  - `src/pages/Processes/Editor.tsx`
  - `src/pages/Processes/components/FormBuilder.tsx`

## MODIFIED Requirements
### Requirement: 统一的专业设计器布局
表单配置器应该在视觉上与节点配置器完全一致，没有跳跃感。

#### Scenario: Success case
- **WHEN** 用户在“节点配置”和“表单配置”两个选项卡之间切换
- **THEN** 左中右三栏的框架结构和分割线保持不动。
- **THEN** 左右两侧的侧边栏高度撑满全屏，且顶部的标题样式高度统一（带图标的背景栏/假 Tab）。
- **THEN** 中间的画布区域底色均为浅灰，没有多余的卡片外边框。