# Phase 10 content-management architecture

## Chosen approach

Crafted Media uses a local, Git-backed Content Studio while the public website remains on GitHub Pages. Run `npm run admin`, open the private loopback URL printed in the terminal, edit content, save, test, and publish through the existing Git workflow.

This is a deliberate V1 architecture:

- Cost: ₹0 additional platform cost.
- Hosting: no migration; GitHub Pages and the custom domain stay unchanged.
- Authorization: the server listens only on `127.0.0.1`, generates a new 256-bit session token every time, requires that token for every read/write/upload API call, rejects cross-origin writes, and sends restrictive browser security headers.
- Publishing control: saving updates local source files only. GitHub access controls who may push, and Git history provides review, rollback, and an audit trail.
- Public exposure: `_content-studio/` and `_docs/` are excluded from `dist/` and from GitHub Pages' secondary Jekyll build. No editor, write API, token, credential, or secret is deployed to the website.
- Vendor lock-in: none. Content stays in the repository's portable JavaScript data modules.

The tradeoff is that the owner needs a local clone, Node.js 20+, and GitHub push access. A browser editor usable from any device would require an authenticated Git-based/headless CMS or serverless backend. That is a separate architecture and cost decision; Phase 10 does not silently enroll the project in one.

## Owner workflow

1. Pull the latest `main` branch.
2. Run `npm run admin`.
3. Open the exact private URL printed in the terminal. Do not share it while the Studio is running.
4. Edit categories, albums, photos, films, testimonials, About/team, homepage features, or contact/social links.
5. Keep new or incomplete work in **Draft** or **Hidden**. Only **Published** content appears publicly.
6. Choose **Save changes**. Invalid slugs, relationships, URLs, states, and required fields are rejected before files are replaced.
7. In another terminal, run `npm test && npm run build`.
8. Review the local site with `npm start`.
9. Commit and push the approved files to `main`; GitHub Actions publishes the update.
10. Stop Content Studio with Ctrl+C.

## Managed content

- Portfolio categories: create, rename, reorder, cover, status.
- Albums: create, rename, move between categories, reorder, cover, status.
- Album photos: add by repository path, replace, reorder, remove, captions, alt text, layout and responsive metadata.
- Images: copy an owner's JPG, PNG, WebP or AVIF (up to 20 MB) into `assets/uploads/`. Phase 11 will add automatic derivatives and compression.
- Films: create, edit, reorder, hide/show, local video paths and approved HTTPS destinations/embeds.
- Homepage: choose up to three featured portfolio categories.
- Testimonials: create, edit, reorder and control publishing status.
- About and Team: founder fields and team cards.
- Contact/social: phone, WhatsApp, email, Instagram and form endpoint. HTTPS is required for external URLs.

## Recovery

Content changes are ordinary Git changes. Before pushing, discard or amend them with your normal Git workflow. After pushing, revert the content commit and push the revert. Uploaded files that are not committed never reach the live website.

## Security boundaries

The Studio is not intended to be exposed through port forwarding, a public server, or GitHub Pages. Its session token is temporary authentication for the loopback service; GitHub remains the production authorization and publishing boundary. Never put personal access tokens, API keys, passwords, or service secrets into managed content.
