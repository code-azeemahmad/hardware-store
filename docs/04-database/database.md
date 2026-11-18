# Database Design

## 1. Principles

- PostgreSQL is the system of record.
- SQLAlchemy 2.x models map persistence structures.
- Alembic manages all schema changes.
- Use UUID or another consistently selected primary-key strategy; finalize during initial implementation.
- Use timestamps (`created_at`, `updated_at`) and explicit publication status where relevant.
- Store images in persistent file/object storage; store metadata and storage keys/URLs in PostgreSQL.
- Never store secrets or raw passwords.

## 2. Proposed entities

| Table | Purpose |
|---|---|
| `categories` | Hierarchical category tree |
| `products` | Canonical product records |
| `product_categories` | Many-to-many product/category relation |
| `brands` | Brand records |
| `product_images` | Product image metadata and ordering |
| `attributes` | Specification definitions |
| `product_attribute_values` | Product-specific specification values |
| `product_variants` | Optional size/finish/color variants |
| `admin_users` | Admin identities and status |
| `admin_invitations` | One-time controlled onboarding |
| `admin_sessions` or token/session records | Revocable admin sessions if required by chosen auth design |
| `enquiries` | Product and general contact enquiries |
| `blog_posts` | Articles and translated content |
| `testimonials` | Approved customer testimonials |
| `banners` | Homepage/promotional banners |
| `site_settings` | Verified business/site settings |
| `audit_logs` | Security-sensitive admin activity |

## 3. Product model (conceptual)

- `id`
- `name` / localized content strategy
- `slug` (unique within locale or canonical route policy)
- `sku` (nullable; unique if supplied)
- `short_description`
- `description`
- `brand_id` (nullable)
- `price` (nullable; only if policy permits)
- `price_on_request`
- `stock_status` (only when maintained accurately)
- `is_featured`
- `is_best_seller`
- `is_published`
- `meta_title`
- `meta_description`
- `created_at`
- `updated_at`
- `published_at`

Do not assume price or stock is known. Define currency and numeric precision before implementing price fields.

## 4. Categories

Use a self-referencing parent relationship (`parent_id`) for hierarchy. Include stable slug, sort order, publication status, and localized names/descriptions. Prevent cycles and define behavior when a category is deleted or moved.

## 5. Localization strategy

Select one explicit strategy before schema implementation:
- Separate translation tables keyed by entity and locale; or
- JSONB localized fields with schema validation; or
- Separate localized content entities.

Whichever is selected, enforce uniqueness of published slugs per locale and ensure untranslated content is not silently presented as a complete translation. Keep technical identifiers and SKU independent of translated display names.

## 6. Product relationships

- Product ↔ Category: many-to-many.
- Product → Brand: many-to-one, optional.
- Product → Images: one-to-many.
- Product → Attribute values: one-to-many.
- Product → Variants: optional one-to-many.

## 7. Enquiries

Suggested fields:
- `id`
- `type` (`product` or `general`)
- `product_id` (nullable)
- `name`
- `phone` (as supplied; validate format without assuming country code)
- `email` (nullable)
- `message`
- `locale`
- `status` (e.g. new, in_progress, resolved, spam)
- `created_at`
- `updated_at`

Collect only necessary personal data. Define retention and deletion policy before launch.

## 8. Indexes and constraints

- Unique indexes for canonical slugs and supplied SKU according to business rules.
- Index category parent, publication status, product brand, join-table foreign keys, enquiry status/date.
- Add search indexes appropriate to the selected search implementation and supported languages.
- Add foreign keys and explicit delete behavior.
- Validate numeric dimensions and enum/status values.
- Avoid indexing every field without query evidence.

## 9. Migrations and seed data

- Every schema change uses an Alembic migration.
- Seed only clearly identified demo data in development.
- Never seed invented product claims into production.
- Test both upgrade and downgrade where practical.
- Back up before production migrations and document recovery steps.
