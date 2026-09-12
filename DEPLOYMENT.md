# GitHub Pages and your domain

The intended personal-site repository is `enicrowndav/enicrowndav.github.io`, with the shareable URL **https://enicrowndav.github.io/**. This document describes the setup; confirm live publication using GitHub's Pages deployment status.

## GitHub hosting

1. Put this project in your public `enicrowndav.github.io` repository on the `main` branch.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build source.
3. The included **Publish portfolio to GitHub Pages** workflow builds, checks and deploys the site after each push to `main`. The initial workflow can also be run manually from the Actions tab.
4. Wait for the deployment job to succeed and visit https://enicrowndav.github.io/.

The website does not need paid application hosting or a running Python/Node server. Node is used only to build the static files.

If using a different repository such as `portfolio`, change `siteUrl` to `https://enicrowndav.github.io/portfolio/`. All asset paths are relative, and the build updates canonical metadata and the sitemap.

## Connect a domain you own

No domain has been guessed or configured. Once you choose one:

1. In GitHub account **Settings → Pages**, verify ownership of the domain using GitHub's supplied TXT record.
2. In repository **Settings → Pages → Custom domain**, enter your preferred domain and save it.
3. At your domain provider, add the records below. Replace `yourdomain.com` with your real domain. Preserve unrelated email and other service records.

| Type | Host/name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | enicrowndav.github.io |

The CNAME value is only the host name: no `https://` and no repository path. For a subdomain such as `profile.yourdomain.com`, use a CNAME with host `profile` pointing to `enicrowndav.github.io` instead of changing the apex A records.

4. Set `customDomain` in `site.config.json` to `yourdomain.com` (or your chosen subdomain), then push. The build updates the canonical URL, social metadata, sitemap, 404 link and output CNAME file. For a custom Actions workflow, the repository Pages custom-domain setting remains authoritative; the CNAME file alone does not configure it.
5. Wait for DNS verification and the certificate to finish, then enable **Enforce HTTPS** in GitHub Pages settings.
6. Open the site on the custom domain, test its links, and share that address. DNS changes can take up to 24 hours to propagate.

## Current official documentation

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Managing a custom domain and DNS records](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Verifying a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

Documentation and IPv4 records checked on 12 September 2026.
