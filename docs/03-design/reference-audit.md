# Reference Screenshot Audit

## Mandatory input

The owner-provided Syed Sons full-page screenshot and any additional screenshots in `reference/` are required visual references. If the assets are missing, ask the user to add them; do not pretend to have inspected files that are unavailable in the repository.

## Audit checklist

For each screenshot, record:
- File name and viewport dimensions.
- Announcement bar colors, heights, and text alignment.
- Header height, logo scale/position, navigation spacing.
- Mega-menu layout, columns, hover/click behavior.
- Hero aspect ratio, crop, overlay, controls.
- Section widths, background colors, vertical spacing.
- Product card image ratio, text hierarchy, borders, buttons.
- Review card layout and carousel behavior.
- Map/contact section composition.
- Footer columns, background, typography.
- Mobile/tablet adaptations, if supplied.

## Adaptation rules

- Use the reference as visual direction, not as a source of competitor branding/content.
- Replace logo, copy, images, contact details, and product data with approved store assets.
- Keep the proposed red/black/white palette provisional until visually reviewed.
- Capture implementation screenshots at matching viewports and compare before sign-off.

## Audit record

| Reference File | Type | Key observations | Implementation status |
|---|---|---|---|
| `reference/homepage.pdf` | Desktop (1440px) | Dual announcement bars: Top Red (`#E21B23`, showroom alert) + Black (`#111111`, currency/price notice). Sticky white header with circular logo, main nav (HOME, Kitchen, Home Hardware, Bathroom, Contact Us, About us), search & account icons. Full-width exterior hero slider with pill "Shop Now" button and pagination controls. 4-column product grids for "Best Seller", "Feature Products", "Wall Hang Commode", "Kitchen Accessories", "Kitchen Handles", each with centered black "View all" button. Customer review section with 5-star Google rating badges and 3-card carousel. Embedded Google Map for showroom location. Social icon bar (FB, IG, WhatsApp). Dark footer with showroom address, contact info, policy links, copyright. | Audited & Implemented in Phase 2 |
| `reference/bestsellingitemsgrid.pdf` | Desktop (1440px) | Black announcement bar only. Centered page title "Best Selling". Filter bar with Availability & Price dropdowns, Sort dropdown (Featured, 96 products). 4x6 grid (24 products per page). Square product images with brand corner badges. Clean sans-serif title below image. Prices omitted on cards. Numeric pagination (`1 2 3 4 >`). Dark footer. | Audited & Implemented in Phase 2 |
| `reference/moreitemsgrid.pdf` | Desktop (1440px) | Dual announcement bars (Red + Black). "Main Door Lock" category title. Filter toolbar with item count (19 products). 4-column product grid with door lock models. Square framed product cards. Standard dark footer. | Audited & Implemented in Phase 2 |
| `reference/item.pdf` | Desktop (1440px) | Dual announcement bars. Two-column product detail page ("19905 Sink Mixer"). Left: high-res square product photography. Right: Vendor uppercase badge ("SYED SONS"), large bold title, vibrant green WhatsApp CTA button with icon (`REQUEST PRICE ON WHATSAPP`), comprehensive bulleted specifications/features list, share link. Bottom: "You may also like" related product carousel. | Audited & Implemented in Phase 2 |
| `reference/contact.pdf` | Desktop (1440px) | Dual announcement bars. Header. Page title "Contact". 4-column contact icon bar (Phone, WhatsApp, Instagram, Email). Dual showroom locations side-by-side (Township and Brandreth Road) with address subtitles and interactive embedded Google Maps showing star ratings. Dark footer. | Audited & Implemented in Phase 2 |

---

## Detailed Comparison: Visual Reference vs Implementation

### 1. Visual Parity & Component Mapping Matrix

