import type {
  AdminBrand,
  AdminCategory,
  AdminEnquiry,
  AdminInvitation,
  AdminProductDetail,
  AdminProductListItem,
  AdminUser,
  AuthTokens,
  BuildStatus,
  DashboardMetrics,
} from "./types";

const TOKEN_KEY = "naseer_admin_access_token";
const REFRESH_KEY = "naseer_admin_refresh_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(tokens: { access_token: string; refresh_token: string }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  // Handle automatic refresh on 401
  if (res.status === 401) {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const newTokens: AuthTokens = await refreshRes.json();
          saveTokens(newTokens);
          headers.set("Authorization", `Bearer ${newTokens.access_token}`);
          res = await fetch(url, { ...options, headers });
        } else {
          clearTokens();
          window.location.reload();
        }
      } catch {
        clearTokens();
        window.location.reload();
      }
    }
  }

  return res;
}

// Auth API
export async function apiLogin(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Authentication failed");
  }

  const data: AuthTokens = await res.json();
  saveTokens(data);
  return data;
}

export async function apiGetMe(): Promise<AdminUser> {
  const res = await fetchWithAuth("/api/v1/auth/me");
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function apiAcceptInvite(payload: {
  token: string;
  full_name: string;
  password: string;
}): Promise<AdminUser> {
  const res = await fetch("/api/v1/admin/invitations/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Accept invitation failed" }));
    throw new Error(err.detail || "Failed to accept invitation");
  }

  return res.json();
}

// Dashboard & Build
export async function apiGetMetrics(): Promise<DashboardMetrics> {
  const res = await fetchWithAuth("/api/v1/admin/dashboard/metrics");
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function apiTriggerBuild(): Promise<BuildStatus> {
  const res = await fetchWithAuth("/api/v1/admin/build/trigger", { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger rebuild");
  return res.json();
}

export async function apiGetBuildStatus(): Promise<BuildStatus> {
  const res = await fetchWithAuth("/api/v1/admin/build/status");
  if (!res.ok) throw new Error("Failed to get build status");
  return res.json();
}

// Media Upload
export async function apiUploadMedia(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetchWithAuth("/api/v1/admin/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Failed to upload file");
  }

  return res.json();
}

// Categories API
export async function apiListCategories(params: {
  translation_status?: string;
  is_published?: boolean;
} = {}): Promise<AdminCategory[]> {
  const qs = new URLSearchParams();
  if (params.translation_status) qs.set("translation_status", params.translation_status);
  if (params.is_published !== undefined) qs.set("is_published", String(params.is_published));

  const res = await fetchWithAuth(`/api/v1/admin/categories?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function apiCreateCategory(data: Partial<AdminCategory>): Promise<AdminCategory> {
  const res = await fetchWithAuth("/api/v1/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Create category failed" }));
    throw new Error(err.detail || "Failed to create category");
  }
  return res.json();
}

export async function apiUpdateCategory(id: string, data: Partial<AdminCategory>): Promise<AdminCategory> {
  const res = await fetchWithAuth(`/api/v1/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Update category failed" }));
    throw new Error(err.detail || "Failed to update category");
  }
  return res.json();
}

export async function apiToggleCategoryPublish(id: string, is_published: boolean): Promise<AdminCategory> {
  const res = await fetchWithAuth(`/api/v1/admin/categories/${id}/publish?is_published=${is_published}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle category publication");
  return res.json();
}

export async function apiDeleteCategory(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/admin/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(err.detail || "Failed to delete category");
  }
}

// Brands API
export async function apiListBrands(params: {
  translation_status?: string;
  is_published?: boolean;
} = {}): Promise<AdminBrand[]> {
  const qs = new URLSearchParams();
  if (params.translation_status) qs.set("translation_status", params.translation_status);
  if (params.is_published !== undefined) qs.set("is_published", String(params.is_published));

  const res = await fetchWithAuth(`/api/v1/admin/brands?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  return res.json();
}

export async function apiCreateBrand(data: Partial<AdminBrand>): Promise<AdminBrand> {
  const res = await fetchWithAuth("/api/v1/admin/brands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Create brand failed" }));
    throw new Error(err.detail || "Failed to create brand");
  }
  return res.json();
}

