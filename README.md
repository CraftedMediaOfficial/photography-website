# Crafted Media

Photography and cinematography portfolio for Crafted Media.

## Local run

With Node.js 20 or later installed, run `npm install`, then `npm run start` and open `http://localhost:4173`. Sharp is the only development dependency and powers local image optimization.

## Build and test

Run `npm run test` followed by `npm run build`. The production-ready static files are written to `dist/`.

## Manage content

Run `npm run admin` and open the one-time local URL printed in the terminal. The Content Studio manages portfolio categories, albums and photos, films, homepage features, testimonials, About/team, and contact/social settings without hand-editing source files. It is bound to localhost, protected by a fresh session token, and excluded from the public build.

Saving is local. Run the tests, review the site, then commit and push approved content through GitHub. See `_docs/content-management.md` for the complete owner workflow, security model, and recovery steps.

## Add and optimize photographs

Content Studio automatically creates responsive WebP and AVIF sizes, a thumbnail and intrinsic metadata from owner-supplied images. Full-resolution working files stay local and are never included in the public build. For command-line ingestion, run `npm run images -- --input /path/to/photo.jpg --slug meaningful-name --alt "Useful description"`.

See `_docs/image-workflow.md` for the complete upload, quality, publishing and recovery workflow. Phase 11 measurements are recorded in `_docs/phase11-performance.md`.

## Deploy

The included GitHub Actions workflow publishes `dist/` to GitHub Pages when changes are pushed to `main`. In repository settings, set **Pages → Source** to **GitHub Actions** once. A custom domain can be configured in that same Pages settings screen and is independent of this source structure.

No committed keys, tokens, or environment variables are required. GitHub authorization remains the publishing boundary.
