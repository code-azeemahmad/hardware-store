import type { APIRoute } from 'astro';
import { CATEGORIES, PRODUCTS, BLOG_POSTS } from '../data/catalogue';

export const GET: APIRoute = () => {
  const siteUrl = 'https://naseerhardware.pk';

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
    { pathEn: '/search/', pathUr: '/ur/search/', priority: '0.7', changefreq: 'weekly' },
  ];

  // Add categories
  CATEGORIES.forEach((cat) => {
    routes.push({
      pathEn: `/${cat.slug}/`,
      pathUr: `/ur/${cat.slug}/`,
      priority: '0.9',
      changefreq: 'weekly',
    });

    cat.subcategories.forEach((sub) => {
      routes.push({
        pathEn: `/${cat.slug}/${sub.slug}/`,
        pathUr: `/ur/${cat.slug}/${sub.slug}/`,
        priority: '0.8',
        changefreq: 'weekly',
      });
    });
  });

  // Add products
  PRODUCTS.forEach((prod) => {
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
