import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Dataset, EvaluationPlan, Metric, Model, ModelVersion, PromptTemplate } from "../../api";
import { createEvaluationPlan, getEvaluationPlan, listDatasets, listMetrics, listModels, listModelVersions, listPromptTemplates, updateEvaluationPlan } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, Select, TextArea, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

type OptionsState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; models: Model[]; versions: Array<{ version: ModelVersion; label: string }>; datasets: Dataset[]; promptTemplates: PromptTemplate[]; metrics: Metric[] };

function parseJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed) as unknown;
}

export function PlanFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const isEdit = props.mode === "edit";
  const projectIdFromParams = params.projectId ?? "";
  const planId = params.planId ?? "";

  const [projectId, setProjectId] = useState(projectIdFromParams);
  const [plan, setPlan] = useState<EvaluationPlan | null>(null);
  const [options, setOptions] = useState<OptionsState>({ status: "loading" });

  const [name, setName] = useState("");
  const [modelVersionId, setModelVersionId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [promptTemplateId, setPromptTemplateId] = useState("");
  const [sampleMode, setSampleMode] = useState<"ALL" | "RANDOM_N">("ALL");
  const [sampleCount, setSampleCount] = useState("100");
  const [metricIds, setMetricIds] = useState<string[]>([]);
  const [configText, setConfigText] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getEvaluationPlan(apiBase, planId)
      .then((res) => {
        if (cancelled) return;
        setPlan(res.plan);
        setProjectId(res.plan.projectId);
        setName(res.plan.name);
        setModelVersionId(res.plan.modelVersionId);
        setDatasetId(res.plan.datasetId);
        setPromptTemplateId(res.plan.promptTemplateId);
        setSampleMode(res.plan.sampleMode);
        setSampleCount(res.plan.sampleCount ? String(res.plan.sampleCount) : "");
        setMetricIds((res.plan.metrics ?? []).map((m) => m.metricId));
        setConfigText(res.plan.config ? JSON.stringify(res.plan.config, null, 2) : "");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, isEdit, planId]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setOptions({ status: "loading" });

    Promise.all([listModels(apiBase, projectId), listDatasets(apiBase, projectId), listPromptTemplates(apiBase, projectId), listMetrics(apiBase, projectId)])
      .then(async ([modelsRes, datasetsRes, promptTemplatesRes, metricsRes]) => {
        const models = modelsRes.models;
        const versionsByModel = await Promise.all(models.map((m) => listModelVersions(apiBase, m.id).then((v) => ({ model: m, versions: v.versions }))));
        const versions = versionsByModel.flatMap((p) => p.versions.map((v) => ({ version: v, label: `${p.model.name} / ${v.name}` })));
        if (cancelled) return;
        setOptions({ status: "ready", models, versions, datasets: datasetsRes.datasets, promptTemplates: promptTemplatesRes.promptTemplates, metrics: metricsRes.metrics });
      })
      .catch((err) => {
        if (cancelled) return;
        setOptions({ status: "error", error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, projectId]);

  const title = useMemo(() => (isEdit ? "编辑评测计划" : "新建评测计划"), [isEdit]);
  const backTo = isEdit ? `/plans/${planId}` : `/projects/${projectId}/plans`;

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!isEdit && (!modelVersionId || !datasetId || !promptTemplateId)) return false;
    if (sampleMode === "RANDOM_N") {
      const n = Number(sampleCount);
      if (!Number.isInteger(n) || n <= 0) return false;
    }
    return true;
  }, [datasetId, isEdit, modelVersionId, name, promptTemplateId, sampleCount, sampleMode]);

  return (
    <div className="stack">
      <PageHeader
        title={title}
        actions={
          <Link className="button" to={backTo}>
            返回
          </Link>
        }
      />

      {error ? <ErrorBox error={error} /> : null}
      {options.status === "error" ? <ErrorBox error={options.error} /> : null}

      <Card title="表单" actions={null}>
        {loading || options.status === "loading" ? (
          <div className="muted">加载中...</div>
        ) : (
          <Form
            onSubmit={() => {
              setSubmitting(true);
              setError(null);
              let config: unknown | undefined;
              try {
                config = parseJson(configText);
              } catch (err) {
                setSubmitting(false);
                setError(err);
                return;
              }
              const payload = { name, sampleMode, ...(sampleMode === "RANDOM_N" ? { sampleCount: Number(sampleCount) } : {}), ...(config !== undefined ? { config } : {}), metricIds };
              const req = isEdit ? updateEvaluationPlan(apiBase, planId, payload) : createEvaluationPlan(apiBase, projectId, { ...payload, modelVersionId, datasetId, promptTemplateId });
              req
                .then((res) => navigate(`/plans/${res.plan.id}`))
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} />
              </Field>

              <Field label="ModelVersion" hint={isEdit ? <span className="muted">编辑模式下不可修改</span> : null}>
                {isEdit ? (
                  <div className="muted">{modelVersionId}</div>
                ) : options.status === "ready" ? (
                  <Select value={modelVersionId} onChange={setModelVersionId} options={[{ value: "", label: "请选择" }, ...options.versions.map((v) => ({ value: v.version.id, label: v.label }))]} />
                ) : null}
              </Field>

              <Field label="Dataset" hint={isEdit ? <span className="muted">编辑模式下不可修改</span> : null}>
                {isEdit ? (
                  <div className="muted">{datasetId}</div>
                ) : options.status === "ready" ? (
                  <Select value={datasetId} onChange={setDatasetId} options={[{ value: "", label: "请选择" }, ...options.datasets.map((d) => ({ value: d.id, label: d.name }))]} />
                ) : null}
              </Field>

              <Field label="PromptTemplate" hint={isEdit ? <span className="muted">编辑模式下不可修改</span> : null}>
                {isEdit ? (
                  <div className="muted">{promptTemplateId}</div>
                ) : options.status === "ready" ? (
                  <Select value={promptTemplateId} onChange={setPromptTemplateId} options={[{ value: "", label: "请选择" }, ...options.promptTemplates.map((p) => ({ value: p.id, label: p.name }))]} />
                ) : null}
              </Field>

              <Field label="采样模式">
                <Select value={sampleMode} onChange={(v) => setSampleMode(v === "RANDOM_N" ? "RANDOM_N" : "ALL")} options={[{ value: "ALL", label: "ALL" }, { value: "RANDOM_N", label: "RANDOM_N" }]} />
              </Field>

              {sampleMode === "RANDOM_N" ? (
                <Field label="样本数量">
                  <TextInput value={sampleCount} onChange={setSampleCount} placeholder="例如：100" />
                </Field>
              ) : null}

              <Field label="指标">
                {options.status === "ready" ? (
                  <div className="checkboxGrid">
                    {options.metrics.map((m) => (
                      <label key={m.id} className="checkboxItem">
                        <input
                          type="checkbox"
                          checked={metricIds.includes(m.id)}
                          onChange={(e) => {
                            setMetricIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(m.id);
                              else next.delete(m.id);
                              return [...next];
                            });
                          }}
                        />
                        <span>
                          {m.name} <span className="muted">({m.kind})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </Field>

              <Field label="Config(JSON)" hint={<span className="muted">可选</span>}>
                <TextArea value={configText} onChange={setConfigText} rows={10} />
              </Field>
            </div>
            <div className="row">
              <Button type="submit" disabled={submitting || !canSubmit}>
                {submitting ? "提交中..." : "提交"}
              </Button>
              {!isEdit && options.status === "ready" && options.versions.length === 0 ? <span className="muted">需要先创建模型版本</span> : null}
            </div>
            {plan && isEdit ? <div className="muted">ID: {plan.id}</div> : null}
          </Form>
        )}
      </Card>
    </div>
  );
}
