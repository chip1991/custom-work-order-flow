import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { PromptTemplate } from "../../api";
import { listPromptTemplates } from "../../api";
import { useAuth } from "../../auth";
import { Card, EmptyState, ErrorBox, Field, PageHeader, Select, TextInput } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; promptTemplates: PromptTemplate[] };

export function PromptTemplatesListPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const projectId = params.projectId ?? "";
  const [search, setSearch] = useSearchParams();
  const q = search.get("q") ?? "";
  const sort = search.get("sort") ?? "createdAt_desc";

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    listPromptTemplates(apiBase, projectId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", promptTemplates: res.promptTemplates });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, projectId]);

  const view = useMemo(() => {
    if (state.status !== "ready") return [];
    const filtered = state.promptTemplates.filter((p) => {
      if (!q.trim()) return true;
      const hay = `${p.name} ${p.id}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
    return [...filtered].sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      if (sort === "createdAt_asc") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [q, sort, state]);

  return (
    <div className="stack">
      <PageHeader
        title="Prompt 模板"
        subtitle={<span className="muted">Project: {shortId(projectId)}</span>}
        actions={
          <div className="row">
            <Link className="button" to={`/projects/${projectId}`}>
              返回项目
            </Link>
            <Link className="button" to={`/projects/${projectId}/prompt-templates/new`}>
              新建模板
            </Link>
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      <Card title="筛选" actions={null}>
        <div className="filters">
          <Field label="关键词">
            <TextInput
              value={q}
              onChange={(v) => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("q", v);
                  else next.delete("q");
                  return next;
                });
              }}
            />
          </Field>
          <Field label="排序">
            <Select
              value={sort}
              onChange={(v) => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("sort", v);
                  return next;
                });
              }}
              options={[
                { value: "createdAt_desc", label: "创建时间 ↓" },
                { value: "createdAt_asc", label: "创建时间 ↑" },
                { value: "name_asc", label: "名称 A→Z" },
                { value: "name_desc", label: "名称 Z→A" }
              ]}
            />
          </Field>
        </div>
      </Card>

      <Card title={`列表（${view.length}）`} actions={null}>
        {state.status !== "ready" ? (
          <div className="muted">加载中...</div>
        ) : view.length === 0 ? (
          <EmptyState title="暂无模板" action={<Link className="link" to={`/projects/${projectId}/prompt-templates/new`}>创建一个 →</Link>} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>ID</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {view.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link className="link" to={`/prompt-templates/${p.id}`}>
                      {p.name}
                    </Link>
                  </td>
                  <td className="muted">{shortId(p.id)}</td>
                  <td className="muted">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
