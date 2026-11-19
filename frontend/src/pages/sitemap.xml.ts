import type { APIRoute } from 'astro';
import {
  fetchPublishedCategories,
  fetchPublishedProducts,
} from '../lib/api';
import { BLOG_POSTS } from '../data/catalogue';

declare const process: {
  env: Record<string, string | undefined>;
};

export const GET: APIRoute = async () => {
  const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://naseerhardware.pk').replace(/\/$/, '');

  interface RouteItem {
    pathEn: string;
    pathUr: string;
    priority: string;
    changefreq: string;
  }

  const routes: RouteItem[] = [
    { pathEn: '/', pathUr: '/ur/', priority: '1.0', changefreq: 'daily' },
    { pathEn: '/about/', pathUr: '/ur/about/', priority: '0.8', changefreq: 'monthly' },
    { pathEn: '/contact/', pathUr: '/ur/contact/', priority: '0.9', changefreq: 'monthly' },
    { pathEn: '/brands/', pathUr: '/ur/brands/', priority: '0.8', changefreq: 'weekly' },
    { pathEn: '/blog/', pathUr: '/ur/blog/', priority: '0.8', changefreq: 'weekly' },
  ];

  const categories = await fetchPublishedCategories();
  const products = await fetchPublishedProducts();

  // Add categories and subcategories
  categories.forEach((cat) => {
    routes.push({
      pathEn: `/${cat.slug}/`,
      pathUr: `/ur/${cat.slug}/`,
      priority: '0.9',
      changefreq: 'weekly',
    });

    cat.subcategories.forEach((sub) => {
      // Primary Canonical Subcategory URL only (aliases are excluded from sitemap)
      routes.push({
        pathEn: `/${cat.slug}/${sub.slug}/`,
        pathUr: `/ur/${cat.slug}/${sub.slug}/`,
        priority: '0.8',
        changefreq: 'weekly',
      });
    });
  });

  // Add products
  products.forEach((prod) => {
    routes.push({
      pathEn: `/products/${prod.slug}/`,
      pathUr: `/ur/products/${prod.slug}/`,
      priority: '0.85',
      changefreq: 'weekly',
    });
  });

  // Add blog posts
  BLOG_POSTS.forEach((post) => {
    routes.push({
      pathEn: `/blog/${post.slug}/`,
      pathUr: `/ur/blog/${post.slug}/`,
      priority: '0.7',
      changefreq: 'monthly',
    });
  });

  const now = new Date().toISOString().split('T')[0];

  const xmlEntries: string[] = [];

  routes.forEach((item) => {
    // English Entry
    xmlEntries.push(`
  <url>
    <loc>${siteUrl}${item.pathEn}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${item.pathEn}" />
    <xhtml:link rel="alternate" hreflang="ur" href="${siteUrl}${item.pathUr}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${item.pathEn}" />
  </url>`);

    // Urdu Entry
    xmlEntries.push(`
  <url>
    <loc>${siteUrl}${item.pathUr}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ur" href="${siteUrl}${item.pathUr}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${item.pathEn}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${item.pathEn}" />
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries.join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
