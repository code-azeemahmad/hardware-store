# Security Requirements

## 1. Threat model

Protect:
- Admin accounts and privileged actions.
- Product/catalogue integrity.
- Customer enquiry personal information.
- Database credentials and deployment/build credentials.
- Uploaded images and server infrastructure.

Assume public endpoints will receive malformed, automated, and abusive traffic.

## 2. Authentication and administrator onboarding

- Public customer browsing requires no account.
- Admin login is mandatory for dashboard access.
- No public self-service admin registration.
- Initial admin creation must use a one-time secure bootstrap process or controlled deployment command; never a hardcoded default password.
- Additional admin accounts require invitation/approval by an authorized administrator.
- Invitation tokens must be random, single-use, expiring, stored safely (preferably hashed), and invalidated after acceptance.
- Define roles/permissions before launch (proposed: owner/super-admin, administrator, catalogue editor, enquiry handler).
- Enforce authorization in backend dependencies/service layer for every protected endpoint.
- Provide session revocation and account disablement.

## 3. Passwords and sessions

- Use a modern password hashing algorithm through a maintained library (e.g. Argon2id where supported).
- Never store plaintext passwords.
- Use secure, HttpOnly, SameSite cookies if cookie sessions are selected; set Secure in production.
- Define CSRF protection for cookie-authenticated state-changing requests.
- If token authentication is chosen, keep refresh/access lifetimes short and protect refresh token storage.
- Rate-limit login, invitation acceptance, and password reset flows.
- Do not reveal whether a username/email exists unnecessarily.

## 4. Input and API security

- Validate all inputs with typed schemas and explicit limits.
- Use ORM/parameterized queries.
- Apply CORS allowlists; do not use wildcard origins with credentials.
- Apply request size limits and timeouts.
- Rate-limit public enquiry/contact endpoints.
- Add anti-spam controls appropriate to observed abuse.
- Restrict admin endpoints and sensitive build triggers.
- Use security headers and HTTPS in production.

## 5. File uploads

- Allowlist required image formats.
- Verify actual file content, not only extension or browser MIME type.
- Enforce file size and image dimension limits.
- Generate server-side filenames; never trust user-supplied paths.
- Reject executable or unexpected content.
- Store outside executable application paths or use object storage.
- Re-encode images where appropriate and strip unnecessary metadata.
- Require admin authorization for catalogue media uploads.
- Ensure persistent storage and backup.

## 6. Infrastructure

- Only Nginx is publicly exposed.
- Do not publish PostgreSQL port in production.
- Use private Docker networks.
- Run containers as non-root where feasible.
- Use minimal, patched base images and pin versions.
- Keep secrets out of images and Compose files.
- Use separate credentials per environment and least privilege.
- Restrict database user privileges.
- Configure health checks and resource limits.
- Back up database and media independently.

## 7. Privacy

- Collect only data needed to respond to enquiries.
- Publish an appropriate privacy notice and consent wording after legal/business review.
- Restrict enquiry access to relevant staff.
- Define retention, deletion, and backup retention periods.
- Avoid sensitive data in logs and analytics.
- Do not send enquiry personal data to third-party analytics.

## 8. Operational security

- Keep dependencies updated.
- Scan dependencies and container images.
- Log privileged changes without recording secrets.
- Monitor authentication failures and unusual enquiry volume.
- Test backup restoration.
- Have an incident response and credential rotation procedure.

## 9. Release gate

Production release is blocked until admin authorization, invitation flow, secret handling, upload validation, rate limiting, HTTPS, database isolation, and backup/restore procedures have been tested.
