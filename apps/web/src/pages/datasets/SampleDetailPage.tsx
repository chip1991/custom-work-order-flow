import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Sample } from "../../api";
import { getSample } from "../../api";
import { useAuth } from "../../auth";
import { Card, ErrorBox, InlineCode, KvTable, PageHeader } from "../../components/Ui";
import { formatDateTime } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; sample: Sample };

export function SampleDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const sampleId = params.sampleId ?? "";

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getSample(apiBase, sampleId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", sample: res.sample });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, sampleId]);

  const sample = state.status === "ready" ? state.sample : null;
  const inputText = useMemo(() => (sample ? JSON.stringify(sample.input, null, 2) : ""), [sample]);
  const contextText = useMemo(() => (sample?.context ? JSON.stringify(sample.context, null, 2) : ""), [sample]);
  const metadataText = useMemo(() => (sample?.metadata ? JSON.stringify(sample.metadata, null, 2) : ""), [sample]);

  return (
    <div className="stack">
      <PageHeader
        title="样本详情"
        actions={
          sample ? (
            <Link className="button" to={`/datasets/${sample.datasetId}`}>
              返回数据集
            </Link>
          ) : null
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {sample ? (
        <div className="grid2">
          <Card title="基础信息" actions={null}>
            <KvTable
              rows={[
                { k: "Sample ID", v: <InlineCode>{sample.id}</InlineCode> },
                { k: "Dataset ID", v: <InlineCode>{sample.datasetId}</InlineCode> },
                { k: "创建时间", v: formatDateTime(sample.createdAt) },
                { k: "更新时间", v: formatDateTime(sample.updatedAt) }
              ]}
            />
          </Card>
          <Card title="input" actions={null}>
            <pre className="pre">{inputText}</pre>
          </Card>
        </div>
      ) : (
        <Card title="加载中" actions={null}>
          <div className="muted">加载中...</div>
        </Card>
      )}

      {contextText ? (
        <Card title="context" actions={null}>
          <pre className="pre">{contextText}</pre>
        </Card>
      ) : null}

      {metadataText ? (
        <Card title="metadata" actions={null}>
          <pre className="pre">{metadataText}</pre>
        </Card>
      ) : null}
    </div>
  );
}
