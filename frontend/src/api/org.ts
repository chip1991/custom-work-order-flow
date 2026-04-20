export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getOrganizations(): Promise<Organization[]> {
  const res = await fetch("/api/org");
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
}

export async function createOrganization(data: { name: string; parentId?: string | null; type?: string; sort?: number }): Promise<Organization> {
  const res = await fetch("/api/org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create organization");
  return res.json();
}

export async function deleteOrganization(id: string): Promise<void> {
  const res = await fetch(`/api/org/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete organization");
  }
}

export async function getRoles(): Promise<Role[]> {
  const res = await fetch("/api/org/roles");
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

export async function createRole(data: { name: string; description?: string }): Promise<Role> {
  const res = await fetch("/api/org/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create role");
  return res.json();
}

export async function deleteRole(id: string): Promise<void> {
  const res = await fetch(`/api/org/roles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete role");
}
