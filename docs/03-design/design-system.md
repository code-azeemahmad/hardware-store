# Design System and UI Specification

## 1. Visual direction

The supplied Syed Sons full-page screenshot is the primary visual reference for composition and retail-catalogue presentation. Recreate the relevant visual language while using the store's own identity, photography, copy, and assets. Do not copy the competitor's logo, text, or proprietary imagery.

Before implementation, inspect all relevant files in `reference/` and record measurable observations: header height, bar heights, content widths, grid columns, image ratios, typography hierarchy, spacing, borders, and mobile behavior.

## 2. Proposed palette

| Token | Proposed value | Usage |
|---|---|---|
| `--color-brand` | `#E21B23` | Primary brand accents and key actions |
| `--color-black` | `#111111` | Dark announcement bar, footer, text emphasis |
| `--color-white` | `#FFFFFF` | Main surfaces |
| `--color-surface-muted` | `#F5F5F5` | Product and section backgrounds |
| `--color-text` | `#333333` | Body copy |

These are starting proposals; compare with supplied reference and owner branding before finalizing.

## 3. Typography

- Choose a readable Latin font and an Urdu font with complete glyph coverage.
- Define a consistent type scale for display, page headings, section headings, body, labels, and metadata.
- Avoid using font size alone to establish hierarchy; use weight, spacing, and semantic heading levels.
- Test Urdu line-height, punctuation, mixed Latin/Urdu text, and numeral rendering.

## 4. Global layout

- Red announcement bar with white text.
- Optional black secondary announcement bar.
- White header with centered/approved logo placement and primary navigation.
- Desktop mega-menu and mobile expandable navigation.
- Main content uses a consistent max-width and spacing system.
- Dark footer with verified store details and useful links.

## 5. Homepage sections

1. Announcement bar(s).
2. Header and navigation.
3. Full-width hero or slider using approved store imagery.
4. Best sellers / featured products.
5. Main category discovery.
6. Dedicated plywood promotion/section.
7. Brands.
8. Why choose the store (only verified claims).
9. Customer reviews (only genuine, permissioned reviews).
10. Location/contact and map.
11. Footer.

## 6. Reusable components

- AnnouncementBar
- SiteHeader
- DesktopMegaMenu
- MobileNavigation
- Breadcrumbs
- HeroBanner / HeroSlider
- SectionHeading
- ProductCard / ProductGrid
- CategoryCard / CategoryGrid
- BrandLogoGrid
- ProductGallery
- ProductSpecifications
- EnquiryActions
- WhatsAppButton
- ContactForm
- TestimonialCard / Carousel
- SiteFooter
- LanguageSwitcher
- SearchBox / SearchResults
- Pagination or load-more control where needed

## 7. Page templates

- Homepage
- Main category landing
- Subcategory listing
- Product detail
- Brand listing/detail if required
- About
- Contact
- Blog index/article
- Search results
- 404

Category pages introduce a category and its subcategories/products. Product pages focus on a single item, its genuine specifications, images, and enquiry actions.

## 8. Responsive and accessibility requirements

- Desktop mega-menu must work with pointer and keyboard; do not rely on hover alone.
- Mobile navigation should use an accessible drawer/accordion pattern.
- Use semantic landmarks and heading order.
- Provide visible focus states and sufficient contrast.
- Images need meaningful alt text; decorative images use empty alt.
- Controls need accessible names and states.
- Respect reduced-motion preferences.
- Avoid layout shifts by reserving image dimensions.
- Test both LTR English and RTL Urdu at mobile and desktop breakpoints.

## 9. Visual acceptance

Compare implementation screenshots against references at matching viewport sizes. Record deviations and fix high-impact differences in layout, typography, spacing, imagery, and color before polishing minor details.
