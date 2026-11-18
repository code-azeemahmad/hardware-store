# Backup and Recovery

## Scope

Back up both:
1. PostgreSQL data.
2. Product and editorial media files or object-storage content.

A database backup without media backup is incomplete.

## Policy to finalize

| Item | Required decision |
|---|---|
| Backup frequency | `[OWNER/OPS TO SET]` |
| Retention | `[OWNER/OPS TO SET]` |
| Off-site destination | `[SELECT]` |
| Encryption | Required |
| Access control | Named authorized operators only |
| Recovery point objective | `[SET]` |
| Recovery time objective | `[SET]` |
| Restore test frequency | `[SET]` |

## Recovery procedure

1. Declare incident and prevent further destructive writes where appropriate.
2. Provision clean infrastructure and secure credentials.
3. Restore PostgreSQL backup.
4. Restore matching media backup.
5. Apply only the migrations required for the selected recovery point.
6. Verify record/media references, public pages, admin login, and enquiry records.
7. Rebuild and deploy Astro output from restored published content.
8. Validate service health and notify stakeholders.

Document exact commands and provider-specific steps after the hosting and backup tools are selected. Never claim recoverability until a restore test succeeds.
