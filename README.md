# s0ul3r.github.io

Portfolio / CV site — **https://s0ul3r.github.io** (and optionally **s0ul3r.dev** with a custom domain).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build & deploy

- **Build:** `npm run build` → output in `dist/`
- **Deploy:** Push to `main`; GitHub Actions publishes to GitHub Pages. Repo must be named **`s0ul3r.github.io`** and in Settings → Pages use **GitHub Actions** as source.

## Custom domain (e.g. s0ul3r.dev)

1. Buy the domain (e.g. from Cloudflare, Namecheap, OVH).
2. In this repo: **Settings → Pages → Custom domain** → enter `s0ul3r.dev`.
3. At your registrar, add the DNS records GitHub shows (usually a CNAME to `s0ul3r.github.io`, or A records for GitHub's IPs).  
After DNS propagates, the site will be available at **https://s0ul3r.dev**.

## Content & styling

- **Data:** `src/data.js`
- **Styles:** `src/style.css` (dark theme)

## Tech

- Vite, vanilla JS, CSS (dark theme)
