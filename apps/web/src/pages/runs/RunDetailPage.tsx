import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { MetricResult, RunCase, RunDetail } from "../../api";
import { cancelRun, getRun } from "../../api";
import { useAuth } from "../../auth";
import { Badge, Button, Card, EmptyState, ErrorBox, Field, InlineCode, KvTable, PageHeader, Select, TextInput } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

function numericValue(r: MetricResult) {
  if (typeof r.score === "number") return r.score;
  if (typeof r.valueFloat === "number") return r.valueFloat;
  return null;
}

function summarizeCase(c: RunCase) {
  const scores = c.metricResults
    .map((m) => ({ name: m.metric.name, value: numericValue(m) }))
    .filter((m): m is { name: string; value: number } => typeof m.value === "number");
  return scores;
}

export function RunDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const runId = params.runId ?? "";
  const [search, setSearch] = useSearchParams();

  const statusFilter = search.get("status") ?? "";
  const errorTypeFilter = search.get("errorType") ?? "";
  const metricId = search.get("metricId") ?? "";
  const q = search.get("q") ?? "";
  const sort = search.get("sort") ?? "createdAt_asc";
  const min = search.get("min") ?? "";
  const max = search.get("max") ?? "";

  const [state, setState] = useState<
    { status: "loading" } | { status: "error"; error: unknown } | { status: "ready"; run: RunDetail }
  >({
    status: "loading"
  });
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getRun(apiBase, runId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", run: res.run });
        if (res.run.cases.length > 0) setSelectedCaseId(res.run.cases[0]!.id);
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, runId]);

  const run = state.status === "ready" ? state.run : null;

  const metricOptions = useMemo(() => {
    if (!run) return [{ value: "", label: "全部" }];
    const unique = new Map<string, string>();
    for (const c of run.cases) {
      for (const mr of c.metricResults) unique.set(mr.metricId, mr.metric.name);
    }
    return [{ value: "", label: "全部" }, ...[...unique.entries()].map(([id, name]) => ({ value: id, label: name }))];
  }, [run]);

  const metricsSummary = useMemo(() => {
    if (!run) return [];
    const byMetric = new Map<string, { name: string; values: number[] }>();
    for (const c of run.cases) {
      for (const mr of c.metricResults) {
        const v = numericValue(mr);
        if (v === null) continue;
        const key = mr.metricId;
        const cur = byMetric.get(key) ?? { name: mr.metric.name, values: [] };
        cur.values.push(v);
        byMetric.set(key, cur);
      }
    }
    return [...byMetric.entries()].map(([id, s]) => {
      const avg = s.values.length ? s.values.reduce((a, b) => a + b, 0) / s.values.length : null;
      return { metricId: id, name: s.name, count: s.values.length, avg };
    });
  }, [run]);

  const filteredCases = useMemo(() => {
    if (!run) return [];
    const needle = q.trim().toLowerCase();
    const minV = min.trim() ? Number(min) : null;
    const maxV = max.trim() ? Number(max) : null;

    const rows = run.cases.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (errorTypeFilter && c.errorType !== errorTypeFilter) return false;
      if (needle) {
        const hay = `${c.sampleId} ${c.id} ${c.status} ${c.errorType}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (metricId) {
        const mr = c.metricResults.find((m) => m.metricId === metricId);
        const v = mr ? numericValue(mr) : null;
        if (minV !== null && (v === null || v < minV)) return false;
        if (maxV !== null && (v === null || v > maxV)) return false;
      }
      return true;
    });

    const sorted = [...rows].sort((a, b) => {
      if (sort === "createdAt_desc") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "metric_desc" && metricId) {
        const va = a.metricResults.find((m) => m.metricId === metricId);
        const vb = b.metricResults.find((m) => m.metricId === metricId);
        return (
          (numericValue(vb ?? ({} as MetricResult)) ?? -Infinity) -
          (numericValue(va ?? ({} as MetricResult)) ?? -Infinity)
        );
      }
      if (sort === "metric_asc" && metricId) {
        const va = a.metricResults.find((m) => m.metricId === metricId);
        const vb = b.metricResults.find((m) => m.metricId === metricId);
        return (
          (numericValue(va ?? ({} as MetricResult)) ?? Infinity) -
          (numericValue(vb ?? ({} as MetricResult)) ?? Infinity)
        );
      }
      return a.createdAt.localeCompare(b.createdAt);
    });

    return sorted;
  }, [errorTypeFilter, max, metricId, min, q, run, sort, statusFilter]);

  const selectedCase = useMemo(() => {
    if (!run) return null;
    return run.cases.find((c) => c.id === selectedCaseId) ?? null;
  }, [run, selectedCaseId]);

  const selectedCaseScores = useMemo(() => (selectedCase ? summarizeCase(selectedCase) : []), [selectedCase]);

  return (
    <div className="stack">
      <PageHeader
        title="运行详情"
        subtitle={
          run ? (
            <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {shortId(run.id)} <Badge status={run.status} />
            </span>
          ) : null
        }
        actions={
          <div className="row">
            <Link className="button" to={`/compare?runA=${encodeURIComponent(runId)}`}>
              去对比
            </Link>
            {run && !["SUCCEEDED", "FAILED", "CANCELED"].includes(run.status) ? (
              <Button
                onClick={() => {
                  setCanceling(true);
                  cancelRun(apiBase, runId)
                    .then(() => getRun(apiBase, runId).then((res) => setState({ status: "ready", run: res.run })))
                    .catch(() => undefined)
                    .finally(() => setCanceling(false));
                }}
                disabled={canceling}
              >
                {canceling ? "取消中..." : "取消运行"}
              </Button>
            ) : null}
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {run ? (
        <Card title="基础信息" actions={null}>
          <KvTable
            rows={[
              { k: "Run ID", v: <InlineCode>{run.id}</InlineCode> },
              { k: "状态", v: <Badge status={run.status} /> },
              {
                k: "计划",
                v: (
                  <Link className="link" to={`/plans/${run.planId}`}>
                    {run.plan?.name ?? shortId(run.planId)}
                  </Link>
                )
              },
              { k: "创建时间", v: formatDateTime(run.createdAt) },
              { k: "开始", v: formatDateTime(run.startedAt) },
              { k: "结束", v: formatDateTime(run.finishedAt) },
              { k: "错误", v: run.errorMessage ? <span className="muted">{run.errorMessage}</span> : "-" }
            ]}
          />
        </Card>
      ) : (
        <Card title="加载中" actions={null}>
          <div className="muted">加载中...</div>
        </Card>
      )}

      <Card title="指标概览" actions={null}>
        {!run ? (
          <div className="muted">加载中...</div>
        ) : metricsSummary.length === 0 ? (
          <EmptyState title="暂无指标结果" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>指标</th>
                <th>样本数</th>
                <th>均值</th>
              </tr>
            </thead>
            <tbody>
              {metricsSummary.map((m) => (
                <tr key={m.metricId}>
                  <td>{m.name}</td>
                  <td className="muted">{m.count}</td>
                  <td className="muted">{m.avg === null ? "-" : Math.round(m.avg * 10000) / 10000}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="案例筛选" actions={null}>
        <div className="filters">
          <Field label="状态">
            <Select
              value={statusFilter}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("status", v);
                  else next.delete("status");
                  return next;
                })
              }
              options={[
                { value: "", label: "全部" },
                { value: "QUEUED", label: "QUEUED" },
                { value: "RUNNING", label: "RUNNING" },
                { value: "SUCCEEDED", label: "SUCCEEDED" },
                { value: "FAILED", label: "FAILED" },
                { value: "CANCELED", label: "CANCELED" }
              ]}
            />
          </Field>
          <Field label="errorType">
            <Select
              value={errorTypeFilter}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("errorType", v);
                  else next.delete("errorType");
                  return next;
                })
              }
              options={[
                { value: "", label: "全部" },
                { value: "NONE", label: "NONE" },
                { value: "TIMEOUT", label: "TIMEOUT" },
                { value: "RATE_LIMIT", label: "RATE_LIMIT" },
                { value: "MODEL_ERROR", label: "MODEL_ERROR" },
                { value: "PARSER_ERROR", label: "PARSER_ERROR" },
                { value: "UNKNOWN", label: "UNKNOWN" }
              ]}
            />
          </Field>
          <Field label="指标">
            <Select
              value={metricId}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("metricId", v);
                  else next.delete("metricId");
                  next.delete("min");
                  next.delete("max");
                  return next;
                })
              }
              options={metricOptions}
            />
          </Field>
          <Field label="min">
            <TextInput
              value={min}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("min", v);
                  else next.delete("min");
                  return next;
                })
              }
              placeholder="可选"
            />
          </Field>
          <Field label="max">
            <TextInput
              value={max}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("max", v);
                  else next.delete("max");
                  return next;
                })
              }
              placeholder="可选"
            />
          </Field>
          <Field label="关键词">
            <TextInput
              value={q}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("q", v);
                  else next.delete("q");
                  return next;
                })
              }
              placeholder="sampleId / caseId"
            />
          </Field>
          <Field label="排序">
            <Select
              value={sort}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("sort", v);
                  return next;
                })
              }
              options={[
                { value: "createdAt_asc", label: "创建时间 ↑" },
                { value: "createdAt_desc", label: "创建时间 ↓" },
                { value: "metric_desc", label: "指标值 ↓" },
                { value: "metric_asc", label: "指标值 ↑" }
              ]}
            />
          </Field>
        </div>
      </Card>

      <div className="grid2">
        <Card title={`案例列表（${filteredCases.length}）`} actions={null}>
          {!run ? (
            <div className="muted">加载中...</div>
          ) : filteredCases.length === 0 ? (
            <EmptyState title="暂无匹配案例" />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Sample</th>
                  <th>状态</th>
                  <th className="muted">latencyMs</th>
                  <th className="muted">costUsd</th>
                  <th>指标</th>
                  <th>值</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.slice(0, 200).map((c) => {
                  const mr = metricId ? c.metricResults.find((m) => m.metricId === metricId) : null;
                  const v = mr ? numericValue(mr) : null;
                  const name = mr ? mr.metric.name : metricId ? "-" : "";
                  const isSelected = selectedCaseId === c.id;
                  return (
                    <tr
                      key={c.id}
                      className={isSelected ? "selectedRow" : ""}
                      onClick={() => setSelectedCaseId(c.id)}
                    >
                      <td className="muted">{shortId(c.sampleId)}</td>
                      <td>
                        <Badge status={c.status} />
                      </td>
                      <td className="muted">{c.latencyMs === null ? "-" : c.latencyMs}</td>
                      <td className="muted">{c.costUsd === null ? "-" : Math.round(c.costUsd * 1_000_000) / 1_000_000}</td>
                      <td className="muted">{name}</td>
                      <td className="muted">{v === null ? "-" : Math.round(v * 10000) / 10000}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {filteredCases.length > 200 ? <div className="muted">仅展示前 200 条；请使用筛选缩小范围。</div> : null}
        </Card>

        <Card
          title="案例详情"
          actions={
            selectedCase ? (
              <Link className="button" to={`/samples/${selectedCase.sampleId}`}>
                打开样本
              </Link>
            ) : null
          }
        >
          {!selectedCase ? (
            <div className="muted">请选择一个案例</div>
          ) : (
            <div className="stackSmall">
              <KvTable
                rows={[
                  { k: "Case ID", v: <InlineCode>{selectedCase.id}</InlineCode> },
                  { k: "Sample ID", v: <InlineCode>{selectedCase.sampleId}</InlineCode> },
                  { k: "状态", v: <Badge status={selectedCase.status} /> },
                  { k: "errorType", v: selectedCase.errorType },
                  { k: "开始", v: formatDateTime(selectedCase.startedAt) },
                  { k: "结束", v: formatDateTime(selectedCase.finishedAt) },
                  { k: "latencyMs", v: selectedCase.latencyMs === null ? "-" : selectedCase.latencyMs },
                  { k: "costUsd", v: selectedCase.costUsd === null ? "-" : Math.round(selectedCase.costUsd * 1_000_000) / 1_000_000 }
                ]}
              />
              <Card title="指标" actions={null}>
                {selectedCaseScores.length === 0 ? (
                  <div className="muted">暂无数值型指标</div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>指标</th>
                        <th>值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCaseScores.map((s) => (
                        <tr key={s.name}>
                          <td>{s.name}</td>
                          <td className="muted">{Math.round(s.value * 10000) / 10000}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
              <Card title="Sample.input" actions={null}>
                <pre className="pre">{JSON.stringify(selectedCase.sample.input, null, 2)}</pre>
              </Card>
              {selectedCase.renderedPrompt ? (
                <Card title="Rendered Prompt" actions={null}>
                  <pre className="pre">{selectedCase.renderedPrompt}</pre>
                </Card>
              ) : null}
              {selectedCase.modelOutput ? (
                <Card title="Model Output" actions={null}>
                  <pre className="pre">{selectedCase.modelOutput}</pre>
                </Card>
              ) : null}
              {selectedCase.errorMessage ? (
                <Card title="Error" actions={null}>
                  <pre className="pre">{selectedCase.errorMessage}</pre>
                </Card>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
