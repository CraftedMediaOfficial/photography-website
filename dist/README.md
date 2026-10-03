# Crafted Media

Photography and cinematography portfolio for Crafted Media.

## Local run

This project has no external dependencies. With Node.js 20 or later installed, run `npm run start` and open `http://localhost:4173`.

## Build and test

Run `npm run test` followed by `npm run build`. The production-ready static files are written to `dist/`.

## Deploy

The included GitHub Actions workflow publishes `dist/` to GitHub Pages when changes are pushed to `main`. In repository settings, set **Pages → Source** to **GitHub Actions** once. A custom domain can be configured in that same Pages settings screen and is independent of this source structure.

No keys, tokens, or environment variables are required for the current static baseline.
