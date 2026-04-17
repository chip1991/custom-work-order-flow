# 测评中心任务删除功能实施计划

## 1. 摘要
为测评中心增加“删除任务”功能。系统采用前后端分离架构，需要打通后端数据库删除接口、前端 API 请求层，以及前端列表页的 UI 交互（包含二次确认和列表无感刷新）。

## 2. 当前状态分析
- **数据库**：`Prisma` 的 `TaskResult` 表对 `Task` 有级联删除 (`onDelete: Cascade`)，关联表由 Prisma 自动维护。因此删除 `Task` 主记录是安全的，不会留下脏数据。
- **后端**：`backend/routes/tasks.js` 缺少 `DELETE` 接口。
- **前端 API**：`frontend/src/api/tasks.ts` 缺少删除请求的方法。
- **前端 UI**：`frontend/src/pages/Evaluations/List.tsx` 列表页（表格和卡片视图）只有“查看详情”按钮，缺少删除操作入口。

## 3. 改造方案与具体修改文件

### 3.1 后端：新增 DELETE 路由
**文件**：`backend/routes/tasks.js`
- **What**：增加 `router.delete('/:id', ...)` 接口。
- **Why**：提供操作数据库删除指定 `taskId` 记录的 HTTP 入口。
- **How**：
  ```javascript
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.task.delete({ where: { id } });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });
  ```

### 3.2 前端：新增 API 封装
**文件**：`frontend/src/api/tasks.ts`
- **What**：导出一个异步的 `deleteTask` 函数。
- **Why**：为前端 UI 组件提供统一的、类型安全的删除网络请求方法。
- **How**：
  ```typescript
  export const deleteTask = async (id: string): Promise<void> => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  };
  ```

### 3.3 前端：UI 与交互改造
**文件**：`frontend/src/pages/Evaluations/List.tsx`
- **What**：在电脑端表格和移动端卡片的操作区域增加“删除”按钮，并实现点击后的交互逻辑。
- **Why**：让用户能在界面上触发删除操作，并防止误删。
- **How**：
  1. 引入 `Trash2` 图标和 `deleteTask` API。
  2. 新增 `handleDelete(id: string)` 方法：
     - 使用 `window.confirm` 弹出二次确认框："确定要删除此测评任务吗？相关结果也会被一并删除。"
     - 确认后调用 `deleteTask(id)`。
     - 成功后，通过 `setTasks(tasks.filter(t => t.id !== id))` 更新本地状态，实现列表无刷新移除。
  3. 在 JSX 的表格操作列 `<td className="... text-right">` 和卡片操作栏中，追加红色的删除按钮。

## 4. 假设与决策
- **二次确认方式**：采用浏览器原生的 `window.confirm`，简单直接，无需引入复杂的模态框状态管理。
- **状态更新**：删除成功后不重新请求整个列表 API，而是直接修改本地 React state 移除该项，以提供更快的响应体验。
- **级联安全**：依赖 Prisma Schema 中已配置的 `Cascade`，后端只需删除主表 `Task` 即可。

## 5. 验证步骤
1. 修改完代码后，执行构建并重启前后端服务。
2. 进入测评中心列表，点击某条测试任务的“删除”按钮。
3. 验证是否弹出二次确认弹窗；点击“取消”，任务不应被删除。
4. 再次点击“删除”并“确认”，验证任务是否从界面列表中消失。
5. 刷新页面，验证该任务是否已被永久删除（数据库层面已清除）。