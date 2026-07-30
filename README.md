# Loma

Loma Capital Management — monorepo for web properties.

## Structure

```
loma/
├── website/          # Public marketing site (standalone HTML)
│   ├── index.html
│   └── assets/headshots/
└── portal/           # Partner portal (future)
```

## Local preview (website)

```bash
cd website
python3 -m http.server 8765
```

Open [http://localhost:8765](http://localhost:8765).

## Headshots

Replace sample JPGs in `website/assets/headshots/` with real founder photos, or update the `headshot` paths in the `investments` data inside `website/index.html`.

## GitHub

```bash
git add .
git commit -m "Initial Loma monorepo"
gh repo create loma --public --source=. --push
```

Adjust the repo name and visibility as needed.
