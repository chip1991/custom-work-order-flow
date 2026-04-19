# 登录页协议与隐私政策跳转计划

## 摘要
新增一个通用的文档展示页面组件，用于展示“用户服务协议”和“隐私政策”。在登录页点击对应的链接时，将在新标签页打开该页面，并根据路由参数自动定位到相应的文档内容。页面布局将参考腾讯设计（Ardot）的文档页，包含侧边栏导航和主内容区。

## 当前状态分析
- **前端登录页 (`frontend/src/pages/Home.tsx`)**：目前的“用户服务协议”和“隐私政策”链接是写死的 `href="#"`，点击没有实际跳转行为。
- **前端路由 (`frontend/src/App.tsx`)**：尚未配置用于公开展示静态协议文档的路由，且所有未匹配路由目前会重定向到首页或受鉴权保护。

## 拟议变更 (Proposed Changes)

### 1. 新增协议文档数据与组件
- **创建内容文件 (`frontend/src/pages/Document/content.ts`)**：
  - 将获取到的腾讯设计《用户服务协议》和《隐私保护指引》的正文内容整理为结构化数据或常量字符串，方便在页面中渲染。
- **创建统一文档页面 (`frontend/src/pages/Document/index.tsx`)**：
  - **布局**：采用左右分栏布局。左侧为导航侧边栏（显示“用户服务协议”和“隐私保护指引”），右侧为宽幅的正文阅读区域。
  - **逻辑**：使用 `react-router-dom` 的 `useParams` 获取 URL 中的 `:type` 参数（`policy` 或 `privacy`）。根据参数决定右侧展示的具体内容，并高亮左侧对应的导航项。
  - **样式**：使用 Tailwind CSS 基础类（如 `max-w-4xl`, `leading-relaxed`, `text-gray-800`, `text-2xl font-bold` 等）进行排版，保证长文本的阅读体验。

### 2. 更新前端路由配置
- **修改 `frontend/src/App.tsx`**：
  - 在顶级路由区域（不受 `Layout` 和 Token 鉴权限制的区域，因为用户在登录前就需要阅读）新增文档路由：
    ```tsx
    <Route path="/docs/:type" element={<Document />} />
    ```

### 3. 修改登录页跳转链接
- **修改 `frontend/src/pages/Home.tsx`**：
  - 引入 `react-router-dom` 的 `Link` 组件。
  - 将“用户服务协议”的 `<a>` 标签替换为：
    ```tsx
    <Link to="/docs/policy" target="_blank" rel="noopener noreferrer" className="text-[#51b13e] hover:underline" onClick={e => e.stopPropagation()}>用户服务协议</Link>
    ```
  - 将“隐私政策”的 `<a>` 标签替换为：
    ```tsx
    <Link to="/docs/privacy" target="_blank" rel="noopener noreferrer" className="text-[#51b13e] hover:underline" onClick={e => e.stopPropagation()}>隐私政策</Link>
    ```

## 假设与决策 (Assumptions & Decisions)
- **同一个页面的理解**：使用一个 React 页面组件 (`Document/index.tsx`) 配合动态路由参数来实现。这样两个链接实际上打开的是同一个底层页面，只是初始化展示的内容不同，且用户可以在页面内通过左侧边栏自由切换，符合参考网站的常见交互模式。
- **样式处理**：由于当前项目没有安装 `@tailwindcss/typography` 插件，为了保持轻量，直接在组件内通过编写基础的 Tailwind CSS 样式来美化文本段落和标题。
- **内容真实性**：直接采用此前查阅到的腾讯设计协议真实文本进行填充，拒绝假数据。

## 验证步骤 (Verification)
1. 启动前端开发服务器。
2. 访问 `/login` 页面，点击“用户服务协议”，验证是否在浏览器新标签页中打开 `/docs/policy`，并且页面左侧“用户服务协议”高亮，右侧展示正确的协议正文。
3. 返回登录页，点击“隐私政策”，验证是否在新标签页打开 `/docs/privacy` 并且展示隐私政策内容。
4. 在文档页面内点击左侧导航，验证是否能无缝切换这两份文档。