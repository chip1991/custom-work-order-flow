import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createMetric, getMetric, updateMetric } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, Select, TextArea, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

function parseJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed) as unknown;
}

export function MetricFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const isEdit = props.mode === "edit";
  const projectId = params.projectId ?? "";
  const metricId = params.metricId ?? "";

  const [name, setName] = useState("");
  const [kind, setKind] = useState("LENGTH");
  const [configText, setConfigText] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getMetric(apiBase, metricId)
      .then((res) => {
        if (cancelled) return;
        setName(res.metric.name);
        setKind(res.metric.kind);
        setConfigText(res.metric.config ? JSON.stringify(res.metric.config, null, 2) : "");
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
  }, [apiBase, isEdit, metricId]);

  const title = useMemo(() => (isEdit ? "编辑指标" : "新建指标"), [isEdit]);
  const backTo = isEdit ? `/metrics/${metricId}` : `/projects/${projectId}/metrics`;

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

      <Card title="表单" actions={null}>
        {loading ? (
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
              const payload = { name, kind, ...(config !== undefined ? { config } : {}) };
              const req = isEdit ? updateMetric(apiBase, metricId, payload) : createMetric(apiBase, projectId, payload);
              req
                .then((res) => navigate(`/metrics/${res.metric.id}`))
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field label="Kind">
                <Select
                  value={kind}
                  onChange={setKind}
                  options={[
                    { value: "EXACT_MATCH", label: "EXACT_MATCH" },
                    { value: "CONTAINS", label: "CONTAINS" },
                    { value: "LENGTH", label: "LENGTH" },
                    { value: "LATENCY_MS", label: "LATENCY_MS" },
                    { value: "COST_ESTIMATE", label: "COST_ESTIMATE" }
                  ]}
                />
              </Field>
              <Field label="Config(JSON)" hint={<span className="muted">可选</span>}>
                <TextArea value={configText} onChange={setConfigText} rows={10} />
              </Field>
            </div>
            <div className="row">
              <Button type="submit" disabled={submitting || !name.trim()}>
                {submitting ? "提交中..." : "提交"}
              </Button>
            </div>
            {error ? <ErrorBox error={error} /> : null}
          </Form>
        )}
      </Card>
    </div>
  );
}
