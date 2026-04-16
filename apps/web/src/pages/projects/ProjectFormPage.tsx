import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createProject, getProject, updateProject } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, TextArea, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

export function ProjectFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.projectId ?? "";
  const isEdit = props.mode === "edit";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getProject(apiBase, projectId)
      .then((res) => {
        if (cancelled) return;
        setName(res.project.name);
        setDescription(res.project.description ?? "");
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
  }, [apiBase, isEdit, projectId]);

  const title = useMemo(() => (isEdit ? "编辑项目" : "新建项目"), [isEdit]);

  return (
    <div className="stack">
      <PageHeader
        title={title}
        actions={
          isEdit ? (
            <Link className="button" to={`/projects/${projectId}`}>
              返回详情
            </Link>
          ) : (
            <Link className="button" to="/projects">
              返回列表
            </Link>
          )
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
                ? updateProject(apiBase, projectId, { name, description: description || null })
                : createProject(apiBase, { name, description: description || null });
              req
                .then((res) => {
                  navigate(`/projects/${res.project.id}`);
                })
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} placeholder="例如：demo" />
              </Field>
              <Field label="描述">
                <TextArea value={description} onChange={setDescription} rows={4} placeholder="可选" />
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
