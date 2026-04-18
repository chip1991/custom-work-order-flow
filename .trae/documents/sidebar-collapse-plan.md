# 左侧菜单收起/展开功能计划 (Sidebar Collapse/Expand Plan)

## 1. 摘要 (Summary)
用户希望为前端平台的左侧导航菜单（Sidebar）添加“收起”与“展开”功能。此举可以在用户不需要频繁切换菜单时，释放更多的屏幕水平空间给右侧的主工作区（如测评详情、智能体编排画布等），提升核心业务区的沉浸感和操作空间。

## 2. 当前状态分析 (Current State Analysis)
目前系统中的侧边栏实现位于 `frontend/src/components/Layout.tsx`：
- **布局结构**：使用了基于 Tailwind CSS 的 Flexbox 布局（`flex flex-col md:flex-row`）。侧边栏 `<aside>` 作为一个独立的区块，右侧主内容区使用 `flex-1` 自动填充剩余空间。
- **状态控制**：目前只有一个 `isSidebarOpen` 状态，但这个状态**仅仅用于控制移动端**（窄屏）下抽屉式菜单的弹出与收回。
- **宽度硬编码**：在桌面端（宽屏）下，侧边栏的宽度被硬编码固定为 256px (`w-64`)，且始终常驻显示，没有任何折叠机制。
- **内部元素**：包含了顶部 Logo+标题区、中部导航菜单区（基于 `navItems` 数组映射）和底部“退出登录”按钮区。图标默认带有右边距（如 `mr-3`）以隔开文字。

## 3. 拟定修改方案 (Proposed Changes)

### 修改文件：`frontend/src/components/Layout.tsx`

**What & How:**
1. **引入新的状态控制 (State Management)**：
   - 新增一个专门用于控制桌面端侧边栏折叠状态的 State：`const [isCollapsed, setIsCollapsed] = useState(false)`。

2. **侧边栏宽度动态化与动画 (Dynamic Width & Transitions)**：
   - 移除侧边栏 `<aside>` 标签上写死的 `w-64`。
   - 增加宽度过渡动画类名：`transition-all duration-300 ease-in-out`。
   - 动态计算宽度：在移动端保持 `w-64`，在桌面端根据状态切换宽度：`${isCollapsed ? 'md:w-16' : 'md:w-64'}`。

3. **添加折叠/展开触发按钮 (Toggle Button)**：
   - 在侧边栏的顶部区域（Logo 右侧或下边框处），或者在侧边栏最下方，增加一个只在桌面端显示的切换按钮（使用 `lucide-react` 中的 `ChevronLeft` / `ChevronRight` 或 `PanelLeftClose` 图标）。
   - 点击该按钮触发 `setIsCollapsed(!isCollapsed)`。

4. **内部元素的条件渲染 (Conditional Rendering of Content)**：
   - **文本隐藏**：当 `isCollapsed === true` 时，使用条件渲染或 CSS（如 `hidden`、`opacity-0`、`w-0 overflow-hidden`）隐藏顶部的大标题文本、所有菜单项的文字（`item.name`），以及底部的“退出登录”文字。
   - **图标居中对齐**：修改 `navItems` 中定义的图标类名，移除硬编码的右边距（`mr-3`）。在渲染菜单项时，动态控制布局：展开时左对齐并保留边距，折叠时移除边距并让图标在 16 单位宽度（`w-16`）的容器中绝对居中对齐（如 `justify-center`）。
   - **提示增强 (Tooltip)**：为折叠状态下的图标按钮添加原生的 HTML `title={item.name}` 属性，以便用户鼠标悬停时能知道该图标代表什么菜单。

## 4. 假设与决策 (Assumptions & Decisions)
- **移动端逻辑保持不变**：本次修改仅针对桌面端（宽屏）的“折叠为极窄侧边栏”形态。移动端的“汉堡包按钮 -> 弹出全宽抽屉”的逻辑和交互体验完全保持现状，不作干预。
- **过渡动画选择**：为了保证视觉体验的平滑，宽度的切换和文本的显隐将使用 CSS `transition` 进行补间动画，避免突兀的闪烁。
- **存储折叠偏好（可选，视情况决定）**：本次计划暂不将 `isCollapsed` 状态持久化到 `localStorage` 中，以保持代码极简。用户刷新页面后将默认恢复展开状态。

## 5. 验证步骤 (Verification Steps)
1. 修改代码后，确保前端编译无报错。
2. 在桌面端浏览器（宽屏）打开应用，确认左侧菜单栏底部或顶部出现了“折叠”按钮。
3. 点击“折叠”按钮，侧边栏宽度应平滑缩小，文字隐藏，仅保留图标且居中对齐，右侧主内容区应平滑拉宽填满空间。
4. 鼠标悬停在折叠后的图标上，应能显示正确的 Tooltip 提示文字。
5. 再次点击“展开”按钮，侧边栏应平滑恢复原状。
6. 将浏览器窗口拉窄模拟移动端，确认原有的汉堡包弹出菜单功能未受影响，依然可以正常全宽滑出和收回。