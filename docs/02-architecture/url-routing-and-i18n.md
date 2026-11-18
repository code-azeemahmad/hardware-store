# URL Routing and Internationalization

## Route policy

- English is the default locale at the root path.
- Urdu routes are namespaced under `/ur/`.
- Use stable, lowercase, hyphenated slugs.
- Decide whether Urdu slugs are translated or mirrored before launch; do not mix strategies inconsistently.
- Each locale page should have its own canonical URL and reciprocal hreflang alternate when a true equivalent exists.
- If a translation does not exist, do not create a misleading hreflang alternate or silently claim the page is translated.

## RTL requirements

- Set document `lang` and `dir` correctly for each locale.
- Urdu document direction is `rtl`; English is `ltr`.
- Prefer logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`) over left/right-specific rules.
- Isolate mixed-direction SKU, phone, URL, and Latin brand text with appropriate bidi handling.
- Test punctuation, numerals, forms, menus, breadcrumbs, galleries, and icons in RTL.

## Translation content

Translate navigation labels, category/product content, metadata, forms, validation messages, and system UI. Have a fluent reviewer approve Urdu content before publication.

## Route examples

- `/` — English homepage
- `/kitchen/` — English category
- `/ur/` — Urdu homepage
- `/ur/kitchen/` — example Urdu category route (final slug strategy pending)
