export type TranslationStatus = "complete" | "missing_ur" | "incomplete";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "catalogue_editor" | "enquiry_handler";
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface DashboardMetrics {
  total_products: number;
  published_products: number;
  total_categories: number;
  total_brands: number;
  total_enquiries: number;
  new_enquiries: number;
  missing_urdu_translations: number;
  recent_enquiries: AdminEnquiry[];
}

export interface AdminCategory {
  id: string;
  slug: string;
  name_en: string;
  name_ur: string;
  description_en?: string;
  description_ur?: string;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_published: boolean;
  product_count: number;
  translation_status: TranslationStatus;
}

export interface AdminBrand {
  id: string;
  slug: string;
  name: string;
  description_en?: string;
  description_ur?: string;
  logo_url?: string | null;
  website_url?: string | null;
  sort_order: number;
  is_published: boolean;
  product_count: number;
  translation_status: TranslationStatus;
}

export interface AdminProductListItem {
  id: string;
  slug: string;
  sku?: string | null;
  name_en: string;
  name_ur: string;
  short_description_en?: string | null;
  short_description_ur?: string | null;
  price?: number | null;
  price_on_request: boolean;
  stock_status: "in_stock" | "out_of_stock" | "made_to_order";
  is_featured: boolean;
  is_best_seller: boolean;
  is_published: boolean;
  translation_status: TranslationStatus;
  brand_name?: string | null;
  brand_slug?: string | null;
  primary_image_url?: string | null;
  primary_image_alt_en?: string | null;
  primary_image_alt_ur?: string | null;
  categories: { id: string; slug: string; name_en: string; name_ur: string }[];
}

export interface ProductImageItem {
  id?: string;
  image_url: string;
  alt_text_en?: string;
  alt_text_ur?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariantItem {
  id?: string;
  sku: string;
  name_en: string;
  name_ur?: string;
  price?: number | null;
  stock_status: "in_stock" | "out_of_stock" | "made_to_order";
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  sku?: string | null;
  name_en: string;
  name_ur: string;
  short_description_en?: string | null;
  short_description_ur?: string | null;
  description_en?: string | null;
  description_ur?: string | null;
  price?: number | null;
  price_on_request: boolean;
  stock_status: "in_stock" | "out_of_stock" | "made_to_order";
  specifications?: Record<string, string>;
  is_published: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  meta_title_en?: string | null;
  meta_title_ur?: string | null;
  meta_description_en?: string | null;
  meta_description_ur?: string | null;
  brand?: { id: string; slug: string; name: string } | null;
  categories: { id: string; slug: string; name_en: string; name_ur: string }[];
  images: ProductImageItem[];
  variants: ProductVariantItem[];
  attribute_values: { attribute_name: string; attribute_slug: string; value_en: string; value_ur?: string }[];
}

export interface AdminEnquiry {
  id: string;
  type: "product" | "general";
  status: "new" | "in_progress" | "resolved" | "spam";
  channel: "whatsapp" | "call" | "form";
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  locale: string;
  product_id?: string | null;
  product_name_en?: string | null;
  product_slug?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: "admin" | "catalogue_editor" | "enquiry_handler";
  invited_by: string;
  expires_at: string;
  is_revoked: boolean;
  accepted_at?: string | null;
  created_at: string;
}

export interface BuildStatus {
  status: "idle" | "building" | "success" | "failed";
  last_built_at?: string | null;
  last_duration_seconds?: number | null;
  message: string;
}
