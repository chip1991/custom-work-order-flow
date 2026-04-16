import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Model, ModelVersion } from "../../api";
import { deleteModel, getModel, listModelVersions } from "../../api";
import { useAuth } from "../../auth";
import { Card, DangerButton, EmptyState, ErrorBox, InlineCode, KvTable, LinkButton, PageHeader } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; model: Model; versions: ModelVersion[] };

export function ModelDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const modelId = params.modelId ?? "";
  const navigate = useNavigate();

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    Promise.all([getModel(apiBase, modelId), listModelVersions(apiBase, modelId)])
      .then(([m, v]) => {
        if (cancelled) return;
        setState({ status: "ready", model: m.model, versions: v.versions });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, modelId]);

  const title = useMemo(() => {
    if (state.status !== "ready") return "模型详情";
    return state.model.name;
  }, [state]);

  return (
    <div className="stack">
      <PageHeader
        title={title}
        subtitle={state.status === "ready" ? <span className="muted">Provider: {state.model.provider ?? "-"}</span> : null}
        actions={
          <div className="row">
            <LinkButton
              to={
                state.status === "ready" ? `/projects/${state.model.projectId}/models` : "/projects"
              }
            >
              返回列表
            </LinkButton>
            <LinkButton to={`/models/${modelId}/edit`}>编辑</LinkButton>
            <DangerButton
              onClick={() => {
                if (!window.confirm("确认删除该模型？")) return;
                deleteModel(apiBase, modelId)
                  .then(() => {
                    if (state.status === "ready") navigate(`/projects/${state.model.projectId}/models`);
                    else navigate("/projects");
                  })
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
            <Link className="button" to={`/models/${modelId}/versions/new`}>
              新建版本
            </Link>
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {state.status === "ready" ? (
        <div className="grid2">
          <Card title="基础信息" actions={null}>
            <KvTable
              rows={[
                { k: "ID", v: <InlineCode>{state.model.id}</InlineCode> },
                { k: "Project", v: <span className="muted">{shortId(state.model.projectId)}</span> },
                { k: "创建时间", v: formatDateTime(state.model.createdAt) },
                { k: "更新时间", v: formatDateTime(state.model.updatedAt) }
              ]}
            />
          </Card>

          <Card title={`版本（${state.versions.length}）`} actions={null}>
            {state.versions.length === 0 ? (
              <EmptyState title="暂无版本" action={<Link className="link" to={`/models/${modelId}/versions/new`}>创建一个 →</Link>} />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>baseUrl</th>
                    <th>ID</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {state.versions.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <Link className="link" to={`/model-versions/${v.id}`}>
                          {v.name}
                        </Link>
                      </td>
                      <td className="muted">{v.baseUrl ?? "-"}</td>
                      <td className="muted">{shortId(v.id)}</td>
                      <td className="muted">{formatDateTime(v.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      ) : (
        <Card title="加载中" actions={null}>
          <div className="muted">加载中...</div>
        </Card>
      )}
    </div>
  );
}
