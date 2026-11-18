# Repository Structure

Recommended repository layout:

```text
hardware-store/
├── .agents/
│   ├── rules/
│   └── workflows/
├── docs/
├── project-management/
├── reference/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── astro/
│   │   │   └── react/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── content/
│   │   ├── i18n/
│   │   ├── styles/
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── .gitignore
├── AGENTS.md
├── GEMINI.md
├── CLAUDE.md
└── README.md
```

## Organization rules

- Keep Astro page files focused on route composition; move reusable UI into components.
- Separate Astro-rendered components from React interactive islands.
- Keep translations centralized and typed/validated.
- Backend API routes should delegate business logic to services.
- Keep persistence concerns in models/repositories rather than route handlers.
- Keep Pydantic schemas distinct from SQLAlchemy models.
- Keep migrations in version control.
- Store reference screenshots and approved source assets in `reference/` or a clearly documented asset location.
- Do not commit uploaded customer files or secrets.
