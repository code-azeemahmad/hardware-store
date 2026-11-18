# Functional and Non-Functional Requirements

## 1. Functional requirements

### Public catalogue
- FR-001: Visitors can browse without creating an account.
- FR-002: Visitors can navigate hierarchical categories and subcategories.
- FR-003: Each published category has a stable, human-readable URL.
- FR-004: Each published product has a unique slug and detail page.
- FR-005: Product pages show available approved images, descriptions, brand, SKU where public, and specifications.
- FR-006: Product pages provide WhatsApp and telephone enquiry actions.
- FR-007: Visitors can search published products and categories.
- FR-008: Category listings support approved filters and sorting where relevant data exists.
- FR-009: Visitors can submit product enquiries and general contact messages.
- FR-010: Visitors can view business contact details, opening hours, and location when supplied.
- FR-011: English is the default language; Urdu content is available under `/ur/`.
- FR-012: Urdu pages render with RTL direction and suitable typography.
- FR-013: Blog articles, brands, about, contact, and 404 pages are supported.

### Admin
- FR-020: Admins authenticate before accessing dashboard functionality.
- FR-021: Admin creation is invitation/approval controlled; public open registration is prohibited.
- FR-022: Authorized admins can create, edit, publish, unpublish, and archive products.
- FR-023: Admins can manage category hierarchy and product-category assignments.
- FR-024: Admins can manage brands, product images, variants, attributes, and specification values.
- FR-025: Admins can edit per-language content and SEO metadata.
- FR-026: Admins can manage homepage banners, blog posts, testimonials, and site settings.
- FR-027: Admins can view and update enquiry status.
- FR-028: Publishing catalogue changes can initiate a controlled Astro rebuild/redeployment.
- FR-029: Privileged actions are auditable.

## 2. Non-functional requirements

- NFR-001: Public pages should deliver meaningful HTML without requiring client-side JavaScript for core content.
- NFR-002: Responsive behavior must cover common mobile, tablet, and desktop widths.
- NFR-003: UI must support keyboard navigation, visible focus, semantic landmarks, and accessible form labels.
- NFR-004: All public content and navigation must have English and Urdu equivalents where the content is intended to be bilingual.
- NFR-005: Admin and API operations must enforce authorization server-side.
- NFR-006: Secrets must not be committed or exposed in browser bundles.
- NFR-007: Database schema changes must be versioned through migrations.
- NFR-008: Product media must persist independently of ephemeral containers.
- NFR-009: Public API and form endpoints must validate inputs and resist abuse.
- NFR-010: SEO metadata, canonical URLs, hreflang, sitemap, robots rules, and structured data must be generated consistently.
- NFR-011: Backups and restoration must be documented and tested before production launch.
- NFR-012: Logs must support diagnosis without unnecessarily retaining sensitive personal data.

## 3. Business rules

- Only published products/categories are publicly visible.
- A product must not be marked available/in stock unless the business confirms that status.
- Price may be omitted or marked “price on request” according to the actual business policy.
- Reviews/testimonials must be genuine and approved for publication.
- Urdu translation must be human-reviewed before publication.
- No checkout or payment flow is to be added without an approved scope change.

## 4. Open requirements

Confirm product price display policy, enquiry form fields, consent wording, product filter dimensions, admin roles, invitation expiry, and whether blog/testimonial content is required at launch.
