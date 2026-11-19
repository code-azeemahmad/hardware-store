/**
 * Naseer Plywood & Hardware - Publishing Integration Client
 * 
 * Fetches published catalogue data from FastAPI at build time for Astro SSG.
 * Falls back gracefully to static fixtures if the API is offline.
 */

import {
  CATEGORIES as FALLBACK_CATEGORIES,
  BRANDS as FALLBACK_BRANDS,
  PRODUCTS as FALLBACK_PRODUCTS,
  type Category,
  type Subcategory,
  type Brand,
  type Product,
} from '../data/catalogue';

export type { Category, Subcategory, Brand, Product };

declare const process: {
  env: Record<string, string | undefined>;
};

// Base candidate URLs for backend API
const CANDIDATE_URLS = [
  process.env.INTERNAL_API_URL,
  process.env.PUBLIC_API_URL,
  'http://hardware-backend:8000/api/v1',
  'http://localhost/api/v1',
  'http://localhost:8000/api/v1',
  'http://127.0.0.1/api/v1',
  'http://127.0.0.1:8000/api/v1',
].filter(Boolean) as string[];

const STRICT_API = process.env.STRICT_API === 'true' || process.env.APP_ENV === 'production';
const ALLOW_FALLBACK = process.env.ALLOW_FIXTURE_FALLBACK === 'true';

let cachedApiBase: string | null = null;
let apiChecked = false;

/**
 * Discovers the working API base URL with a quick health probe.
 */
async function resolveApiBase(): Promise<string | null> {
  if (cachedApiBase) return cachedApiBase;
  if (apiChecked) return null;

  for (const url of CANDIDATE_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        cachedApiBase = url;
        console.log(`[Astro SSG] Connected to live backend at: ${url}`);
        return cachedApiBase;
      }
    } catch {
      // Try next candidate
    }
  }

  apiChecked = true;
  if (STRICT_API && !ALLOW_FALLBACK) {
    throw new Error(
      `[Astro SSG STRICT] Backend API unreachable at candidates: ${CANDIDATE_URLS.join(', ')}. ` +
      `Fixture fallback is disabled in production to protect deployment integrity.`
    );
  }
  console.warn(
    '[Astro SSG] Backend API unreachable. Falling back to cached catalogue fixtures.'
  );
  return null;
}

// In-memory cache for the build duration
let _cachedCategories: Category[] | null = null;
let _cachedBrands: Brand[] | null = null;
let _cachedProducts: Product[] | null = null;

// =============================================================================
// 1. Categories
// =============================================================================

interface ApiCategoryChild {
  slug: string;
  name_en: string;
  name_ur: string;
  description_en: string | null;
  description_ur: string | null;
  is_published: boolean;
  sort_order: number;
}

interface ApiCategoryRoot {
  slug: string;
  name_en: string;
  name_ur: string;
  description_en: string | null;
  description_ur: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  children: ApiCategoryChild[];
}

export async function fetchPublishedCategories(): Promise<Category[]> {
  if (_cachedCategories) return _cachedCategories;

  const apiBase = await resolveApiBase();
  if (!apiBase) {
    if (STRICT_API && !ALLOW_FALLBACK) {
      throw new Error(
        '[Astro SSG STRICT] Backend API unreachable. Fixture fallback is disabled in production.'
      );
    }
    _cachedCategories = FALLBACK_CATEGORIES;
    return _cachedCategories;
  }

  try {
    const res = await fetch(`${apiBase}/categories/tree`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiCategoryRoot[] = await res.json();

    const categories: Category[] = data
      .filter((cat) => cat.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        slug: cat.slug,
        nameEn: cat.name_en,
        nameUr: cat.name_ur,
        descriptionEn:
          cat.description_en ||
          FALLBACK_CATEGORIES.find((c) => c.slug === cat.slug)?.descriptionEn ||
          '',
        descriptionUr:
          cat.description_ur ||
          FALLBACK_CATEGORIES.find((c) => c.slug === cat.slug)?.descriptionUr ||
          '',
        heroImage:
          cat.image_url ||
          FALLBACK_CATEGORIES.find((c) => c.slug === cat.slug)?.heroImage ||
          '/images/shelf.jpg',
        subcategories: cat.children
          .filter((sub) => sub.is_published)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((sub) => ({
            slug: sub.slug,
            nameEn: sub.name_en,
            nameUr: sub.name_ur,
            descriptionEn: sub.description_en || '',
            descriptionUr: sub.description_ur || '',
          })),
      }));

    if (categories.length > 0) {
      _cachedCategories = categories;
      return _cachedCategories;
    }
  } catch (err) {
    if (STRICT_API && !ALLOW_FALLBACK) {
      throw new Error(`[Astro SSG STRICT] Failed to fetch categories: ${err}. Aborting build.`);
    }
    console.warn(`[Astro SSG] Failed to fetch categories: ${err}. Using fallback.`);
  }

  if (STRICT_API && !ALLOW_FALLBACK) {
    throw new Error('[Astro SSG STRICT] No categories found from API. Aborting build.');
  }

  _cachedCategories = FALLBACK_CATEGORIES;
  return _cachedCategories;
}

