import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPromptTemplate, getPromptTemplate, updatePromptTemplate } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, TextArea, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

export function PromptTemplateFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const isEdit = props.mode === "edit";
  const projectId = params.projectId ?? "";
  const promptTemplateId = params.promptTemplateId ?? "";

  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getPromptTemplate(apiBase, promptTemplateId)
      .then((res) => {
        if (cancelled) return;
        setName(res.promptTemplate.name);
        setTemplate(res.promptTemplate.template);
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
  }, [apiBase, isEdit, promptTemplateId]);

  const title = useMemo(() => (isEdit ? "编辑 Prompt 模板" : "新建 Prompt 模板"), [isEdit]);
  const backTo = isEdit ? `/prompt-templates/${promptTemplateId}` : `/projects/${projectId}/prompt-templates`;

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
                ? updatePromptTemplate(apiBase, promptTemplateId, { name, template })
                : createPromptTemplate(apiBase, projectId, { name, template });
              req
                .then((res) => navigate(`/prompt-templates/${res.promptTemplate.id}`))
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field
                label="模板"
                hint={
                  <span className="muted">
                    支持变量：{"{{input}}"} 或 {"{{input.text}}"} 等
                  </span>
                }
              >
                <TextArea value={template} onChange={setTemplate} rows={10} />
              </Field>
            </div>
            <div className="row">
              <Button type="submit" disabled={submitting || !name.trim() || !template.trim()}>
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
