# Testing Strategy

## 1. Backend tests

- Unit tests for services, validators, permissions, and business rules.
- API integration tests for public and admin endpoints.
- Database tests against PostgreSQL-compatible test environment.
- Migration tests for upgrade path.
- Authentication and authorization tests, including negative cases.
- Enquiry validation, rate limiting, and abuse-control tests.
- Upload tests for invalid MIME/content, oversized files, and path traversal attempts.

## 2. Frontend tests

- Component tests for interactive React Islands.
- Astro build tests for routes and generated output.
- Navigation, search, filters, gallery, and enquiry behavior.
- English and Urdu content rendering.
- RTL layout and mixed-direction text.
- Metadata, canonical, hreflang, sitemap, robots, and JSON-LD checks.
- Broken links and missing-image checks.

## 3. End-to-end scenarios

1. Guest opens homepage and browses category hierarchy.
2. Guest opens a product detail page.
3. WhatsApp and telephone links contain verified business details.
4. Guest submits valid enquiry and receives a safe confirmation.
5. Invalid/abusive enquiry is rejected or throttled.
6. Admin can sign in.
7. Unauthenticated user cannot access dashboard APIs.
8. Unauthorized admin role cannot perform restricted actions.
9. Authorized admin creates and publishes a product.
10. Publishing triggers build workflow and generated page becomes available.
11. Admin invitation can be accepted once and expires appropriately.
12. English and Urdu route variants work with correct direction and metadata.

## 4. Visual regression

- Capture screenshots at agreed desktop, tablet, and mobile viewport sizes.
- Compare with supplied reference screenshots.
- Review header, announcement bars, mega-menu, hero, product cards, section spacing, footer, and mobile navigation.
- Review both LTR and RTL.
- Record and resolve material visual deviations.

## 5. Accessibility

- Keyboard-only navigation.
- Focus order and visible focus.
- Screen-reader names and landmarks.
- Form error association and status announcements.
- Color contrast.
- Reduced-motion support.
- Menu and carousel keyboard interaction.

## 6. Performance and SEO checks

- Lighthouse or equivalent checks on representative pages.
- Core Web Vitals monitoring after deployment.
- Image dimensions, formats, lazy loading, and layout shift.
- Crawl generated routes and inspect canonical/hreflang.
- Validate structured data with relevant validators.
- Confirm sitemap includes canonical published URLs only.

## 7. Release criteria

- All critical and high-severity tests pass.
- No known authorization bypass.
- No secret exposure.
- Migrations and backup/restore verified.
- Public routes work in both languages.
- No broken primary enquiry path.
- Production Docker services pass health checks.
- Visual review is signed off against references.
