import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { EvaluationPlan, EvaluationRun } from "../../api";
import { deleteEvaluationPlan, getEvaluationPlan, listRuns, triggerRun } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, DangerButton, EmptyState, ErrorBox, InlineCode, KvTable, LinkButton, PageHeader } from "../../components/Ui";
import { formatDateTime, shortId } from "../../lib/format";

type PlanState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; plan: EvaluationPlan };

type RunsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; runs: EvaluationRun[] };

export function PlanDetailPage() {
  const { apiBase } = useAuth();
  const params = useParams();
  const planId = params.planId ?? "";
  const navigate = useNavigate();

  const [planState, setPlanState] = useState<PlanState>({ status: "loading" });
  const [runsState, setRunsState] = useState<RunsState>({ status: "idle" });
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPlanState({ status: "loading" });
    getEvaluationPlan(apiBase, planId)
      .then((res) => {
        if (cancelled) return;
        setPlanState({ status: "ready", plan: res.plan });
      })
      .catch((err) => {
        if (cancelled) return;
        setPlanState({ status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, planId]);

  const reloadRuns = useMemo(() => {
    return () => {
      setRunsState({ status: "loading" });
      listRuns(apiBase, { planId })
        .then((res) => setRunsState({ status: "ready", runs: res.runs }))
        .catch((err) => setRunsState({ status: "error", error: err }));
    };
  }, [apiBase, planId]);

  useEffect(() => {
    reloadRuns();
  }, [reloadRuns]);

  const plan = planState.status === "ready" ? planState.plan : null;
  const configText = useMemo(() => (plan?.config ? JSON.stringify(plan.config, null, 2) : ""), [plan]);
  const metricNames = useMemo(() => (plan?.metrics ?? []).map((m) => m.metric.name).join(", "), [plan]);
  const projectId = plan?.projectId ?? "";

  return (
    <div className="stack">
      <PageHeader
        title={plan ? plan.name : "评测计划"}
        subtitle={plan ? <span className="muted">{plan.sampleMode === "RANDOM_N" ? `RANDOM_N(${plan.sampleCount ?? "-"})` : "ALL"}</span> : null}
        actions={
          <div className="row">
            {projectId ? <LinkButton to={`/projects/${projectId}/plans`}>返回列表</LinkButton> : null}
            <LinkButton to={`/plans/${planId}/edit`}>编辑</LinkButton>
            <DangerButton
              onClick={() => {
                if (!window.confirm("确认删除该计划？")) return;
                deleteEvaluationPlan(apiBase, planId)
                  .then(() => navigate(`/projects/${projectId}/plans`))
                  .catch(() => undefined);
              }}
            >
              删除
            </DangerButton>
          </div>
        }
      />

      {planState.status === "error" ? <ErrorBox error={planState.error} /> : null}

      {plan ? (
        <div className="grid2">
          <Card title="基础信息" actions={null}>
            <KvTable
              rows={[
                { k: "ID", v: <InlineCode>{plan.id}</InlineCode> },
                { k: "Project", v: <Link className="link" to={`/projects/${plan.projectId}`}>{shortId(plan.projectId)}</Link> },
                { k: "ModelVersion", v: <span className="muted">{shortId(plan.modelVersionId)}</span> },
                { k: "Dataset", v: <Link className="link" to={`/datasets/${plan.datasetId}`}>{shortId(plan.datasetId)}</Link> },
                { k: "PromptTemplate", v: <span className="muted">{shortId(plan.promptTemplateId)}</span> },
                { k: "指标", v: metricNames || "-" },
                { k: "创建时间", v: formatDateTime(plan.createdAt) },
                { k: "更新时间", v: formatDateTime(plan.updatedAt) }
              ]}
            />
          </Card>

          <Card
            title="触发运行"
            actions={
              <Button
                onClick={() => {
                  setTriggering(true);
                  triggerRun(apiBase, planId)
                    .then((res) => navigate(`/runs/${res.run.id}`))
                    .catch(() => undefined)
                    .finally(() => setTriggering(false));
                }}
                disabled={triggering}
              >
                {triggering ? "触发中..." : "触发"}
              </Button>
            }
          >
            <div className="muted">触发后可在运行详情查看指标与案例。</div>
          </Card>
        </div>
      ) : (
        <Card title="加载中" actions={null}>
          <div className="muted">加载中...</div>
        </Card>
      )}

      <Card title="Config" actions={null}>
        {configText ? <pre className="pre">{configText}</pre> : <div className="muted">空</div>}
      </Card>

      <Card
        title="运行"
        actions={
          <Button
            onClick={() => {
              reloadRuns();
            }}
          >
            刷新
          </Button>
        }
      >
        {runsState.status === "error" ? <ErrorBox error={runsState.error} /> : null}
        {runsState.status !== "ready" ? (
          <div className="muted">加载中...</div>
        ) : runsState.runs.length === 0 ? (
          <EmptyState title="暂无运行" description="点击上方触发按钮创建运行。" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Run</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>开始</th>
                <th>结束</th>
              </tr>
            </thead>
            <tbody>
              {runsState.runs.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link className="link" to={`/runs/${r.id}`}>
                      {shortId(r.id)}
                    </Link>
                  </td>
                  <td>{r.status}</td>
                  <td className="muted">{formatDateTime(r.createdAt)}</td>
                  <td className="muted">{formatDateTime(r.startedAt)}</td>
                  <td className="muted">{formatDateTime(r.finishedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
