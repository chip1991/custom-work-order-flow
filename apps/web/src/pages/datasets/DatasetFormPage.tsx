import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createDataset, getDataset, updateDataset } from "../../api";
import { useAuth } from "../../auth";
import { Button, Card, ErrorBox, Field, Form, PageHeader, TextArea, TextInput } from "../../components/Ui";

type Mode = "create" | "edit";

export function DatasetFormPage(props: { mode: Mode }) {
  const { apiBase } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const isEdit = props.mode === "edit";
  const projectId = params.projectId ?? "";
  const datasetId = params.datasetId ?? "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getDataset(apiBase, datasetId)
      .then((res) => {
        if (cancelled) return;
        setName(res.dataset.name);
        setDescription(res.dataset.description ?? "");
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
  }, [apiBase, datasetId, isEdit]);

  const title = useMemo(() => (isEdit ? "编辑数据集" : "新建数据集"), [isEdit]);
  const backTo = isEdit ? `/datasets/${datasetId}` : `/projects/${projectId}/datasets`;

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
                ? updateDataset(apiBase, datasetId, { name, description: description || null })
                : createDataset(apiBase, projectId, { name, description: description || null });
              req
                .then((res) => navigate(`/datasets/${res.dataset.id}`))
                .catch((err) => setError(err))
                .finally(() => setSubmitting(false));
            }}
          >
            <div className="formGrid">
              <Field label="名称">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field label="描述">
                <TextArea value={description} onChange={setDescription} rows={4} />
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
