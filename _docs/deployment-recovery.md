# Deployment and recovery

The production site is a static GitHub Pages deployment from `main`. GitHub Actions runs `npm ci`, the test suite, `npm run build`, and publishes `dist/` on every approved push.

Before publishing, run `npm ci`, `npm test`, and `npm run build`, then inspect `dist/` locally with `npm run start`. Never commit credentials, Content Studio session tokens, or original media files.

To recover a bad release, identify the last known-good commit in GitHub, create a new revert commit (or restore that source state in a reviewed branch), and push it to `main`. Actions will rebuild and redeploy; Git history remains the rollback record. If Pages is unavailable, check the workflow run and the Pages custom-domain setting before changing source files.

The local Content Studio is bound to `127.0.0.1`, writes source data only, and is never included in `dist/`. The enquiry form intentionally has no remote endpoint yet, so drafts remain in the browser until a delivery provider is separately approved.
