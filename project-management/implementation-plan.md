# Implementation Plan

## Work sequence

### Workstream A — Repository and infrastructure
1. Inspect current repository.
2. Create agreed folder structure without overwriting files.
3. Scaffold frontend and backend independently.
4. Add Compose services with required names.
5. Configure Nginx static serving and API proxy.
6. Add health checks, internal network, volumes, and `.env.example`.

### Workstream B — Design and frontend
1. Inventory reference screenshots.
2. Extract layout measurements and design tokens.
3. Implement typography and global layout.
4. Implement header, mega-menu, mobile navigation, footer.
5. Implement reusable cards and category/product templates.
6. Implement homepage and content pages.
7. Add English/Urdu localization and RTL.
8. Add SEO metadata and static routes.

### Workstream C — Backend and data
1. Configure database connection and migrations.
2. Implement models and constraints.
3. Implement public read APIs.
4. Implement enquiry/contact APIs.
5. Implement media upload service.
6. Implement admin auth, roles, invitations.
7. Implement admin CRUD and audit logging.

### Workstream D — Integration and publishing
1. Connect Astro build to published API data.
2. Generate localized category/product pages.
3. Connect public search/filter as designed.
4. Connect enquiry forms and contact actions.
5. Implement authenticated build trigger and status.
6. Test publish/unpublish lifecycle.

### Workstream E — Release
1. Complete security review.
2. Complete visual, accessibility, SEO, and performance review.
3. Test backup and restore.
4. Configure production secrets/TLS.
5. Run end-to-end tests.
6. Obtain business owner sign-off.
7. Deploy and monitor.

## Implementation discipline

Deliver vertical slices with acceptance criteria. Avoid building all frontend pages with disconnected mock data and postponing data-model decisions. Demo data must be clearly labeled and excluded from production builds.