// =============================================================================
// 2. Brands
// =============================================================================

interface ApiBrandItem {
  slug: string;
  name: string;
  logo_url: string | null;
  description_en: string | null;
  description_ur: string | null;
  website_url: string | null;
  sort_order: number;
  is_published: boolean;
  product_count: number | null;
}

export async function fetchPublishedBrands(): Promise<Brand[]> {
  if (_cachedBrands) return _cachedBrands;

  const apiBase = await resolveApiBase();
  if (!apiBase) {
    if (STRICT_API && !ALLOW_FALLBACK) {
      throw new Error(
        '[Astro SSG STRICT] Backend API unreachable. Fixture fallback is disabled in production.'
      );
    }
    _cachedBrands = FALLBACK_BRANDS;
    return _cachedBrands;
  }

  try {
    const res = await fetch(`${apiBase}/brands`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiBrandItem[] = await res.json();

    const brands: Brand[] = data
      .filter((b) => b.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((b) => {
        const fallback = FALLBACK_BRANDS.find((fb) => fb.slug === b.slug);
        return {
          slug: b.slug,
          name: b.name,
          category: fallback?.category || 'Architectural Hardware',
          country: fallback?.country || 'International',
          descriptionEn: b.description_en || fallback?.descriptionEn || '',
          descriptionUr: b.description_ur || fallback?.descriptionUr || '',
          featuredProductsCount: b.product_count || fallback?.featuredProductsCount || 1,
        };
      });

    if (brands.length > 0) {
      _cachedBrands = brands;
      return _cachedBrands;
    }
  } catch (err) {
    if (STRICT_API && !ALLOW_FALLBACK) {
      throw new Error(`[Astro SSG STRICT] Failed to fetch brands: ${err}. Aborting build.`);
    }
    console.warn(`[Astro SSG] Failed to fetch brands: ${err}. Using fallback.`);
  }

  if (STRICT_API && !ALLOW_FALLBACK) {
    throw new Error('[Astro SSG STRICT] No brands found from API. Aborting build.');
  }

  _cachedBrands = FALLBACK_BRANDS;
  return _cachedBrands;
}

// =============================================================================
// 3. Products
// =============================================================================

interface ApiProductListItem {
  id: string;
  slug: string;
  sku: string;
  name_en: string;
  name_ur: string | null;
  short_description_en: string | null;
  short_description_ur: string | null;
  price: string | null;
  price_on_request: boolean;
  stock_status: string;
  is_featured: boolean;
  is_best_seller: boolean;
  brand_name: string | null;
  brand_slug: string | null;
  primary_image_url: string | null;
  primary_image_alt_en: string | null;
  primary_image_alt_ur: string | null;
  categories: Array<{ id: string; slug: string; name_en: string; name_ur: string }>;
}

interface ApiProductDetail extends ApiProductListItem {
  description_en: string | null;
  description_ur: string | null;
  specifications: Record<string, string> | null;
  meta_title_en: string | null;
  meta_title_ur: string | null;
  meta_description_en: string | null;
  meta_description_ur: string | null;
  is_published: boolean;
  brand: {
    slug: string;
    name: string;
  } | null;
  images: Array<{
    id: string;
    image_url: string;
    alt_text_en: string | null;
    alt_text_ur: string | null;
    sort_order: number;
    is_primary: boolean;
  }>;
  attribute_values: Array<{
    attribute_slug: string;
    attribute_name_en: string;
    attribute_name_ur: string;
    value_en: string;
    value_ur: string;
  }>;
}

function mapApiDetailToProduct(detail: ApiProductDetail): Product {
  const rootSlugs = ['kitchen', 'hardware', 'bathroom', 'plywood'];
  const rootCat =
    detail.categories.find((c) => rootSlugs.includes(c.slug)) ||
    detail.categories[0] || { slug: 'hardware', name_en: 'Hardware', name_ur: 'ہارڈویئر' };

  const subCat =
    detail.categories.find((c) => !rootSlugs.includes(c.slug)) ||
    detail.categories[1] ||
    rootCat;

  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === detail.slug);

  const gallery =
    detail.images && detail.images.length > 0
      ? detail.images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => img.image_url)
      : fallback?.gallery || [detail.primary_image_url || '/images/shelf.jpg'];

  const originAttr = detail.attribute_values?.find((a) => a.attribute_slug === 'origin');

  return {
    slug: detail.slug,
    titleEn: detail.name_en,
    titleUr: detail.name_ur || detail.name_en,
    categorySlug: rootCat.slug,
    categoryNameEn: rootCat.name_en,
    categoryNameUr: rootCat.name_ur,
    subcategorySlug: subCat.slug,
    subcategoryNameEn: subCat.name_en,
    subcategoryNameUr: subCat.name_ur,
    brand: detail.brand?.name || detail.brand_name || undefined,
    priceType: detail.price_on_request || !detail.price ? 'onRequest' : 'fixed',
    price: detail.price ? parseFloat(detail.price) : null,
    currency: 'PKR',
    imageUrl: detail.primary_image_url || gallery[0] || '/images/shelf.jpg',
    gallery,
    descriptionEn:
      detail.description_en ||
      detail.short_description_en ||
      fallback?.descriptionEn ||
      '',
    descriptionUr:
      detail.description_ur ||
      detail.short_description_ur ||
      fallback?.descriptionUr ||
      '',
    featuresEn:
      detail.attribute_values && detail.attribute_values.length > 0
        ? detail.attribute_values.map((a) => `${a.attribute_name_en}: ${a.value_en}`)
        : fallback?.featuresEn || [],
    featuresUr:
      detail.attribute_values && detail.attribute_values.length > 0
        ? detail.attribute_values.map((a) => `${a.attribute_name_ur}: ${a.value_ur}`)
        : fallback?.featuresUr || [],
    specs: detail.specifications || fallback?.specs || {},
    specsUr: fallback?.specsUr || {},
    inStock: detail.stock_status === 'in_stock',
    isBestSeller: detail.is_best_seller ?? fallback?.isBestSeller ?? false,
    isFeatured: detail.is_featured ?? fallback?.isFeatured ?? false,
    sku: detail.sku,
    origin: originAttr?.value_en || fallback?.origin || 'Imported / Domestic',
    tags: fallback?.tags || [rootCat.slug, subCat.slug],
    metaTitleEn: detail.meta_title_en || fallback?.metaTitleEn,
    metaTitleUr: detail.meta_title_ur || fallback?.metaTitleUr,
    metaDescriptionEn: detail.meta_description_en || fallback?.metaDescriptionEn,
    metaDescriptionUr: detail.meta_description_ur || fallback?.metaDescriptionUr,
  };
}

