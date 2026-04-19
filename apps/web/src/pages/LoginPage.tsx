import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth";
import { Button, Card, ErrorBox, Field, Form, TextInput } from "../components/Ui";

export function LoginPage() {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = useMemo(() => params.get("next") ?? "/", [params]);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123456");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  return (
    <div className="centerPage">
      <Card title="登录" actions={null}>
        <Form
          onSubmit={() => {
            setSubmitting(true);
            setError(null);
            login(email, password)
              .then(() => navigate(next, { replace: true }))
              .catch((err) => setError(err))
              .finally(() => setSubmitting(false));
          }}
        >
          <div className="formGrid">
            <Field label="邮箱">
              <TextInput value={email} onChange={setEmail} placeholder="admin@example.com" />
            </Field>
            <Field label="密码">
              <TextInput value={password} onChange={setPassword} type="password" />
            </Field>
          </div>
          <div className="row">
            <Button type="submit" disabled={submitting || !email || !password}>
              {submitting ? "登录中..." : "登录"}
            </Button>
          </div>
          {error ? <ErrorBox error={error} /> : null}
        </Form>
      </Card>
    </div>
  );
}
