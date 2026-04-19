import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProject } from "../../api";
import { useAuth } from "../../auth";
import { Card, DangerButton, ErrorBox, InlineCode, KvTable, LinkButton, PageHeader } from "../../components/Ui";
import { formatDateTime } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; project: { id: string; name: string; description: string | null; createdAt: string; updatedAt: string } };

export function ProjectDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const projectId = params.projectId ?? "";
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getProject(apiBase, projectId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", project: res.project });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, projectId]);

  return (
    <div className="stack">
      <PageHeader
        title={state.status === "ready" ? state.project.name : "项目详情"}
        subtitle={state.status === "ready" ? <span className="muted">{state.project.description ?? ""}</span> : null}
        actions={
          <div className="row">
            <LinkButton to={`/projects/${projectId}/edit`}>编辑</LinkButton>
            <DangerButton
              onClick={() => {
                if (!window.confirm("确认删除该项目？这会级联删除其下所有数据。")) return;
                deleteProject(apiBase, projectId)
                  .then(() => navigate("/projects"))
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      <div className="grid2">
        <Card title="基础信息" actions={null}>
          {state.status !== "ready" ? (
            <div className="muted">加载中...</div>
          ) : (
            <KvTable
              rows={[
                { k: "ID", v: <InlineCode>{state.project.id}</InlineCode> },
                { k: "创建时间", v: formatDateTime(state.project.createdAt) },
                { k: "更新时间", v: formatDateTime(state.project.updatedAt) }
              ]}
            />
          )}
        </Card>

        <Card title="实体导航" actions={null}>
          <div className="navGrid">
            <Link className="tile" to={`/projects/${projectId}/models`}>
              模型与版本
            </Link>
            <Link className="tile" to={`/projects/${projectId}/datasets`}>
              数据集与样本
            </Link>
            <Link className="tile" to={`/projects/${projectId}/prompt-templates`}>
              Prompt 模板
            </Link>
            <Link className="tile" to={`/projects/${projectId}/metrics`}>
              指标
            </Link>
            <Link className="tile" to={`/projects/${projectId}/plans`}>
              评测计划
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
