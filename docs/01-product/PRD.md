# Product Requirements Document (PRD)

## 1. Product summary

Create a professional, bilingual website for a hardware and plywood retailer in Pakistan. The website is primarily a searchable, SEO-friendly product catalogue and business presence, not a transactional ecommerce store.

## 2. Business goals

- Present the store, product ranges, brands, and physical location professionally.
- Help customers discover products through navigation, category pages, search, and Google.
- Convert product interest into WhatsApp, telephone, and website enquiries.
- Allow authorized staff to maintain products, categories, images, SEO content, banners, and enquiries without editing code.
- Serve English and Urdu audiences with appropriate language and direction handling.

## 3. Target users

- Homeowners and consumers researching hardware, kitchen, bathroom, and plywood products.
- Carpenters, contractors, builders, designers, and trade buyers.
- Local customers seeking store contact details, directions, and opening hours.
- Store administrators managing catalogue content and enquiries.

## 4. Confirmed product scope

### Public website
- Homepage with announcement bars, hero, featured/best-selling products, category promotions, brands, trust content, reviews when verified, location/contact, and footer.
- Main category and subcategory landing pages.
- Product detail pages with images, descriptions, specifications, related products, and enquiry actions.
- About, contact, brands, blog, search results, and 404 pages.
- English default routes and Urdu routes under `/ur/`.
- Product search and, where useful, filtering/sorting.
- WhatsApp and telephone calls to action.
- Contact and product enquiry forms, subject to anti-abuse controls.
- Technical SEO and content SEO.

### Admin dashboard
- Secure admin sign-in.
- Controlled invitation/approval-based administrator onboarding; no public open registration.
- Manage products, categories, brands, images, attributes/specifications, SEO metadata, banners, blog posts, testimonials, site settings, and enquiries.
- Publish/unpublish content and trigger or request static-site regeneration.

## 5. Explicitly out of scope

Unless formally approved through a change decision:
- Shopping cart and online checkout.
- Online payment gateway.
- Customer accounts or customer login.
- Public administrator self-registration.
- Real-time stock synchronization with a POS/ERP.
- Multi-vendor marketplace functionality.

## 6. Design direction

Use the uploaded Syed Sons full-page screenshot and other assets in `reference/` as the primary visual direction. Adapt the layout language, not the competitor's brand identity or copyrighted content.

Initial palette proposal:
- Brand red: `#E21B23`
- Near-black: `#111111`
- White: `#FFFFFF`
- Light grey: `#F5F5F5`
- Body dark grey: `#333333`

Treat these as proposed design tokens until approved against the supplied reference and store branding.

## 7. Navigation taxonomy (provisional)

- Kitchen: sinks, faucets, accessories (pantry units, spice racks, dish racks, cutlery trays), handles, hoods, built-in ovens.
- Home Hardware: door handles, cabinet handles, locks, hinges, drawer channels, furniture fittings, general hardware.
- Bathroom: accessories, wash basins, faucets, shower systems, toilets/commodes, vanities.
- Plywood: commercial plywood, marine plywood, MDF boards, laminate sheets, blockboard, decorative sheets.
- About Us, Contact Us, Brands, Blog.

The final taxonomy must be reconciled with actual stock. Do not publish empty or misleading categories simply because they appear in this proposal.

## 8. Success measures

Define baselines and targets with the business owner. Suggested measures:
- Organic impressions/clicks and indexed landing pages.
- Product/category page engagement.
- WhatsApp/telephone click-throughs.
- Valid enquiry submissions and response time.
- Admin task completion time.
- Core Web Vitals and mobile usability.
- Percentage of published catalogue with complete images, descriptions, and SEO metadata.

## 9. Assumptions and dependencies

- Store name, logo, address, phone, WhatsApp number, hours, and map coordinates are not yet supplied.
- Actual inventory, SKUs, brands, product facts, images, and availability must be provided or verified.
- Hosting, domain, email delivery, image storage, backup destination, and deployment pipeline require selection.
- Reference screenshots must be available in the repository under `reference/`.

## 10. Acceptance summary

The release is acceptable when the approved page templates work in both languages, catalogue data is accurate, enquiry routes work, admin access is secure, SEO fundamentals are verified, the three-service Docker deployment works, and agreed tests pass.
