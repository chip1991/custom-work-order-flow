import { Link } from "react-router-dom";
import { Card, PageHeader } from "../components/Ui";

export function NotFoundPage() {
  return (
    <div className="stack">
      <PageHeader title="404" subtitle={<span className="muted">页面不存在</span>} />
      <Card title="返回" actions={null}>
        <Link className="link" to="/">
          去仪表盘 →
        </Link>
      </Card>
    </div>
  );
}
