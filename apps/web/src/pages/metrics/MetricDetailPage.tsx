import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteMetric, getMetric } from "../../api";
import { useAuth } from "../../auth";
import { Card, DangerButton, ErrorBox, InlineCode, KvTable, LinkButton, PageHeader } from "../../components/Ui";
import { formatDateTime } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; metric: { id: string; name: string; kind: string; config: unknown; createdAt: string; updatedAt: string; projectId: string } };

export function MetricDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const metricId = params.metricId ?? "";
  const navigate = useNavigate();

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getMetric(apiBase, metricId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", metric: res.metric });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, metricId]);

  const metric = state.status === "ready" ? state.metric : null;
  const configText = useMemo(() => (metric?.config ? JSON.stringify(metric.config, null, 2) : ""), [metric]);

  return (
    <div className="stack">
      <PageHeader
        title={metric ? metric.name : "指标"}
        subtitle={metric ? <span className="muted">{metric.kind}</span> : null}
        actions={
          <div className="row">
            {metric ? <LinkButton to={`/projects/${metric.projectId}/metrics`}>返回列表</LinkButton> : null}
            <LinkButton to={`/metrics/${metricId}/edit`}>编辑</LinkButton>
            <DangerButton
              onClick={() => {
                if (!metric) return;
                if (!window.confirm("确认删除该指标？")) return;
                deleteMetric(apiBase, metricId)
                  .then(() => navigate(`/projects/${metric.projectId}/metrics`))
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {metric ? (
        <div className="grid2">
          <Card title="基础信息" actions={null}>
            <KvTable
              rows={[
                { k: "ID", v: <InlineCode>{metric.id}</InlineCode> },
                { k: "Project", v: <span className="muted">{metric.projectId}</span> },
                { k: "创建时间", v: formatDateTime(metric.createdAt) },
                { k: "更新时间", v: formatDateTime(metric.updatedAt) }
              ]}
            />
          </Card>

          <Card title="Config" actions={null}>
            {configText ? <pre className="pre">{configText}</pre> : <div className="muted">空</div>}
          </Card>
        </div>
      ) : (
        <Card title="加载中" actions={null}>
          <div className="muted">加载中...</div>
        </Card>
      )}

      <Card title="返回" actions={null}>
        <Link className="link" to="/projects">
          回到项目列表 →
        </Link>
      </Card>
    </div>
  );
}
