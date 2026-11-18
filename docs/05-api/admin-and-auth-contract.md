# Admin and Authentication Contract

## Access model

- Public catalogue APIs are read-only unless a public enquiry endpoint is explicitly provided.
- All `/admin/*` operations require authenticated and authorized staff.
- Admin UI visibility is not a security boundary; API authorization is mandatory.

## Proposed roles

| Role | Suggested permissions |
|---|---|
| Owner / Super-admin | Full administration, admin invitations, settings, role assignment |
| Administrator | Catalogue/content administration and enquiry access; no owner-only security controls unless granted |
| Catalogue editor | Products, categories, brands, media, localized copy, SEO |
| Enquiry handler | View and update enquiries only |

Approve this role model before implementation.

## Invitation lifecycle

1. Authorized inviter creates invitation for a specific email/role.
2. System generates a cryptographically random one-time token.
3. Store only a secure hash of the token where feasible.
4. Send invitation through the selected verified email provider.
5. Recipient accepts before expiry and sets credentials.
6. Token becomes invalid after use, expiry, or revocation.
7. Audit invitation creation, acceptance, revocation, and role changes.

## Bootstrap

Create the first owner through a one-time deployment/CLI procedure. Require secure secret injection and force credential setup. Never ship a default owner account or password.

## Session and authorization

Choose cookie session or token approach and document exact implementation. Enforce CSRF if cookie-authenticated browser requests require it. Revoke sessions when an account is disabled or credentials are reset.
