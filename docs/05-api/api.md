# API Specification

Base prefix: `/api/v1`

All contracts below are proposed and must be finalized in OpenAPI during implementation. JSON examples and fields are illustrative; do not expose fields that are not approved.

## 1. Public endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/categories` | Published category list |
| GET | `/categories/tree` | Published navigation hierarchy |
| GET | `/categories/{slug}` | Category details |
| GET | `/products` | Published product listing; pagination/filter/sort |
| GET | `/products/{slug}` | Published product detail |
| GET | `/brands` | Published brands |
| GET | `/blog` | Published article list |
| GET | `/blog/{slug}` | Published article |
| POST | `/enquiries` | Submit product enquiry |
| POST | `/contact` | Submit general contact message |

## 2. Admin endpoints

All endpoints below require authenticated, authorized admin access unless explicitly designated as authentication/onboarding.

- `/admin/auth/login`
- `/admin/auth/logout`
- `/admin/auth/me`
- `/admin/auth/invitations` (restricted to authorized inviter)
- `/admin/auth/accept-invitation`
- `/admin/products`
- `/admin/categories`
- `/admin/brands`
- `/admin/media`
- `/admin/enquiries`
- `/admin/banners`
- `/admin/blog`
- `/admin/testimonials`
- `/admin/settings`
- `/admin/builds`

Use appropriate GET/POST/PATCH/DELETE methods and role checks. Never implement unrestricted public admin signup.

## 3. Listing behavior

List endpoints should define:
- `page` and `page_size` or cursor pagination.
- Maximum page size.
- Stable sorting.
- Allowed filters.
- Search query length and normalization.
- Published-only public visibility.
- Consistent response envelope and pagination metadata.

## 4. Enquiry validation

- Apply server-side validation and length limits.
- Validate email when supplied.
- Normalize and validate phone data without silently altering user intent.
- Apply rate limiting and anti-spam controls.
- Do not expose internal admin notes in public responses.
- Return a generic success response where needed to reduce abuse signals.
- Do not include secrets or stack traces in API errors.

## 5. Error contract

Use consistent HTTP status codes and a stable JSON error shape, for example:

```json
{
  "detail": "A human-readable error message",
  "code": "VALIDATION_ERROR"
}
```

Do not return internal exception details to clients.

## 6. API documentation

FastAPI OpenAPI output should be reviewed for accidental exposure of admin-only schemas or internal fields. Keep examples free of real customer data and secrets.
