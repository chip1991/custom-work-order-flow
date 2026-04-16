import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Project } from "../../api";
import { listProjects } from "../../api";
import { useAuth } from "../../auth";
import { Card, EmptyState, ErrorBox, Field, PageHeader, Select, TextInput } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; projects: Project[] };

export function ProjectsListPage() {
  const { apiBase } = useAuth();
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<State>({ status: "loading" });

  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "createdAt_desc";

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    listProjects(apiBase)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", projects: res.projects });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const view = useMemo(() => {
    if (state.status !== "ready") return [];
    const filtered = state.projects.filter((p) => {
      if (!q.trim()) return true;
      const hay = `${p.name} ${p.description ?? ""} ${p.id}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      if (sort === "createdAt_asc") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

    return sorted;
  }, [q, sort, state]);

  return (
    <div className="stack">
      <PageHeader
        title="项目"
        actions={
          <Link className="button" to="/projects/new">
            新建项目
          </Link>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      <Card title="筛选" actions={null}>
        <div className="filters">
          <Field label="关键词">
            <TextInput
              value={q}
              onChange={(v) => {
                setParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("q", v);
                  else next.delete("q");
                  return next;
                });
              }}
              placeholder="name / description / id"
            />
          </Field>
          <Field label="排序">
            <Select
              value={sort}
              onChange={(v) => {
                setParams((prev) => {
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
          <EmptyState title="暂无项目" action={<Link className="link" to="/projects/new">创建一个 →</Link>} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>描述</th>
                <th>ID</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {view.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link className="link" to={`/projects/${p.id}`}>
                      {p.name}
                    </Link>
                  </td>
                  <td className="muted">{p.description ?? "-"}</td>
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
