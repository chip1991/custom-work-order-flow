import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { MetricResult, RunCase, RunDetail } from "../../api";
import { getRun } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, EmptyState, ErrorBox, Field, PageHeader, Select, TextInput } from "../../components/Ui";
import { shortId } from "../../lib/format";

function numericValue(r: MetricResult) {
  if (typeof r.score === "number") return r.score;
  if (typeof r.valueFloat === "number") return r.valueFloat;
  return null;
}

function avgMetric(run: RunDetail) {
  const byMetric = new Map<string, { name: string; values: number[] }>();
  for (const c of run.cases) {
    for (const mr of c.metricResults) {
      const v = numericValue(mr);
      if (v === null) continue;
      const cur = byMetric.get(mr.metricId) ?? { name: mr.metric.name, values: [] };
      cur.values.push(v);
      byMetric.set(mr.metricId, cur);
    }
  }
  return new Map(
    [...byMetric.entries()].map(([id, s]) => [id, { name: s.name, avg: s.values.reduce((a, b) => a + b, 0) / s.values.length }])
  );
}

function metricValueForCase(c: RunCase, metricId: string) {
  const mr = c.metricResults.find((m) => m.metricId === metricId);
  return mr ? numericValue(mr) : null;
}

type RunState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; run: RunDetail };