export async function fetchPublishedProducts(): Promise<Product[]> {
  if (_cachedProducts) return _cachedProducts;

  const apiBase = await resolveApiBase();
  if (!apiBase) {
    if (STRICT_API && !ALLOW_FALLBACK) {
      throw new Error(
        '[Astro SSG STRICT] Backend API unreachable. Fixture fallback is disabled in production.'
      );
    }
    _cachedProducts = FALLBACK_PRODUCTS;
    return _cachedProducts;
  }

  // 1. Dedicated Fast Build Export Endpoint (All published products in 1 atomic query)
  try {
    const exportRes = await fetch(`${apiBase}/products/build-export`);
    if (exportRes.ok) {
      const exportData: ApiProductDetail[] = await exportRes.json();
      if (Array.isArray(exportData) && exportData.length > 0) {
        _cachedProducts = exportData.map(mapApiDetailToProduct);
        console.log(
          `[Astro SSG] Successfully retrieved ${_cachedProducts.length} published products via /build-export.`
        );
        return _cachedProducts;
      }
    }
  } catch (err) {
    console.warn(`[Astro SSG] /products/build-export error: ${err}. Attempting paginated retrieval.`);
  }

  // 2. Full Pagination Loop across all pages (retrieving every page, not just the first 100)
  try {
    let page = 1;
    let totalPages = 1;
    const allItems: ApiProductListItem[] = [];

    while (page <= totalPages) {
      const listRes = await fetch(`${apiBase}/products?page=${page}&page_size=100`);
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status} fetching products page ${page}`);
      const listData = await listRes.json();
      const items: ApiProductListItem[] = listData.items || [];
      allItems.push(...items);
      totalPages = listData.total_pages || 1;
      page++;
    }

    // Fetch full details in parallel with strict error propagation
    const detailPromises = allItems.map(async (item) => {
      const detailRes = await fetch(`${apiBase}/products/${item.slug}`);
      if (!detailRes.ok) {
        if (STRICT_API && !ALLOW_FALLBACK) {
          throw new Error(
            `[Astro SSG STRICT] Failed to fetch product details for '${item.slug}' (status: ${detailRes.status}). Aborting build to prevent partial catalog deployment.`
          );
        }
        return mapApiDetailToProduct({
          ...item,
          description_en: item.short_description_en,
          description_ur: item.short_description_ur,
          specifications: null,
          meta_title_en: null,
          meta_title_ur: null,
          meta_description_en: null,
          meta_description_ur: null,
          is_published: true,
          brand: item.brand_name ? { slug: item.brand_slug || '', name: item.brand_name } : null,
          images: item.primary_image_url
            ? [
                {
                  id: '1',
                  image_url: item.primary_image_url,
                  alt_text_en: item.primary_image_alt_en,
                  alt_text_ur: item.primary_image_alt_ur,
                  sort_order: 1,
                  is_primary: true,
                },
              ]
            : [],
          attribute_values: [],
        });
      }
      const detail: ApiProductDetail = await detailRes.json();
      return mapApiDetailToProduct(detail);
    });

    const products = await Promise.all(detailPromises);

    if (products.length > 0) {
      _cachedProducts = products;
      return _cachedProducts;
    }
  } catch (err) {
    if (STRICT_API && !ALLOW_FALLBACK) {
      throw new Error(`[Astro SSG STRICT] Product catalog fetch failed: ${err}. Aborting build.`);
    }
    console.warn(`[Astro SSG] Failed to fetch products: ${err}. Using fallback.`);
  }

  if (STRICT_API && !ALLOW_FALLBACK) {
    throw new Error('[Astro SSG STRICT] No products retrieved from API. Aborting build to preserve current deployment.');
  }

  _cachedProducts = FALLBACK_PRODUCTS;
  return _cachedProducts;
}

// =============================================================================
// 4. Query Helpers
// =============================================================================

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await fetchPublishedProducts();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<Product[]> {
  const products = await fetchPublishedProducts();
  return products.filter((p) => {
    if (p.categorySlug !== categorySlug) return false;
    const sub = p.subcategorySlug.toLowerCase();
    const target = subcategorySlug.toLowerCase();
    return (
      sub === target ||
      sub === `${categorySlug}-${target}` ||
      target === `${categorySlug}-${sub}`
    );
  });
}

export async function getRelatedProducts(
  currentSlug: string,
  categorySlug: string,
  limit: number = 4
): Promise<Product[]> {
  const products = await fetchPublishedProducts();
  return products
    .filter((p) => p.slug !== currentSlug && p.categorySlug === categorySlug)
    .slice(0, limit);
}
