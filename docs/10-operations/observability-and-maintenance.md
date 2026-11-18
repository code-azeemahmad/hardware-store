# Observability and Maintenance

## Logging

- Use structured logs where practical.
- Include request correlation IDs.
- Never log passwords, session tokens, invitation tokens, database credentials, or unnecessary enquiry personal data.
- Separate application, proxy, and database logs.
- Define log retention and access controls.

## Monitoring

Monitor:
- Container health and restarts.
- API error rates and latency.
- Database availability, storage, connections, and backup status.
- Disk space and media storage.
- Static build/deployment success and duration.
- Enquiry form delivery/storage failures.
- TLS certificate expiry.

## Maintenance

- Patch base images and dependencies regularly.
- Review admin accounts and roles periodically.
- Rotate secrets when staff or providers change.
- Verify backups and perform restore drills.
- Review broken links, search indexing, and outdated catalogue data.
- Remove or redirect obsolete product/category URLs deliberately.
