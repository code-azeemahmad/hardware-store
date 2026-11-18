import React, { useEffect, useState } from "react";
import {
  apiListProducts,
  apiGetProduct,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiListCategories,
  apiListBrands,
  apiUploadMedia,
} from "./api";
import type {
  AdminProductListItem,
  AdminProductDetail,
  AdminCategory,
  AdminBrand,
  ProductImageItem,
  ProductVariantItem,
} from "./types";

interface Props {
  initialFilter?: string;
}

export const ProductsView: React.FC<Props> = ({ initialFilter }) => {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [transFilter, setTransFilter] = useState(initialFilter || "");
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal / Editor State
  const [editingProduct, setEditingProduct] = useState<AdminProductDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "descriptions" | "specs" | "images" | "variants" | "seo">("general");

  // Form Fields State
  const [formData, setFormData] = useState<{
    id?: string;
    slug: string;
    sku: string;
    name_en: string;
    name_ur: string;
    short_description_en: string;
    short_description_ur: string;
    description_en: string;
    description_ur: string;
    price: number | null;
    price_on_request: boolean;
    stock_status: "in_stock" | "out_of_stock" | "made_to_order";
    brand_id: string;
    category_ids: string[];
    is_published: boolean;
    is_featured: boolean;
    is_best_seller: boolean;
    meta_title_en: string;
    meta_title_ur: string;
    meta_description_en: string;
    meta_description_ur: string;
    specifications: Record<string, string>;
    images: ProductImageItem[];
    variants: ProductVariantItem[];
  }>({
    slug: "",
    sku: "",
    name_en: "",
    name_ur: "",
    short_description_en: "",
    short_description_ur: "",
    description_en: "",
    description_ur: "",
    price: null,
    price_on_request: true,
    stock_status: "in_stock",
    brand_id: "",
    category_ids: [],
    is_published: true,
    is_featured: false,
    is_best_seller: false,
    meta_title_en: "",
    meta_title_ur: "",
    meta_description_en: "",
    meta_description_ur: "",
    specifications: {},
    images: [],
    variants: [],
  });

  // Specs helper state
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadDependencies = async () => {
    try {
      const [cats, brs] = await Promise.all([apiListCategories(), apiListBrands()]);
      setCategories(cats);
      setBrands(brs);
    } catch (err) {
      console.error("Failed to load categories/brands", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiListProducts({
        page,
        page_size: 15,
        q: search || undefined,
        category_id: categoryFilter || undefined,
        brand_id: brandFilter || undefined,
        translation_status: transFilter || undefined,
        is_published: publishedFilter ? publishedFilter === "true" : undefined,
      });
      setProducts(data.items);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, search, categoryFilter, brandFilter, transFilter, publishedFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      slug: "",
      sku: "",
      name_en: "",
      name_ur: "",
      short_description_en: "",
      short_description_ur: "",
      description_en: "",
      description_ur: "",
      price: null,
      price_on_request: true,
      stock_status: "in_stock",
      brand_id: "",
      category_ids: [],
      is_published: true,
      is_featured: false,
      is_best_seller: false,
      meta_title_en: "",
      meta_title_ur: "",
      meta_description_en: "",
      meta_description_ur: "",
      specifications: {},
      images: [],
      variants: [],
    });
    setActiveTab("general");
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (productListItem: AdminProductListItem) => {
    try {
      const full = await apiGetProduct(productListItem.id);
      setEditingProduct(full);
      setFormData({
        id: full.id,
        slug: full.slug,
        sku: full.sku || "",
        name_en: full.name_en,
        name_ur: full.name_ur || "",
        short_description_en: full.short_description_en || "",
        short_description_ur: full.short_description_ur || "",
        description_en: full.description_en || "",
        description_ur: full.description_ur || "",
        price: full.price ?? null,
        price_on_request: full.price_on_request,
        stock_status: full.stock_status,
        brand_id: full.brand?.id || "",
        category_ids: full.categories.map((c) => c.id),
        is_published: full.is_published,
        is_featured: full.is_featured,
        is_best_seller: full.is_best_seller,
        meta_title_en: full.meta_title_en || "",
        meta_title_ur: full.meta_title_ur || "",
        meta_description_en: full.meta_description_en || "",
        meta_description_ur: full.meta_description_ur || "",
        specifications: full.specifications || {},
        images: full.images || [],
        variants: full.variants || [],
      });
      setActiveTab("general");
      setIsModalOpen(true);
    } catch (err: any) {
      alert("Failed to fetch product details: " + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await apiDeleteProduct(id);
      loadProducts();
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        ...formData,
        brand_id: formData.brand_id || null,
        sku: formData.sku || null,
        short_description_en: formData.short_description_en || null,
        short_description_ur: formData.short_description_ur || null,
        description_en: formData.description_en || null,
        description_ur: formData.description_ur || null,
        meta_title_en: formData.meta_title_en || null,
        meta_title_ur: formData.meta_title_ur || null,
        meta_description_en: formData.meta_description_en || null,
        meta_description_ur: formData.meta_description_ur || null,
      };

      if (editingProduct) {
        await apiUpdateProduct(editingProduct.id, payload);
      } else {
        await apiCreateProduct(payload);
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert("Failed to save product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await apiUploadMedia(file);
      const isFirst = formData.images.length === 0;
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            image_url: res.url,
            alt_text_en: formData.name_en || file.name,
            alt_text_ur: formData.name_ur || "",
            is_primary: isFirst,
            sort_order: prev.images.length,
          },
        ],
      }));
    } catch (err: any) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    }));
  };

  const handleAddSpec = () => {
    if (!specKey.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [specKey.trim()]: specVal.trim(),
      },
    }));
    setSpecKey("");
    setSpecVal("");
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const copy = { ...prev.specifications };
      delete copy[key];
      return { ...prev, specifications: copy };
    });
  };

  return (
    <div>
      {/* Action Bar & Filters */}
      <div className="admin-action-bar">
        <div className="admin-filters">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, SKU, or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Localization Status Filter */}
          <select
            className="admin-select"
            value={transFilter}
            onChange={(e) => {
              setTransFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Localization: All</option>
            <option value="complete">🟢 Complete (EN + UR)</option>
            <option value="missing_ur">🟡 Missing Urdu Translation</option>
            <option value="incomplete">🔴 Incomplete</option>
          </select>

          <select
            className="admin-select"
            value={publishedFilter}
            onChange={(e) => {
              setPublishedFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Status: All</option>
            <option value="true">Published Only</option>
            <option value="false">Drafts Only</option>
          </select>
        </div>

        <button onClick={handleOpenCreate} className="btn-admin btn-admin-primary">
          + Add New Product
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Image</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Brand</th>
              <th>Categories</th>
              <th>Localization</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  Loading catalogue items...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  No products found matching your filter criteria.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.primary_image_url ? (
                      <img
                        src={p.primary_image_url}
                        alt={p.name_en}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "#E5E7EB",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#9CA3AF",
                        }}
                      >
                        No Img
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111111" }}>{p.name_en}</div>
                    <div
                      dir="rtl"
                      style={{
                        fontSize: "0.85rem",
                        color: "#6B7280",
                        fontFamily: "'Noto Nastaliq Urdu', Tahoma, sans-serif",
                      }}
                    >
                      {p.name_ur || <span style={{ color: "#D97706" }}>[اردو ترجمہ درکار ہے]</span>}
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.sku || "—"}</td>
                  <td>{p.brand_name || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {p.categories.map((c) => (
                        <span key={c.id} className="status-pill published" style={{ fontSize: "0.7rem" }}>
                          {c.name_en}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {p.translation_status === "complete" ? (
                      <span className="status-pill complete">🟢 Complete</span>
                    ) : p.translation_status === "missing_ur" ? (
                      <span className="status-pill missing-ur">🟡 Missing UR</span>
                    ) : (
                      <span className="status-pill incomplete">🔴 Incomplete</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${p.is_published ? "published" : "draft"}`}>
                      {p.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      style={{ marginRight: "6px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name_en)}
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

      {/* Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          fontSize: "0.875rem",
          color: "#6B7280",
        }}
      >
        <div>
          Showing {products.length} of {totalCount} total products
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-admin btn-admin-secondary btn-admin-sm"
          >
            ← Previous
          </button>
          <span style={{ padding: "4px 8px", fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-admin btn-admin-secondary btn-admin-sm"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingProduct ? `Edit Product: ${editingProduct.name_en}` : "Create New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                padding: "8px 24px",
                borderBottom: "1px solid #E5E7EB",
                background: "#F9FAFB",
                overflowX: "auto",
              }}
            >
              {[
                { id: "general", label: "General & Identity" },
                { id: "descriptions", label: "Bilingual Descriptions" },
                { id: "specs", label: "Specifications" },
                { id: "images", label: `Images (${formData.images.length})` },
                { id: "variants", label: `Variants (${formData.variants.length})` },
                { id: "seo", label: "SEO Meta Tags" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn-admin btn-admin-sm ${
                    activeTab === tab.id ? "btn-admin-primary" : "btn-admin-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
              <div className="admin-modal-body">
                {/* 1. General Tab */}
                {activeTab === "general" && (
                  <div>
                    <div className="bilingual-grid">
                      <div className="form-group">
                        <label className="form-label">Product Name (English) *</label>
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
                          پراڈکٹ کا نام (اردو) *
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          className="form-input"
                          placeholder="مثلاً: ہائیڈرولک سوفٹ کلوز قبضہ"
                          value={formData.name_ur}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name_ur: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="bilingual-grid">
                      <div className="form-group">
                        <label className="form-label">URL Slug *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={formData.slug}
                          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Internal SKU</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. HNG-HYD-001"
                          value={formData.sku}
                          onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="bilingual-grid">
                      <div className="form-group">
                        <label className="form-label">Brand</label>
                        <select
                          className="form-select"
                          value={formData.brand_id}
                          onChange={(e) => setFormData((prev) => ({ ...prev, brand_id: e.target.value }))}
                        >
                          <option value="">None / Unbranded</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Stock Status</label>
                        <select
                          className="form-select"
                          value={formData.stock_status}
                          onChange={(e) => setFormData((prev) => ({ ...prev, stock_status: e.target.value as any }))}
                        >
                          <option value="in_stock">In Stock (دستیاب ہے)</option>
                          <option value="out_of_stock">Out of Stock (ختم ہے)</option>
                          <option value="made_to_order">Made to Order (آرڈر پر تیار)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assigned Categories</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px", maxHeight: "150px", overflowY: "auto", border: "1px solid #D1D5DB", padding: "10px", borderRadius: "6px" }}>
                        {categories.map((c) => (
                          <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={formData.category_ids.includes(c.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  category_ids: checked
                                    ? [...prev.category_ids, c.id]
                                    : prev.category_ids.filter((id) => id !== c.id),
                                }));
                              }}
                            />
                            {c.name_en}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px", marginTop: "16px", padding: "12px", background: "#F9FAFB", borderRadius: "6px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.price_on_request}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price_on_request: e.target.checked }))}
                        />
                        <strong>Price on Request (مجوزہ پالیسی)</strong>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.is_published}
                          onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                        />
                        Published Live
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                        />
                        Featured Product
                      </label>
                    </div>
                  </div>
                )}

                {/* 2. Descriptions Tab */}
                {activeTab === "descriptions" && (
                  <div>
                    <div className="bilingual-grid">
                      <div className="form-group">
                        <label className="form-label">Short Summary (English)</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={formData.short_description_en}
                          onChange={(e) => setFormData((prev) => ({ ...prev, short_description_en: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ textAlign: "right" }}>
                          مختصر خلاصہ (اردو)
                        </label>
                        <textarea
                          rows={3}
                          dir="rtl"
                          className="form-textarea"
                          value={formData.short_description_ur}
                          onChange={(e) => setFormData((prev) => ({ ...prev, short_description_ur: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="bilingual-grid" style={{ marginTop: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Full Details (English)</label>
                        <textarea
                          rows={6}
                          className="form-textarea"
                          value={formData.description_en}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description_en: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ textAlign: "right" }}>
                          مکمل تفصیلات (اردو)
                        </label>
                        <textarea
                          rows={6}
                          dir="rtl"
                          className="form-textarea"
                          value={formData.description_ur}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description_ur: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Specifications Tab */}
                {activeTab === "specs" && (
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>
                      Add structured technical specifications (e.g. Opening Angle, Material, Cup Depth, Finish).
                    </p>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                      <input
                        type="text"
                        placeholder="Key (e.g. Material)"
                        className="form-input"
                        value={specKey}
                        onChange={(e) => setSpecKey(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Cold-rolled Steel)"
                        className="form-input"
                        value={specVal}
                        onChange={(e) => setSpecVal(e.target.value)}
                      />
                      <button type="button" onClick={handleAddSpec} className="btn-admin btn-admin-secondary">
                        + Add Spec
                      </button>
                    </div>

                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Specification Parameter</th>
                            <th>Value</th>
                            <th style={{ textAlign: "right" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(formData.specifications).length === 0 ? (
                            <tr>
                              <td colSpan={3} style={{ textAlign: "center", color: "#9CA3AF" }}>
                                No specifications added yet.
                              </td>
                            </tr>
                          ) : (
                            Object.entries(formData.specifications).map(([k, v]) => (
                              <tr key={k}>
                                <td style={{ fontWeight: 600 }}>{k}</td>
                                <td>{v}</td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpec(k)}
                                    className="btn-admin btn-admin-danger btn-admin-sm"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Images Tab */}
                {activeTab === "images" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>
                        Upload product photographs stored in persistent storage (/data/media).
                      </p>

                      <label className="btn-admin btn-admin-primary" style={{ cursor: "pointer" }}>
                        {uploadingImage ? "Uploading..." : "+ Upload Image Asset"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          style={{ display: "none" }}
                          disabled={uploadingImage}
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: img.is_primary ? "2px solid #E21B23" : "1px solid #E5E7EB",
                            borderRadius: "8px",
                            padding: "10px",
                            background: "#FFFFFF",
                            position: "relative",
                          }}
                        >
                          <img
                            src={img.image_url}
                            alt={img.alt_text_en || "Product preview"}
                            style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "4px" }}
                          />

                          <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {img.is_primary ? (
                              <span className="status-pill complete" style={{ fontSize: "0.7rem" }}>
                                ★ Primary Image
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="btn-admin btn-admin-secondary btn-admin-sm"
                              >
                                Set Primary
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="btn-admin btn-admin-danger btn-admin-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Variants Tab */}
                {activeTab === "variants" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>
                        Manage product options/variations (e.g. Full Overlay, Half Overlay, Inset).
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            variants: [
                              ...prev.variants,
                              {
                                sku: `${formData.sku || "VAR"}-${prev.variants.length + 1}`,
                                name_en: "New Variant Option",
                                name_ur: "",
                                stock_status: "in_stock",
                              },
                            ],
                          }));
                        }}
                        className="btn-admin btn-admin-secondary"
                      >
                        + Add Variant Option
                      </button>
                    </div>

                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Variant SKU</th>
                            <th>Name (English)</th>
                            <th>نام (اردو)</th>
                            <th>Stock Status</th>
                            <th style={{ textAlign: "right" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.variants.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "#9CA3AF" }}>
                                No variants defined. Single product default.
                              </td>
                            </tr>
                          ) : (
                            formData.variants.map((v, i) => (
                              <tr key={i}>
                                <td>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        variants: prev.variants.map((varItem, idx) =>
                                          idx === i ? { ...varItem, sku: val } : varItem
                                        ),
                                      }));
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={v.name_en}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        variants: prev.variants.map((varItem, idx) =>
                                          idx === i ? { ...varItem, name_en: val } : varItem
                                        ),
                                      }));
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    dir="rtl"
                                    className="form-input"
                                    value={v.name_ur || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        variants: prev.variants.map((varItem, idx) =>
                                          idx === i ? { ...varItem, name_ur: val } : varItem
                                        ),
                                      }));
                                    }}
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={v.stock_status}
                                    onChange={(e) => {
                                      const val = e.target.value as any;
                                      setFormData((prev) => ({
                                        ...prev,
                                        variants: prev.variants.map((varItem, idx) =>
                                          idx === i ? { ...varItem, stock_status: val } : varItem
                                        ),
                                      }));
                                    }}
                                  >
                                    <option value="in_stock">In Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="made_to_order">Made to Order</option>
                                  </select>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        variants: prev.variants.filter((_, idx) => idx !== i),
                                      }));
                                    }}
                                    className="btn-admin btn-admin-danger btn-admin-sm"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. SEO Tab */}
                {activeTab === "seo" && (
                  <div>
                    <div className="bilingual-grid">
                      <div className="form-group">
                        <label className="form-label">Meta Title (English)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.meta_title_en}
                          onChange={(e) => setFormData((prev) => ({ ...prev, meta_title_en: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ textAlign: "right" }}>
                          میٹا ٹائٹل (اردو)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          className="form-input"
                          value={formData.meta_title_ur}
                          onChange={(e) => setFormData((prev) => ({ ...prev, meta_title_ur: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="bilingual-grid" style={{ marginTop: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Meta Description (English)</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={formData.meta_description_en}
                          onChange={(e) => setFormData((prev) => ({ ...prev, meta_description_en: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ textAlign: "right" }}>
                          میٹا تفصیل (اردو)
                        </label>
                        <textarea
                          rows={3}
                          dir="rtl"
                          className="form-textarea"
                          value={formData.meta_description_ur}
                          onChange={(e) => setFormData((prev) => ({ ...prev, meta_description_ur: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                  {isSaving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
