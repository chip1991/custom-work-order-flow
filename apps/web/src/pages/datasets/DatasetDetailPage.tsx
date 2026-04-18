import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Dataset, Sample } from "../../api";
import { deleteDataset, getDataset, importDatasetJsonl, listSamples } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, DangerButton, EmptyState, ErrorBox, Field, InlineCode, KvTable, PageHeader, Select, TextArea, TextInput } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

type DatasetState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; dataset: Dataset };

type SamplesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; samples: Sample[]; limit: number; offset: number };

export function DatasetDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const datasetId = params.datasetId ?? "";
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  const q = search.get("q") ?? "";
  const sort = search.get("sort") ?? "createdAt_desc";
  const limit = Math.min(200, Math.max(1, Number(search.get("limit") ?? 50)));
  const offset = Math.max(0, Number(search.get("offset") ?? 0));

  const [datasetState, setDatasetState] = useState<DatasetState>({ status: "loading" });
  const [samplesState, setSamplesState] = useState<SamplesState>({ status: "idle" });

  const [jsonl, setJsonl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    setDatasetState({ status: "loading" });
    getDataset(apiBase, datasetId)
      .then((res) => {
        if (cancelled) return;
        setDatasetState({ status: "ready", dataset: res.dataset });
      })
      .catch((err) => {
        if (cancelled) return;
        setDatasetState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, datasetId]);

  const reloadSamples = useMemo(() => {
    return () => {
      setSamplesState({ status: "loading" });
      listSamples(apiBase, datasetId, { limit, offset })
        .then((res) => setSamplesState({ status: "ready", samples: res.samples, limit: res.limit, offset: res.offset }))
        .catch((err) => setSamplesState({ status: "error", error: err }));
    };
  }, [apiBase, datasetId, limit, offset]);

  useEffect(() => {
    reloadSamples();
  }, [reloadSamples]);

  const dataset = datasetState.status === "ready" ? datasetState.dataset : null;

  const viewSamples = useMemo(() => {
    if (samplesState.status !== "ready") return [];
    const filtered = samplesState.samples.filter((s) => {
      if (!q.trim()) return true;
      const text = JSON.stringify(s.input ?? "");
      return text.toLowerCase().includes(q.trim().toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "createdAt_asc") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "createdAt_desc") return b.createdAt.localeCompare(a.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

    return sorted;
  }, [q, samplesState, sort]);

  return (
    <div className="stack">
      <PageHeader
        title={dataset ? dataset.name : "数据集详情"}
        subtitle={dataset ? <span className="muted">{dataset.description ?? ""}</span> : null}
        actions={
          <div className="row">
            {dataset ? (
              <Link className="button" to={`/projects/${dataset.projectId}/datasets`}>
                返回列表
              </Link>
            ) : null}
            <Link className="button" to={`/datasets/${datasetId}/edit`}>
              编辑
            </Link>
            <DangerButton
              onClick={() => {
                if (!dataset) return;
                if (!window.confirm("确认删除该数据集？")) return;
                deleteDataset(apiBase, datasetId)
                  .then(() => navigate(`/projects/${dataset.projectId}/datasets`))
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
          </div>
        }
      />

      {datasetState.status === "error" ? <ErrorBox error={datasetState.error} /> : null}

      {dataset ? (
        <Card title="基础信息" actions={null}>
          <KvTable
            rows={[
              { k: "ID", v: <InlineCode>{dataset.id}</InlineCode> },
              { k: "Project", v: <span className="muted">{shortId(dataset.projectId)}</span> },
              { k: "创建时间", v: formatDateTime(dataset.createdAt) },
              { k: "更新时间", v: formatDateTime(dataset.updatedAt) }
            ]}
          />
        </Card>
      ) : null}

      <Card title="Import JSONL" actions={null}>
        <div className="stackSmall">
          <div className="muted">每行一个 JSON；至少包含 input 字段。示例：{"{"}"input":"q1"{"}"}</div>
          <TextArea value={jsonl} onChange={setJsonl} rows={10} placeholder='{"input":"q1"}\n{"input":"q2"}\n' />
          <div className="row">
            <Button
              disabled={importing || !jsonl.trim()}
              onClick={() => {
                setImporting(true);
                setImportError(null);
                importDatasetJsonl(apiBase, datasetId, jsonl)
                  .then(() => {
                    setJsonl("");
                    reloadSamples();
                  })
                  .catch((err) => setImportError(err))
                  .finally(() => setImporting(false));
              }}
            >
              {importing ? "导入中..." : "导入"}
            </Button>
            <Button
              onClick={() => {
                reloadSamples();
              }}
            >
              刷新样本
            </Button>
          </div>
          {importError ? <ErrorBox title="导入失败" error={importError} /> : null}
        </div>
      </Card>

      <Card title="样本筛选" actions={null}>
        <div className="filters">
          <Field label="关键词（input JSON）">
            <TextInput
              value={q}
              onChange={(v) => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  if (v) next.set("q", v);
                  else next.delete("q");
                  next.delete("offset");
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
                { value: "createdAt_asc", label: "创建时间 ↑" }
              ]}
            />
          </Field>
          <Field label="分页大小">
            <Select
              value={String(limit)}
              onChange={(v) => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("limit", v);
                  next.delete("offset");
                  return next;
                });
              }}
              options={["20", "50", "100", "200"].map((n) => ({ value: n, label: n }))}
            />
          </Field>
        </div>
      </Card>

      <Card
        title={`样本（${viewSamples.length}）`}
        actions={
          <div className="row">
            <Button
              disabled={offset <= 0}
              onClick={() => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("offset", String(Math.max(0, offset - limit)));
                  return next;
                });
              }}
            >
              上一页
            </Button>
            <Button
              onClick={() => {
                setSearch((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("offset", String(offset + limit));
                  return next;
                });
              }}
            >
              下一页
            </Button>
          </div>
        }
      >
        {samplesState.status === "error" ? <ErrorBox error={samplesState.error} /> : null}
        {samplesState.status !== "ready" ? (
          <div className="muted">加载中...</div>
        ) : viewSamples.length === 0 ? (
          <EmptyState title="暂无样本" description="先导入 JSONL 或手动新增 sample。" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Sample</th>
                <th>创建时间</th>
                <th>input</th>
              </tr>
            </thead>
            <tbody>
              {viewSamples.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link className="link" to={`/samples/${s.id}`}>
                      {shortId(s.id)}
                    </Link>
                  </td>
                  <td className="muted">{formatDateTime(s.createdAt)}</td>
                  <td className="muted">{JSON.stringify(s.input).slice(0, 120)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