export function ComparePage() {
  const { apiBase } = useAuth();
  const [search, setSearch] = useSearchParams();

  const runA = search.get("runA") ?? "";
  const runB = search.get("runB") ?? "";
  const metricId = search.get("metricId") ?? "";

  const [a, setA] = useState<RunState>({ status: "idle" });
  const [b, setB] = useState<RunState>({ status: "idle" });

  useEffect(() => {
    if (!runA) {
      setA({ status: "idle" });
      return;
    }
    let cancelled = false;
    setA({ status: "loading" });
    getRun(apiBase, runA)
      .then((res) => {
        if (cancelled) return;
        setA({ status: "ready", run: res.run });
      })
      .catch((err) => {
        if (cancelled) return;
        setA({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, runA]);

  useEffect(() => {
    if (!runB) {
      setB({ status: "idle" });
      return;
    }
    let cancelled = false;
    setB({ status: "loading" });
    getRun(apiBase, runB)
      .then((res) => {
        if (cancelled) return;
        setB({ status: "ready", run: res.run });
      })
      .catch((err) => {
        if (cancelled) return;
        setB({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, runB]);

  const metricOptions = useMemo(() => {
    if (a.status !== "ready" || b.status !== "ready") return [{ value: "", label: "请选择" }];
    const set = new Map<string, string>();
    for (const c of [...a.run.cases, ...b.run.cases]) {
      for (const mr of c.metricResults) set.set(mr.metricId, mr.metric.name);
    }
    return [{ value: "", label: "请选择" }, ...[...set.entries()].map(([id, name]) => ({ value: id, label: name }))];
  }, [a, b]);

  const metricDeltas = useMemo(() => {
    if (a.status !== "ready" || b.status !== "ready") return [];
    const avgA = avgMetric(a.run);
    const avgB = avgMetric(b.run);
    const ids = new Set<string>([...avgA.keys(), ...avgB.keys()]);
    const rows = [...ids].map((id) => {
      const a1 = avgA.get(id);
      const b1 = avgB.get(id);
      const delta = (b1?.avg ?? 0) - (a1?.avg ?? 0);
      return { metricId: id, name: b1?.name ?? a1?.name ?? id, a: a1?.avg ?? null, b: b1?.avg ?? null, delta };
    });
    return rows.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  }, [a, b]);

  const caseDiffs = useMemo(() => {
    if (a.status !== "ready" || b.status !== "ready" || !metricId) return [];
    const bySampleA = new Map<string, RunCase>();
    const bySampleB = new Map<string, RunCase>();
    for (const c of a.run.cases) bySampleA.set(c.sampleId, c);
    for (const c of b.run.cases) bySampleB.set(c.sampleId, c);

    const sampleIds = new Set<string>([...bySampleA.keys(), ...bySampleB.keys()]);
    const rows = [...sampleIds].map((sid) => {
      const ca = bySampleA.get(sid) ?? null;
      const cb = bySampleB.get(sid) ?? null;
      const va = ca ? metricValueForCase(ca, metricId) : null;
      const vb = cb ? metricValueForCase(cb, metricId) : null;
      const delta = (vb ?? 0) - (va ?? 0);
      return { sampleId: sid, va, vb, delta, abs: Math.abs(delta) };
    });
    return rows
      .filter((r) => r.va !== null || r.vb !== null)
      .sort((x, y) => y.abs - x.abs)
      .slice(0, 50);
  }, [a, b, metricId]);

  return (
    <div className="stack">
      <PageHeader title="对比" subtitle={<span className="muted">选择两个 runId，对比指标 delta，并列出差异最大的案例。</span>} />

      <Card title="选择运行" actions={null}>
        <div className="filters">
          <Field label="Run A">
            <TextInput
              value={runA}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("runA", v);
                  else next.delete("runA");
                  return next;
                })
              }
              placeholder="runId"
            />
          </Field>
          <Field label="Run B">
            <TextInput
              value={runB}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("runB", v);
                  else next.delete("runB");
                  return next;
                })
              }
              placeholder="runId"
            />
          </Field>
          <Field label="Metric">
            <Select
              value={metricId}
              onChange={(v) =>
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("metricId", v);
                  else next.delete("metricId");
                  return next;
                })
              }
              options={metricOptions}
            />
          </Field>
        </div>
        <div className="row">
          {runA ? (
            <Link className="link" to={`/runs/${runA}`}>
              打开 A: {shortId(runA)} →
            </Link>
          ) : null}
          {runB ? (
            <Link className="link" to={`/runs/${runB}`}>
              打开 B: {shortId(runB)} →
            </Link>
          ) : null}
        </div>
        {a.status === "error" ? <ErrorBox error={a.error} /> : null}
        {b.status === "error" ? <ErrorBox error={b.error} /> : null}
      </Card>

      <Card title="指标 Delta（均值）" actions={null}>
        {a.status !== "ready" || b.status !== "ready" ? (
          <EmptyState title="请输入 runA 与 runB" />
        ) : metricDeltas.length === 0 ? (
          <EmptyState title="暂无可对比的数值指标" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>指标</th>
                <th>A</th>
                <th>B</th>
                <th>Delta(B-A)</th>
              </tr>
            </thead>
            <tbody>
              {metricDeltas.map((m) => (
                <tr key={m.metricId}>
                  <td>{m.name}</td>
                  <td className="muted">{m.a === null ? "-" : Math.round(m.a * 10000) / 10000}</td>
                  <td className="muted">{m.b === null ? "-" : Math.round(m.b * 10000) / 10000}</td>
                  <td className="muted">{Math.round(m.delta * 10000) / 10000}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card
        title="差异最大的案例"
        actions={
          metricId ? (
            <Button
              onClick={() => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("metricId", metricId);
                  return next;
                });
              }}
            >
              刷新
            </Button>
          ) : null
        }
      >
        {!metricId ? (
          <EmptyState title="请选择一个 metric" />
        ) : a.status !== "ready" || b.status !== "ready" ? (
          <EmptyState title="请输入 runA 与 runB" />
        ) : caseDiffs.length === 0 ? (
          <EmptyState title="暂无差异案例" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Sample</th>
                <th>A</th>
                <th>B</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {caseDiffs.map((c) => (
                <tr key={c.sampleId}>
                  <td className="muted">{shortId(c.sampleId)}</td>
                  <td className="muted">{c.va === null ? "-" : Math.round(c.va * 10000) / 10000}</td>
                  <td className="muted">{c.vb === null ? "-" : Math.round(c.vb * 10000) / 10000}</td>
                  <td className="muted">{Math.round(c.delta * 10000) / 10000}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
