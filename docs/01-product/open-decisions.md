# Open Decisions and Assumptions

This document prevents the agent from silently turning assumptions into requirements.

## Confirmed

- Catalogue website, not online checkout.
- WhatsApp and telephone enquiries.
- No customer authentication.
- Full-featured private admin dashboard.
- Admin sign-in and controlled sign-up/invitation.
- English and Urdu.
- Astro + React Islands, FastAPI, PostgreSQL, Nginx, Docker Compose.
- Three named services/containers.
- Astro SSG for the initial public website.
- Syed Sons screenshot is a visual reference; use the store's own identity and content.

## Must be decided before relevant implementation

| Decision | Current status |
|---|---|
| Store name, branding, logo | Awaiting owner |
| Address, phone, WhatsApp, hours, map | Awaiting owner |
| Domain and hosting provider | Awaiting owner |
| Exact category taxonomy | Provisional; reconcile with inventory |
| Actual products, SKUs, brands, images | Awaiting inventory |
| Price policy: show price / request quote | Awaiting owner |
| Enquiry form fields and consent text | To define |
| Admin roles and permissions | Proposed role model in security doc; approve |
| Admin invitation delivery method | Awaiting email/provider decision |
| Media storage: Docker volume or object storage | Choose before production |
| Email delivery for forms/invitations | Choose provider |
| Build trigger after admin publishing | Choose secure deployment mechanism |
| Urdu translated slugs or mirrored English slugs | Decide before URL freeze |
| Blog and testimonials at launch | Confirm scope |
| Analytics and cookie/consent requirements | Confirm jurisdiction and tools |
| Backup destination and retention | Confirm before production |

## Decision process

For any material change, record context, options, decision, consequences, date, and approver in `docs/02-architecture/decisions.md`. Do not infer approval from silence.
