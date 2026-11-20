import type { APIRoute } from 'astro';

declare const process: {
  env: Record<string, string | undefined>;
};

export const GET: APIRoute = async () => {
  const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://naseerhardware.duckdns.org').replace(/\/$/, '');
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