export async function apiUpdateBrand(id: string, data: Partial<AdminBrand>): Promise<AdminBrand> {
  const res = await fetchWithAuth(`/api/v1/admin/brands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Update brand failed" }));
    throw new Error(err.detail || "Failed to update brand");
  }
  return res.json();
}

export async function apiToggleBrandPublish(id: string, is_published: boolean): Promise<AdminBrand> {
  const res = await fetchWithAuth(`/api/v1/admin/brands/${id}/publish?is_published=${is_published}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle brand publication");
  return res.json();
}

export async function apiDeleteBrand(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/admin/brands/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(err.detail || "Failed to delete brand");
  }
}

// Products API
export async function apiListProducts(params: {
  page?: number;
  page_size?: number;
  q?: string;
  category_id?: string;
  brand_id?: string;
  is_published?: boolean;
  translation_status?: string;
} = {}): Promise<{ items: AdminProductListItem[]; total: number; page: number; total_pages: number }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.q) qs.set("q", params.q);
  if (params.category_id) qs.set("category_id", params.category_id);
  if (params.brand_id) qs.set("brand_id", params.brand_id);
  if (params.is_published !== undefined) qs.set("is_published", String(params.is_published));
  if (params.translation_status) qs.set("translation_status", params.translation_status);

  const res = await fetchWithAuth(`/api/v1/admin/products?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function apiGetProduct(id: string): Promise<AdminProductDetail> {
  const res = await fetchWithAuth(`/api/v1/admin/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product details");
  return res.json();
}

export async function apiCreateProduct(data: Record<string, any>): Promise<AdminProductDetail> {
  const res = await fetchWithAuth("/api/v1/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Create product failed" }));
    throw new Error(err.detail || "Failed to create product");
  }
  return res.json();
}

export async function apiUpdateProduct(id: string, data: Record<string, any>): Promise<AdminProductDetail> {
  const res = await fetchWithAuth(`/api/v1/admin/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Update product failed" }));
    throw new Error(err.detail || "Failed to update product");
  }
  return res.json();
}

export async function apiDeleteProduct(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Delete product failed" }));
    throw new Error(err.detail || "Failed to delete product");
  }
}

// Enquiries API
export async function apiListEnquiries(params: {
  page?: number;
  status?: string;
  channel?: string;
  q?: string;
} = {}): Promise<{ items: AdminEnquiry[]; total: number; page: number; total_pages: number }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.status) qs.set("status", params.status);
  if (params.channel) qs.set("channel", params.channel);
  if (params.q) qs.set("q", params.q);

  const res = await fetchWithAuth(`/api/v1/admin/enquiries?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch enquiries");
  return res.json();
}

export async function apiUpdateEnquiryStatus(id: string, status: string): Promise<AdminEnquiry> {
  const res = await fetchWithAuth(`/api/v1/admin/enquiries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update enquiry status");
  return res.json();
}

export async function apiDeleteEnquiry(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/admin/enquiries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete enquiry");
}

// Invitations API
export async function apiListInvitations(): Promise<AdminInvitation[]> {
  const res = await fetchWithAuth("/api/v1/admin/invitations");
  if (!res.ok) throw new Error("Failed to fetch invitations");
  return res.json();
}

export async function apiCreateInvitation(email: string, role: string): Promise<{ invitation: AdminInvitation; invitation_token: string; invite_url: string }> {
  const res = await fetchWithAuth("/api/v1/admin/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Create invitation failed" }));
    throw new Error(err.detail || "Failed to create invitation");
  }
  return res.json();
}

export async function apiRevokeInvitation(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/v1/admin/invitations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to revoke invitation");
}
