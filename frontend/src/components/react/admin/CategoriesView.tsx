import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiX,
  FiSave,
  FiPlusCircle,
  FiFolder,
} from "react-icons/fi";
import {
  apiListCategories,
  apiCreateCategory,
  apiUpdateCategory,
  apiToggleCategoryPublish,
  apiDeleteCategory,
} from "./api";
import type { AdminCategory } from "./types";

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [transFilter, setTransFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    name_en: "",
    name_ur: "",
    description_en: "",
    description_ur: "",
    parent_id: "" as string | null,
    sort_order: 0,
    is_published: true,
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await apiListCategories({
        translation_status: transFilter || undefined,
      });
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [transFilter]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      slug: "",
      name_en: "",
      name_ur: "",
      description_en: "",
      description_ur: "",
      parent_id: null,
      sort_order: categories.length,
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: AdminCategory) => {
    setEditingCategory(c);
    setFormData({
      slug: c.slug,
      name_en: c.name_en,
      name_ur: c.name_ur || "",
      description_en: c.description_en || "",
      description_ur: c.description_ur || "",
      parent_id: c.parent_id || null,
      sort_order: c.sort_order,
      is_published: c.is_published,
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (c: AdminCategory) => {
    try {
      await apiToggleCategoryPublish(c.id, !c.is_published);
      loadCategories();
    } catch (err: any) {
      alert("Failed to toggle publish status: " + err.message);
    }
  };

  const handleDelete = async (c: AdminCategory) => {
    if (c.product_count > 0) {
      alert(`Cannot delete category "${c.name_en}" because it has ${c.product_count} assigned products.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete category "${c.name_en}"?`)) return;

    try {
      await apiDeleteCategory(c.id);
      loadCategories();
    } catch (err: any) {
      alert("Failed to delete category: " + err.message);
    }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: Partial<AdminCategory> = {
        ...formData,
        parent_id: formData.parent_id ? formData.parent_id : null,
      };

      if (editingCategory) {
        await apiUpdateCategory(editingCategory.id, payload);
      } else {
        await apiCreateCategory(payload);
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      alert("Failed to save category: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Find parent name lookup
  const getParentName = (parentId?: string | null) => {
    if (!parentId) return "— (Root Category)";
    const found = categories.find((c) => c.id === parentId);
    return found ? found.name_en : "Unknown";
  };

  return (
    <div>
      <div className="admin-action-bar">
        <div className="admin-filters">
          <select
            className="admin-select"
            value={transFilter}
            onChange={(e) => setTransFilter(e.target.value)}
          >
            <option value="">Localization: All</option>
            <option value="complete">🟢 Complete</option>
            <option value="missing_ur">🟡 Missing Urdu</option>
            <option value="incomplete">🔴 Incomplete</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-admin btn-admin-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FiPlus />
          <span>Add Category</span>
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name (English & Urdu)</th>
              <th>Slug</th>
              <th>Parent Category</th>
              <th>Products</th>
              <th>Localization</th>
              <th>Published</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111111", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiFolder style={{ color: "#E21B23" }} />
                      <span>{c.name_en}</span>
                    </div>
                    <div
                      dir="rtl"
                      style={{
                        fontSize: "0.85rem",
                        color: "#6B7280",
                        fontFamily: "'Noto Nastaliq Urdu', Tahoma, sans-serif",
                      }}
                    >
                      {c.name_ur || <span style={{ color: "#D97706" }}>[اردو نام درج نہیں]</span>}
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{c.slug}</td>
                  <td>{getParentName(c.parent_id)}</td>
                  <td>
                    <span className="status-pill published">{c.product_count} items</span>
                  </td>
                  <td>
                    {c.translation_status === "complete" ? (
                      <span className="status-pill complete" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FiCheck />
                        <span>Complete</span>
                      </span>
                    ) : (
                      <span className="status-pill missing-ur" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FiAlertCircle />
                        <span>Missing UR</span>
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(c)}
                      className={`status-pill ${c.is_published ? "complete" : "draft"}`}
                      style={{ cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {c.is_published ? <FiEye /> : <FiEyeOff />}
                      <span>{c.is_published ? "Live" : "Hidden"}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      style={{ marginRight: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <FiEdit2 />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="btn-admin btn-admin-danger btn-admin-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <FiTrash2 />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "600px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                {editingCategory ? (
                  <>
                    <FiEdit3 style={{ color: "#E21B23" }} />
                    <span>Edit Category: {editingCategory.name_en}</span>
                  </>
                ) : (
                  <>
                    <FiPlusCircle style={{ color: "#E21B23" }} />
                    <span>Create Category</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", color: "#6B7280" }}
              >
                <FiX style={{ fontSize: "1.25rem" }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="bilingual-grid">
                  <div className="form-group">
                    <label className="form-label">Category Name (English) *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name_en}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name_en: val,
                          slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ textAlign: "right" }}>
                      کیٹیگری کا نام (اردو) *
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      className="form-input"
                      value={formData.name_ur}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name_ur: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="bilingual-grid">
                  <div className="form-group">
                    <label className="form-label">Slug *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parent Category</label>
                    <select
                      className="form-select"
                      value={formData.parent_id || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value || null }))}
                    >
                      <option value="">None (Root Category)</option>
                      {categories
                        .filter((c) => !editingCategory || c.id !== editingCategory.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name_en}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="bilingual-grid">
                  <div className="form-group">
                    <label className="form-label">Description (English)</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      value={formData.description_en}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description_en: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ textAlign: "right" }}>
                      تفصیل (اردو)
                    </label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      className="form-textarea"
                      value={formData.description_ur}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description_ur: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                    />
                    Published Live
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-admin btn-admin-secondary"
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-admin btn-admin-primary"
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {isSaving ? (
                    "Saving..."
                  ) : editingCategory ? (
                    <>
                      <FiSave />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      <span>Create Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
