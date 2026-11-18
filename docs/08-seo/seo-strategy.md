# SEO Strategy

## 1. Goals

Build discoverable, useful category and product landing pages for relevant hardware and plywood searches in Pakistan, while supporting local store discovery.

SEO is not a ranking guarantee. Content must be useful, accurate, and based on real stock and business information.

## 2. Technical SEO

- Generate meaningful HTML at build time.
- Unique title and meta description per indexable page and locale.
- One clear primary H1; logical H2/H3 hierarchy.
- Canonical URL on indexable pages.
- `hreflang` alternates for English and Urdu equivalents.
- XML sitemap containing canonical, published URLs only.
- `robots.txt` with deliberate crawl policy; do not use it as a substitute for access control.
- Breadcrumbs with crawlable links.
- Descriptive image filenames and meaningful alt text.
- Open Graph metadata.
- Clean, stable URLs and deliberate redirect policy.
- Custom 404 page with correct HTTP 404 status.
- Avoid duplicate or thin indexable pages.
- Ensure admin, preview, internal search parameter combinations, and private content are not indexed.

## 3. Proposed route patterns

English:
- `/`
- `/kitchen/`
- `/kitchen/sinks/`
- `/home-hardware/door-handles/`
- `/bathroom/`
- `/plywood/marine-plywood/`
- `/products/{product-slug}/`
- `/about-us/`
- `/contact-us/`

Urdu:
- `/ur/` and corresponding translated/mirrored route structure.

Decide translated versus mirrored Urdu slugs before route freeze. Maintain stable redirects if URLs change.

## 4. Metadata examples

Example only; replace store name and copy with verified information.

- Product: `Marine Plywood in Pakistan | [STORE_NAME]`
- Description: `Explore marine plywood for furniture, kitchens and construction. View available specifications and contact [STORE_NAME] for current details.`

Do not claim waterproof ratings, certifications, thicknesses, or availability without evidence.

## 5. Structured data

Use only applicable, accurate schema:
- `Organization` and/or `LocalBusiness` for verified business details.
- `BreadcrumbList` for navigational hierarchy.
- `Product` for genuine product attributes and price/availability only when supported.
- `Article` for editorial blog content.

Do not fabricate ratings, reviews, price, stock, shipping, or offers. Validate generated JSON-LD and ensure it matches visible page content.

## 6. Content SEO

Create useful category introductions and product descriptions. Potential editorial topics include:
- Types of plywood used in Pakistan.
- Marine plywood vs commercial plywood.
- MDF vs plywood.
- How to choose kitchen cabinet handles.
- Types of door locks.
- How to choose door hinges.
- Plywood for kitchen cabinets.

Topics are suggestions, not claims of search volume. Research actual search intent before committing editorial priorities.

## 7. Local SEO

- Verify and maintain Google Business Profile.
- Keep business name, address, phone, and hours consistent.
- Add accurate map and directions.
- Publish genuine location and service-area information.
- Add LocalBusiness schema only with verified data.
- Link to the business profile where appropriate.

## 8. Measurement

Configure Search Console and approved analytics after domain ownership and privacy requirements are settled. Track organic performance, index coverage, enquiry conversions, and page experience.
