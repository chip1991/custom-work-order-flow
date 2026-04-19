import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { EvaluationRun } from "../../api";
import { listRuns } from "../../api";
import { useAuth } from "../../auth";
import { Badge, Card, EmptyState, ErrorBox, Field, PageHeader, Select, TextInput } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; runs: EvaluationRun[] };

const statusOptions = ["", "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED"] as const;

export function RunsListPage() {
  const { apiBase } = useAuth();
  const [search, setSearch] = useSearchParams();

  const status = search.get("status") ?? "";
  const planId = search.get("planId") ?? "";
  const q = search.get("q") ?? "";

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    listRuns(apiBase, { status: status || undefined, planId: planId || undefined })
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", runs: res.runs });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, planId, status]);

  const view = useMemo(() => {
    if (state.status !== "ready") return [];
    if (!q.trim()) return state.runs;
    const needle = q.trim().toLowerCase();
    return state.runs.filter((r) => {
      const hay = `${r.id} ${r.planId} ${r.status} ${r.plan?.name ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [q, state]);

  return (
    <div className="stack">
      <PageHeader title="评测运行" />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      <Card title="筛选" actions={null}>
        <div className="filters">
          <Field label="状态">
            <Select
              value={status}
              onChange={(v) => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("status", v);
                  else next.delete("status");
                  return next;
                });
              }}
              options={statusOptions.map((s) => ({ value: s, label: s || "全部" }))}
            />
          </Field>
          <Field label="planId">
            <TextInput
              value={planId}
              onChange={(v) => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("planId", v);
                  else next.delete("planId");
                  return next;
                });
              }}
              placeholder="可选"
            />
          </Field>
          <Field label="关键词（前端过滤）">
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
              placeholder="runId / planId / plan name"
            />
          </Field>
        </div>
      </Card>

      <Card title={`列表（${view.length}）`} actions={null}>
        {state.status !== "ready" ? (
          <div className="muted">加载中...</div>
        ) : view.length === 0 ? (
          <EmptyState title="暂无运行" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Run</th>
                <th>状态</th>
                <th>计划</th>
                <th>创建时间</th>
                <th>开始</th>
                <th>结束</th>
              </tr>
            </thead>
            <tbody>
              {view.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link className="link" to={`/runs/${r.id}`}>
                      {shortId(r.id)}
                    </Link>
                  </td>
                  <td>
                    <Badge status={r.status} />
                  </td>
                  <td>
                    {r.plan ? (
                      <Link className="link" to={`/plans/${r.plan.id}`}>
                        {r.plan.name}
                      </Link>
                    ) : (
                      <span className="muted">{shortId(r.planId)}</span>
                    )}
                  </td>
                  <td className="muted">{formatDateTime(r.createdAt)}</td>
                  <td className="muted">{formatDateTime(r.startedAt)}</td>
                  <td className="muted">{formatDateTime(r.finishedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
