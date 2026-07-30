# Loma

Loma Capital Management — web properties.

## App

Everything runs from `website/` (Next.js):

```bash
cd website
npm install
npm run dev
```

| URL | What |
|-----|------|
| http://localhost:3000 | Marketing site |
| http://localhost:3000/login | LP Portal sign-in |
| http://localhost:3000/positions | Partner positions (after login) |

## Structure

```
loma/
└── website/                 # Next.js — marketing + LP portal
    ├── public/marketing/    # Public marketing SPA
    ├── src/app/login/       # Auth UI
    ├── src/app/positions/   # LP dashboard
    └── supabase/            # Schema + RLS
```
