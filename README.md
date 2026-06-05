# Britt Midgette — Portfolio

A password-gated, single-page portfolio with case-study detail pages. Pure
static site: HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

```
index.html        Home (hero, about, capabilities, selected work, brands, contact)
comptia.html      Case study — CompTIA
adm.html          Case study — ADM
samsung.html      Case study — Samsung
styles.css        All styling
script.js         Password gate + interactions
brand-assets/     Images, logos, videos, resume PDF
vercel.json       Static hosting config (clean URLs + asset caching)
```

## Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub repo
   (`brisnit/BrittMidgette`).
2. Framework Preset: **Other**. There is no build command and no output
   directory to set — Vercel serves the repo root as static files.
3. Click **Deploy**. That's it; the site is live.

Pushing to `main` triggers an automatic redeploy.

## Password

The site is gated by a client-side password (`Briz1234`), stored in
`script.js`. Note: this is a soft gate (a deterrent), not real security — the
password is visible in the page source. For true protection, use server-side
auth (e.g., Vercel password protection on the project, or Vercel Authentication).

## Local preview

Open `index.html` directly in a browser, or run any static server from the
project root, e.g. `python3 -m http.server`.
