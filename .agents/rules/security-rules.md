# Security Rules

- Never expose secrets in source, logs, browser bundles, screenshots, or commits.
- Use environment variables or an approved secrets manager.
- Public users must never be able to create administrator accounts.
- Enforce admin authorization on the server for every protected operation.
- Use secure password hashing and secure session/token handling.
- Apply CSRF protection where cookie-based authentication and browser forms require it.
- Validate and constrain uploaded file type, size, and content; generate safe filenames.
- Prevent SQL injection through parameterized ORM/database operations.
- Apply rate limiting and anti-abuse controls to public forms and authentication.
- Do not expose database ports publicly.
- Avoid logging passwords, tokens, sensitive enquiry data, or personal information unnecessarily.
- Follow `docs/06-security/security.md` for the full policy.
