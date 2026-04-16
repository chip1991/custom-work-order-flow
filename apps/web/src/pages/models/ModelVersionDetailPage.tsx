import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { checkModelVersionHealth, deleteModelVersion, getModelVersion } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, DangerButton, ErrorBox, InlineCode, KvTable, LinkButton, PageHeader } from "../../components/Ui";
import { formatDateTime } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; version: { id: string; name: string; baseUrl: string | null; config: unknown; createdAt: string; updatedAt: string; modelId: string } };

export function ModelVersionDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const modelVersionId = params.modelVersionId ?? "";

  const [state, setState] = useState<State>({ status: "loading" });
  const [health, setHealth] = useState<{ status: "idle" } | { status: "loading" } | { status: "ready"; result: unknown } | { status: "error"; error: unknown }>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getModelVersion(apiBase, modelVersionId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", version: res.version });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, modelVersionId]);

  const version = state.status === "ready" ? state.version : null;
  const configText = useMemo(() => (version?.config ? JSON.stringify(version.config, null, 2) : ""), [version]);

  return (
    <div className="stack">
      <PageHeader
        title={version ? `ModelVersion: ${version.name}` : "ModelVersion"}
        actions={
          <div className="row">
            {version ? <LinkButton to={`/models/${version.modelId}`}>返回模型</LinkButton> : null}
            <LinkButton to={`/model-versions/${modelVersionId}/edit`}>编辑</LinkButton>
            <DangerButton
              onClick={() => {
                if (!version) return;
                if (!window.confirm("确认删除该版本？")) return;
                deleteModelVersion(apiBase, modelVersionId)
                  .then(() => {
                    window.location.href = `/models/${version.modelId}`;
                  })
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
            <Button
              onClick={() => {
                setHealth({ status: "loading" });
                checkModelVersionHealth(apiBase, modelVersionId)
                  .then((res) => setHealth({ status: "ready", result: res.result }))
                  .catch((err) => setHealth({ status: "error", error: err }));
              }}
            >
              健康检查
            </Button>
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {version ? (
        <div className="grid2">
          <Card title="基础信息" actions={null}>
            <KvTable
              rows={[
                { k: "ID", v: <InlineCode>{version.id}</InlineCode> },
                { k: "baseUrl", v: <span className="muted">{version.baseUrl ?? "-"}</span> },
                { k: "创建时间", v: formatDateTime(version.createdAt) },
                { k: "更新时间", v: formatDateTime(version.updatedAt) }
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

      <Card title="健康检查结果" actions={null}>
        {health.status === "idle" ? <div className="muted">点击上方健康检查</div> : null}
        {health.status === "loading" ? <div className="muted">检查中...</div> : null}
        {health.status === "error" ? <ErrorBox error={health.error} /> : null}
        {health.status === "ready" ? <pre className="pre">{JSON.stringify(health.result, null, 2)}</pre> : null}
      </Card>

      {version ? (
        <Card title="提示" actions={null}>
          <div className="muted">
            你可以将 baseUrl 设置为 <InlineCode>local://Xenova/gpt2</InlineCode> 以在无外部 key 环境下完成真实推理。
            也可以填 OpenAI 兼容的 baseUrl（如 https://api.openai.com/v1），并在 config 中设置 apiKey/model。
          </div>
        </Card>
      ) : null}

      <Card title="返回" actions={null}>
        <Link className="link" to="/projects">
          回到项目列表 →
        </Link>
      </Card>
    </div>
  );
}
