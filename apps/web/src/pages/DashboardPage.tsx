import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { EvaluationRun } from "../api";
import { fetchHealth, listRuns } from "../api";
import { useAuth } from "../auth";
import { Card, EmptyState, ErrorBox, InlineCode, KvTable, PageHeader } from "../components/Ui";
import { formatDateTime, shortId } from "../lib/format";

type DashboardState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; health: unknown; runs: EvaluationRun[] };

export function DashboardPage() {
  const { apiBase } = useAuth();
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    Promise.all([fetchHealth(apiBase), listRuns(apiBase)])
      .then(([health, runsRes]) => {
        if (cancelled) return;
        setState({ status: "ready", health, runs: runsRes.runs.slice(0, 10) });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const healthText = useMemo(() => {
    if (state.status !== "ready") return "";
    return JSON.stringify(state.health, null, 2);
  }, [state]);

  return (
    <div className="stack">
      <PageHeader
        title="仪表盘"
        subtitle={
          <span className="muted">
            API Base: <InlineCode>{apiBase}</InlineCode>
          </span>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {state.status === "ready" ? (
        <div className="grid2">
          <Card title="健康信息" actions={null}>
            <pre className="pre">{healthText}</pre>
          </Card>

          <Card
            title="最近运行"
            actions={
              <Link className="link" to="/runs">
                全部运行 →
              </Link>
            }
          >
            {state.runs.length === 0 ? (
              <EmptyState title="暂无运行" description="先创建评测计划并触发运行。" action={<Link className="link" to="/projects">去项目 →</Link>} />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>状态</th>
                    <th>计划</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {state.runs.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link className="link" to={`/runs/${r.id}`}>
                          {shortId(r.id)}
                        </Link>
                      </td>
                      <td>{r.status}</td>
                      <td>
                        {r.plan ? (
                          <Link className="link" to={`/plans/${r.plan.id}`}>
                            {r.plan.name}
                          </Link>
                        ) : (
                          <span className="muted">{shortId(r.planId)}</span>
                        )}
                      </td>
                      <td>{formatDateTime(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      ) : (
        <Card title="加载中" actions={null}>
          <KvTable rows={[{ k: "状态", v: "loading" }]} />
        </Card>
      )}
    </div>
  );
}
