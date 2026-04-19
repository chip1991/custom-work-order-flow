export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function shortId(id: string) {
  if (!id) return "";
  return id.length <= 8 ? id : `${id.slice(0, 8)}…`;
}
