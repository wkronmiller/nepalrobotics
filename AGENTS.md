# Nepal Robotics Site

## Hosting and domain

- This is a public Vite/React site.
- Source repository: `https://github.com/wkronmiller/nepalrobotics`
- GitHub Pages deployment workflow: `.github/workflows/deploy-pages.yml`
- Intended production site: `https://nepalrobotics.org/`
- The `nepalrobotics.org` domain is managed through Squarespace DNS and is configured to point to GitHub Pages. DNS propagation may temporarily leave some resolvers serving the old Squarespace records.
- GitHub Pages is configured with the custom domain `nepalrobotics.org` and publishes from the `master` branch through GitHub Actions.
- The `www.nepalrobotics.org` hostname is configured as a CNAME to `wkronmiller.github.io` and should redirect to the apex domain after propagation.
- After DNS propagation, verify the GitHub Pages certificate and enable **Enforce HTTPS** in the repository Pages settings.
- GitHub Pages uses root-relative production assets (`VITE_BASE_PATH=/`) because the custom domain serves the site at `/`, not `/nepalrobotics/`.
- Do not remove or replace unrelated Squarespace DNS records such as MX/TXT records when changing web routing.

## Development and deployment

- Run `npm run build` to verify a production build locally.
- Changes pushed to `master` trigger the GitHub Pages workflow.
- The workflow builds with the public npm registry because the existing lockfile contains internal registry URLs unavailable to GitHub-hosted runners.
- GitHub Pages custom-domain configuration is managed in repository Settings → Pages; a committed `CNAME` file is not required for the GitHub Actions publishing workflow.
