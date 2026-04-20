import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Users, Building, Shield } from "lucide-react";
import { getOrganizations, createOrganization, deleteOrganization, getRoles, createRole, deleteRole, Organization, Role } from "@/api/org";

export default function Org() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgParent, setNewOrgParent] = useState("");
  const [newOrgType, setNewOrgType] = useState("department");

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgData, roleData] = await Promise.all([getOrganizations(), getRoles()]);
      setOrgs(orgData);
      setRoles(roleData);
    } catch (error) {
      console.error("Failed to load org/roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrg = async () => {
    if (!newOrgName) return;
    try {
      await createOrganization({
        name: newOrgName,
        parentId: newOrgParent || null,
        type: newOrgType,
      });
      setShowOrgModal(false);
      setNewOrgName("");
      setNewOrgParent("");
      setNewOrgType("department");
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to create organization");
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("确定删除该组织节点？")) return;
    try {
      await deleteOrganization(id);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to delete organization");
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return;
    try {
      await createRole({ name: newRoleName, description: newRoleDesc });
      setShowRoleModal(false);
      setNewRoleName("");
      setNewRoleDesc("");
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to create role");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("确定删除该角色？")) return;
    try {
      await deleteRole(id);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to delete role");
    }
  };

  // Build tree
  const buildTree = (parentId: string | null) => {
    return orgs.filter(o => o.parentId === parentId).map(node => ({
      ...node,
      children: buildTree(node.id)
    }));
  };
  const orgTree = buildTree(null);

  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="w-full">
        <div 
          className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 border-b border-gray-100 group"
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center">
            <Building className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">{node.name}</span>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {node.type === 'community' ? '小区' : node.type === 'project' ? '项目' : '部门'}
            </span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
            <button
              onClick={() => {
                setNewOrgParent(node.id);
                setShowOrgModal(true);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-900"
            >
              添加子节点
            </button>
            <button
              onClick={() => handleDeleteOrg(node.id)}
              className="text-xs text-red-600 hover:text-red-900"
            >
              删除
            </button>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="w-full">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          组织与权限
        </h1>
        <p className="text-sm text-gray-500 mt-1">管理小区/项目架构、系统角色和人员数据权限。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Org Tree */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900">组织架构树</h2>
            <button
              onClick={() => {
                setNewOrgParent("");
                setShowOrgModal(true);
              }}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增根节点
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {orgTree.length > 0 ? (
              <div className="w-full pb-4">
                {renderTree(orgTree)}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                暂无组织节点，请新增。
              </div>
            )}
          </div>
        </div>

        {/* Roles List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900">角色管理</h2>
            <button
              onClick={() => setShowRoleModal(true)}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增角色
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {roles.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {roles.map(r => (
                  <li key={r.id} className="p-4 hover:bg-gray-50 flex items-start justify-between group">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRole(r.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                暂无角色，请新增。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Org Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {newOrgParent ? "新增子节点" : "新增根节点"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如: A区住宅一期 / 客服部"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">组织类型</label>
                <select
                  value={newOrgType}
                  onChange={(e) => setNewOrgType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="community">小区</option>
                  <option value="project">项目</option>
                  <option value="department">部门</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleCreateOrg}
                disabled={!newOrgName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">新增角色</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色名称</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如: 维修工 / 客服主管"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
                <textarea
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
