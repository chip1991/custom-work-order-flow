import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createModel, getModel, updateModel } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

export function ModelFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const isEdit = props.mode === "edit";
  const projectId = params.projectId ?? "";
  const modelId = params.modelId ?? "";

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getModel(apiBase, modelId)
      .then((res) => {
        if (cancelled) return;
        setName(res.model.name);
        setProvider(res.model.provider ?? "");
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
  }, [apiBase, isEdit, modelId]);

  const title = useMemo(() => (isEdit ? "编辑模型" : "新建模型"), [isEdit]);
  const backTo = isEdit ? `/models/${modelId}` : `/projects/${projectId}/models`;

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
              const req = isEdit
                ? updateModel(apiBase, modelId, { name, provider: provider || undefined })
                : createModel(apiBase, projectId, { name, provider: provider || undefined });
              req
                .then((res) => navigate(`/models/${res.model.id}`))
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field label="Provider" hint={<span className="muted">可选，如 OPENAI/LOCAL</span>}>
                <TextInput value={provider} onChange={setProvider} />
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
