import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deletePromptTemplate, getPromptTemplate } from "../../api";
import { useAuth } from "../../auth";
import { Card, DangerButton, ErrorBox, InlineCode, KvTable, LinkButton, PageHeader } from "../../components/Ui";
import { formatDateTime } from "../../lib/format";

type State =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; promptTemplate: { id: string; name: string; template: string; createdAt: string; updatedAt: string; projectId: string } };

export function PromptTemplateDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const promptTemplateId = params.promptTemplateId ?? "";
  const navigate = useNavigate();

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getPromptTemplate(apiBase, promptTemplateId)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "ready", promptTemplate: res.promptTemplate });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, promptTemplateId]);

  const pt = state.status === "ready" ? state.promptTemplate : null;
  const templateText = useMemo(() => (pt ? pt.template : ""), [pt]);

  return (
    <div className="stack">
      <PageHeader
        title={pt ? pt.name : "Prompt 模板"}
        actions={
          <div className="row">
            {pt ? <LinkButton to={`/projects/${pt.projectId}/prompt-templates`}>返回列表</LinkButton> : null}
            <LinkButton to={`/prompt-templates/${promptTemplateId}/edit`}>编辑</LinkButton>
            <DangerButton
              onClick={() => {
                if (!pt) return;
                if (!window.confirm("确认删除该模板？")) return;
                deletePromptTemplate(apiBase, promptTemplateId)
                  .then(() => navigate(`/projects/${pt.projectId}/prompt-templates`))
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
          </div>
        }
      />

      {state.status === "error" ? <ErrorBox error={state.error} /> : null}

      {pt ? (
        <div className="grid2">
          <Card title="基础信息" actions={null}>
            <KvTable
              rows={[
                { k: "ID", v: <InlineCode>{pt.id}</InlineCode> },
                { k: "Project", v: <span className="muted">{pt.projectId}</span> },
                { k: "创建时间", v: formatDateTime(pt.createdAt) },
                { k: "更新时间", v: formatDateTime(pt.updatedAt) }
              ]}
            />
          </Card>
          <Card title="模板" actions={null}>
            <pre className="pre">{templateText}</pre>
          </Card>
        </div>
      ) : (
        <Card title="加载中" actions={null}>
          <div className="muted">加载中...</div>
        </Card>
      )}

      <Card title="提示" actions={null}>
        <div className="muted">
          模板变量来自 sample 的 input/context/metadata。示例：<InlineCode>{"{{input}}"}</InlineCode> 或 <InlineCode>{"{{input.text}}"}</InlineCode>。
        </div>
      </Card>

      <Card title="返回" actions={null}>
        <Link className="link" to="/projects">
          回到项目列表 →
        </Link>
      </Card>
    </div>
  );
}
