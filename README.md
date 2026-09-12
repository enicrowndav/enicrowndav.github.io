# Olanrewaju Eniade — Professional Portfolio

A responsive portfolio for biostatistics, data science, health research and consulting. The site is plain HTML, CSS and JavaScript, with no runtime framework, backend, tracking scripts or external font requests. GitHub Pages can host it with a custom domain.

## Open locally

Double-click **Open Portfolio.cmd**, or open `index.html` in your browser. All primary content and interactions work locally. To preview the exact published build, use Node.js 22 or newer:

```powershell
npm run build
npm run check
npm run preview
```

Visit `http://127.0.0.1:4173`. Stop the preview with Ctrl+C.

## What is included

- Personal introduction, institutional portrait, research interests and qualifications.
- Three selected project features, six linked publications with topic filters, and a dated career history.
- Four consulting service areas with enquiry shortcuts.
- Project enquiry builder: validates input, previews an email and lets the visitor open their mail app or copy the message. It does **not** send mail, store enquiries or falsely claim a message was sent.
- Mobile navigation, keyboard support, focus states, reduced-motion support, no-JavaScript content, print styles, local fonts and a sharing image.
- Search metadata, Person structured data, sitemap, robots file, custom 404 page and GitHub Pages deployment workflow.
- Public content provenance in `CONTENT-SOURCES.md`.

## Edit your portfolio

| File | Purpose |
| --- | --- |
| `index.html` | Biography, project cards, services, experience, education and publications |
| `styles.css` | Colours, typography, layout and responsive styles |
| `app.js` | Navigation, publication filters, email enquiry and clipboard behaviour |
| `site.config.json` | Public email, published URL, optional custom domain and CV path |
| `assets/olanrewaju-eniade.jpg` | Your portrait |

`npm run build` applies the email, website URL and CV settings to the published files. When changing the source email for direct-file previews, also change the fallback address in `app.js` and `index.html`. The optional profile URL fields in the config are reference settings; the actual public profile links live in `index.html`.

### Add a CV

The initial CV attachment was unavailable; there is no placeholder download. Put your approved public PDF at `assets/olanrewaju-eniade-cv.pdf` and set `cvPath` in `site.config.json` to that relative path. Rebuild to reveal the download link. Only place files intended for public access in `assets/`.

### Update the sharing image

Edit `scripts/social-card.html` and run:

```powershell
npm ci
node scripts/create-sharing-assets.mjs
npm run build
```

On Windows the script uses installed Chrome. On other systems, first run `npx playwright install chromium`. An alternative Chrome path can be supplied through `CHROME_PATH`.

## Publish and connect a domain

See **DEPLOYMENT.md** for GitHub Pages setup and DNS records. The workflow publishes only the `dist/` allowlist, not source notes, scripts, local research downloads, or development files. Website content is intended to be public.

## Validation

```powershell
npm ci
npm run build
npm run check
npm test
```

Browser tests check desktop/mobile widths, local-file use, a repository subpath, mobile menu, publication filters, enquiry validation/encoding/copy controls, no-JavaScript behaviour, and automated accessibility rules. Browser-test reports and screenshots are saved in the ignored `.artifacts/` directory. They do not replace manual review of scientific content or the supplied CV.
