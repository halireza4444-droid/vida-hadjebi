# Vida Hajebi — Biography Site

A static biography website for Vida Hajebi (1937–2007), Iranian writer and political activist.

## Stack

- Plain HTML / CSS / JavaScript — no build step
- Local fonts: **IRANYekanWeb** (8 weights) + **IranNastaliq**
- RTL Persian, fully responsive (desktop / tablet / mobile)
- Hosted on **Cloudflare Pages** (CDN + automatic SSL)

## Local development

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Any other static server will do.

## Project structure

```
.
├── index.html              # Home page
├── book.html               # Book detail page
├── styles.css              # All styles (one file, RTL-first)
├── script.js               # Mobile menu, accordion, slider, video play
└── assets/
    ├── fonts/              # IRANYekanWeb 8 weights
    └── images/             # Photos, book covers, icons, logos
```

## Deployment

Push to `main` and Cloudflare Pages auto-deploys.
Custom domain DNS is managed at IONOS.