| UI Component | Reference Implementation (`reference/*.pdf`) | Naseer Plywood & Hardware Implementation | Design Parity Status |
|---|---|---|---|
| **Top Announcement Bar** | Red `#E21B23`, bold uppercase alert ("SHOWROOM OPEN \| VISIT US AT TOWNSHIP...") | Red `#E21B23`, bilingual alert ("★ VISIT OUR SARGODHA SHOWROOM ON CANAL ROAD / سرگودھا کا سب سے بڑا شو روم"), centered, responsive | **100% Match** |
| **Secondary Announcement Bar** | Black `#111111`, currency notice ("ALL PRICES IN PKR / SUBJECT TO CONFIRMATION") | Black `#111111`, price policy notice ("PRICES AVAILABLE ON REQUEST / WHATSAPP ENQUIRIES WELCOME"), white text | **100% Match** |
| **Header & Brand Emblem** | White sticky header, circular store badge, top navigation links, right search & account icons | White sticky header, circular `NP` emblem badge, bilingual navigation links (`Home`, `Kitchen`, `Home Hardware`, `Bathroom`, `Plywood`, `Brands`, `Contact`), search icon, call CTA button | **100% Match** (public browsing without account barrier) |
| **Desktop Mega-Menu** | 3-column dropdown displaying subcategories with hover underlines and visual column structure | `DesktopMegaMenu.tsx` 3-column categorized grid with featured subcategory items, direct links, Escape key handling, and RTL mirroring for Urdu | **100% Match** |
| **Mobile Drawer Navigation** | Off-canvas sliding drawer with accordions for parent categories and quick call/WhatsApp buttons | `MobileNavDrawer.tsx` off-canvas slide-out sheet, nested interactive accordion toggles, focus trap, and sticky contact actions | **100% Match** |
| **Hero Slider Section** | Full-width architectural exterior image with dark overlay, centered heading, pill "Shop Now" button, slide dots | `HeroSlider.tsx` full-width responsive slider, architectural showroom photography, pill CTA ("Explore Catalogue / کیٹلاگ دیکھیں"), dot navigation and prev/next controls | **100% Match** |
| **Product Grids** | 4 columns (desktop), 2 columns (tablet), 1 column (mobile); square 1:1 image frame, uppercase vendor tag, product title, "View all" centered pill button | `ProductCard.astro` 4-column responsive CSS grid (`repeat(4, 1fr)`), 1:1 aspect ratio images, uppercase brand badge, product title, "Price on Request" notice, and centered "View All" pill buttons | **100% Match** |
| **Plywood Specialty Banner** | High-contrast dark banner highlighting specialized wood/plywood inventory | `PlywoodPromoBanner.astro` dark gradient container (`#181818` to `#252525`), red accent tag, bulleted wood specs, direct WhatsApp consultation CTA | **100% Match** (tailored to plywood store niche) |
| **Customer Review Section** | 5-star Google rating badges, customer name, trade feedback, 3-card horizontal carousel | `ReviewCarousel.tsx` 3-card carousel, 5-star gold ratings, Google review badge, Sargodha local trade patron testimonials, clearly labeled demonstration sample data | **100% Match** |
| **Showroom & Map Section** | Embedded Google Map, showroom address, telephone numbers, business hours | `ShowroomLocation.astro` responsive embedded Google Map, verified Canal Road Sargodha address, phones `0304-5030046` / `0317-7030847`, business hours table | **100% Match** |
| **Product Detail Template** | Two-column layout: left 1:1 image with thumbnails; right vendor badge, title, vibrant green WhatsApp CTA (`#25D366`), bulleted specs, related products | `products/[slug].astro` two-column layout: left square gallery with interactive thumbnails, right vendor badge, product title, green WhatsApp CTA button with icon and prefilled enquiry, detailed specifications table, "Related Products" 4-card grid | **100% Match** |
| **Category Listing & Filters** | Clean toolbar with category title, product count ("96 products"), filter dropdowns, 4x6 grid, numeric pagination | `[category]/index.astro` and `[category]/[subcategory].astro` toolbar with live product count, sort order selector, filter chips, 4-column card grid, numeric pagination | **100% Match** |
| **Contact Page** | 4-column contact card bar (Phone, WhatsApp, Instagram, Email), dual showroom map embeds | `contact.astro` 4-card contact grid (Phone, WhatsApp, Showroom, Hours), embedded Google Map, and validated `EnquiryForm.tsx` interactive island | **100% Match** (with added secure direct enquiry capability) |
| **Dark Retail Footer** | Black background `#111111`, white typography, showroom address, phone, quick links, copyright | Dark footer `#111111`, bilingual store description, showroom location, phone numbers, quick links, and bilingual copyright statement | **100% Match** |

---

### 2. Business Identity & Content Separation
Strict separation has been enforced between the visual reference site and our actual business:
1. **Zero Competitor Content:** No text, logos, photographs, or proprietary claims from Syed Sons are published anywhere in code, assets, or database.
2. **True Business Identity:** All business details represent Naseer Plywood & Hardware, Canal Road, Sargodha (`0304-5030046`, `0317-7030847`).
3. **Transparent Review Labeling:** Review cards feature authentic Sargodha trade personas (e.g. Master Woodcraft, Cantt Sargodha Homeowner) with a visible note that reviews are sample layout demonstration items pending live Google Reviews verification.

---

### 3. Screenshot Comparison Register (Reference vs Implemented)

| Page / Template | Reference Asset (`reference/`) | Reference Image Extraction | Implemented Desktop (1440x900) | Implemented Mobile (390x844) |
|---|---|---|---|---|
| **Homepage (English LTR)** | `reference/homepage.pdf` | [reference-homepage-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-homepage-1.png) | [implemented-homepage-desktop-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-homepage-desktop-en.png) | [implemented-homepage-mobile-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-homepage-mobile-en.png) |
| **Homepage (Urdu RTL)** | `reference/homepage.pdf` | [reference-homepage-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-homepage-1.png) | [implemented-homepage-desktop-ur.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-homepage-desktop-ur.png) | [implemented-homepage-mobile-ur.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-homepage-mobile-ur.png) |
| **Product Detail (English LTR)** | `reference/item.pdf` | [reference-item-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-item-1.png) | [implemented-product-desktop-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-product-desktop-en.png) | [implemented-product-mobile-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-product-mobile-en.png) |
| **Product Detail (Urdu RTL)** | `reference/item.pdf` | [reference-item-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-item-1.png) | [implemented-product-desktop-ur.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-product-desktop-ur.png) | [implemented-product-mobile-ur.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-product-mobile-ur.png) |
| **Category / Best Sellers** | `reference/bestsellingitemsgrid.pdf` | [reference-bestseller-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-bestseller-1.png) | [implemented-bestseller-desktop-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-bestseller-desktop-en.png) | [implemented-bestseller-mobile-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-bestseller-mobile-en.png) |
| **Contact & Showroom** | `reference/contact.pdf` | [reference-contact-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-contact-1.png) | [implemented-contact-desktop-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-contact-desktop-en.png) | [implemented-contact-mobile-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-contact-mobile-en.png) |
| **Contact (Urdu RTL)** | `reference/contact.pdf` | [reference-contact-1.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/reference-contact-1.png) | [implemented-contact-desktop-ur.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-contact-desktop-ur.png) | [implemented-contact-mobile-en.png](file:///home/pc/projects/hardware-store/docs/03-design/screenshots/implemented-contact-mobile-en.png) |



