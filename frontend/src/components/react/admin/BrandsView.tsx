import React, { useEffect, useState } from "react";
import {
  apiListBrands,
  apiCreateBrand,
  apiUpdateBrand,
  apiToggleBrandPublish,
  apiDeleteBrand,
} from "./api";
import type { AdminBrand } from "./types";

export const BrandsView: React.FC = () => {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [transFilter, setTransFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description_en: "",
    description_ur: "",
    logo_url: "",
    website_url: "",
    sort_order: 0,
    is_published: true,
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await apiListBrands({
        translation_status: transFilter || undefined,
      });
      setBrands(data);
    } catch (err) {
      console.error("Failed to load brands", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [transFilter]);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({
      slug: "",
      name: "",
      description_en: "",
      description_ur: "",
      logo_url: "",
      website_url: "",
      sort_order: brands.length,
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: AdminBrand) => {
    setEditingBrand(b);
    setFormData({
      slug: b.slug,
      name: b.name,
      description_en: b.description_en || "",
      description_ur: b.description_ur || "",
      logo_url: b.logo_url || "",
      website_url: b.website_url || "",
      sort_order: b.sort_order,
      is_published: b.is_published,
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (b: AdminBrand) => {
    try {
      await apiToggleBrandPublish(b.id, !b.is_published);
      loadBrands();
    } catch (err: any) {
      alert("Failed to toggle brand publication: " + err.message);
    }
  };

  const handleDelete = async (b: AdminBrand) => {
    if (!confirm(`Are you sure you want to delete brand "${b.name}"? Products will become unbranded.`)) return;

    try {
      await apiDeleteBrand(b.id);
      loadBrands();
    } catch (err: any) {
      alert("Failed to delete brand: " + err.message);
    }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: Partial<AdminBrand> = {
        ...formData,
        logo_url: formData.logo_url || null,
        website_url: formData.website_url || null,
        description_en: formData.description_en || undefined,
        description_ur: formData.description_ur || undefined,
      };

      if (editingBrand) {
        await apiUpdateBrand(editingBrand.id, payload);
      } else {
        await apiCreateBrand(payload);
      }

      setIsModalOpen(false);
      loadBrands();
    } catch (err: any) {
      alert("Failed to save brand: " + err.message);
    } finally {
      setIsSaving(false);
    }
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

        <button onClick={handleOpenCreate} className="btn-admin btn-admin-primary">
          + Add Brand
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Brand Name</th>
              <th>Slug</th>
              <th>Product Count</th>
              <th>Localization</th>
              <th>Published</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  Loading brands...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  No brands found.
                </td>
              </tr>
            ) : (
              brands.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111111" }}>{b.name}</div>
                    {b.description_en && (
                      <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{b.description_en}</div>
                    )}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{b.slug}</td>
                  <td>
                    <span className="status-pill published">{b.product_count} items</span>
                  </td>
                  <td>
                    {b.translation_status === "complete" ? (
                      <span className="status-pill complete">🟢 Complete</span>
                    ) : (
                      <span className="status-pill missing-ur">🟡 Missing UR</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(b)}
                      className={`status-pill ${b.is_published ? "complete" : "draft"}`}
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      {b.is_published ? "✓ Live" : "Hidden"}
                    </button>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      style={{ marginRight: "6px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="btn-admin btn-admin-danger btn-admin-sm"
                    >
                      Delete
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
              <h3 className="admin-modal-title">
                {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Create Brand"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="bilingual-grid">
                  <div className="form-group">
                    <label className="form-label">Brand Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                        }));
                      }}
                    />
                  </div>

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

                <div className="bilingual-grid">
                  <div className="form-group">
                    <label className="form-label">Logo URL</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="/media/brands/logo.png"
                      value={formData.logo_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com"
                      value={formData.website_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
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
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingBrand ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
