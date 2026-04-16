import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createModelVersion, getModelVersion, updateModelVersion } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, TextArea, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

function parseJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed) as unknown;
}

export function ModelVersionFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const isEdit = props.mode === "edit";
  const modelId = params.modelId ?? "";
  const modelVersionId = params.modelVersionId ?? "";

  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [configText, setConfigText] = useState("{}");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getModelVersion(apiBase, modelVersionId)
      .then((res) => {
        if (cancelled) return;
        setName(res.version.name);
        setBaseUrl(res.version.baseUrl ?? "");
        setConfigText(res.version.config ? JSON.stringify(res.version.config, null, 2) : "{}");
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
  }, [apiBase, isEdit, modelVersionId]);

  const title = useMemo(() => (isEdit ? "编辑模型版本" : "新建模型版本"), [isEdit]);
  const backTo = isEdit ? `/model-versions/${modelVersionId}` : `/models/${modelId}`;

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

              const payload = { name, baseUrl: baseUrl || undefined, ...(config !== undefined ? { config } : {}) };
              const req = isEdit ? updateModelVersion(apiBase, modelVersionId, payload) : createModelVersion(apiBase, modelId, payload);
              req
                .then((res) => navigate(`/model-versions/${res.version.id}`))
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field
                label="Base URL"
                hint={
                  <span className="muted">
                    OpenAI 兼容: https://api.openai.com/v1；无外部 key 演示可用: <code className="code">local://Xenova/gpt2</code>
                  </span>
                }
              >
                <TextInput value={baseUrl} onChange={setBaseUrl} placeholder="local://Xenova/gpt2" />
              </Field>
              <Field
                label="Config(JSON)"
                hint={<span className="muted">OpenAI 模式可填 apiKey/model/timeoutMs/maxRetries/costPer1kTokensUsd/headers</span>}
              >
                <TextArea value={configText} onChange={setConfigText} rows={12} />
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
