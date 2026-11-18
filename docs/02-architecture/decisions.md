# Architecture Decision Records (ADR) Log

Record material decisions here. Use the template below for each new decision.

## ADR-001: Astro SSG for initial public website

- **Status:** Accepted
- **Context:** The site is a product catalogue where crawlable HTML, performance, and simple deployment are priorities.
- **Decision:** Use Astro Static Site Generation initially.
- **Consequences:** Public pages are generated at build time. Content publishing must trigger a rebuild/redeployment. Dynamic freshness is not immediate.
- **Alternatives:** Astro SSR with Node runtime; fully client-rendered React.
- **Review trigger:** If content update frequency or personalization makes rebuild-based publishing unsuitable.

## ADR-002: React Islands for selected interactions

- **Status:** Accepted
- **Context:** Most pages are content/catalogue pages; only selected controls need client-side interactivity.
- **Decision:** Use React only for interactive islands.
- **Consequences:** Static content remains lightweight; island boundaries and hydration strategy must be maintained.

## ADR-003: Three primary Docker services

- **Status:** Accepted
- **Context:** Deployment should remain simple and use the requested service names.
- **Decision:** Use `hardware-frontend`, `hardware-backend`, and `hardware-postgres`.
- **Consequences:** Nginx and static Astro output share the frontend service. No separate production Node SSR service in the initial design.

## ADR-004: Enquiry-led business model

- **Status:** Accepted
- **Context:** The store wants catalogue discovery and direct customer enquiries.
- **Decision:** Use WhatsApp, telephone, and enquiry forms; no online checkout or customer accounts.
- **Consequences:** No cart, payment, or order checkout domain in the initial release.

## ADR-005: Bilingual route strategy

- **Status:** Accepted in principle
- **Context:** English and Urdu are required.
- **Decision:** English default routes; Urdu namespace under `/ur/`, with RTL rendering.
- **Open detail:** Whether Urdu slugs are translated or mirror English slugs must be finalized before route/content freeze.

## ADR template

### ADR-XXX: [Title]
- **Status:** Proposed / Accepted / Superseded
- **Date:** [YYYY-MM-DD]
- **Context:** [Problem and constraints]
- **Decision:** [Chosen option]
- **Alternatives:** [Options considered]
- **Consequences:** [Trade-offs and follow-up work]
- **Approver:** [Name/role]
