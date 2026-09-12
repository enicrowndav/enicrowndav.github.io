# Validation record

The initial portfolio build was checked using local Google Chrome through Playwright and axe-core.

## Passed

- Static build, expected assets, unique HTML IDs and internal anchor targets.
- Desktop and mobile layouts at widths of 320, 390, 768, 1024 and 1440 pixels, with no horizontal overflow.
- Real portrait and local font loading; desktop and mobile screenshots visually reviewed.
- Mobile navigation: open, close, Escape key and section selection.
- Publication filters: six total publications, four statistical-methods, three infectious-disease and four population-health matches. Publications may belong to multiple topics.
- Service shortcuts correctly select the relevant enquiry category.
- Form rejects empty fields, whitespace-only content and invalid email input through native validation; enquiry preview safely displays text and correctly encodes the email subject and body.
- Email copy, enquiry copy fallback, dialog dismissal and retained form inputs.
- Zero automated WCAG A/AA rule violations in the tested desktop, mobile and enquiry-dialog states. Automated checks are not a certification of full accessibility compliance.
- Mobile navigation, publication content and direct email remain available when JavaScript is disabled.
- Assets and interactions work under a repository subpath (`/portfolio/`) as well as a site root.
- Direct-file launch supports the portfolio interactions without a server.
- No browser page errors or failed asset responses in the completed browser checks.

## Scope and limits

- The enquiry builder prepares an email; it does not send email or collect messages on a server. Delivery by a visitor's email provider is outside this site's control.
- Publication links and career content are supported by the sources in `CONTENT-SOURCES.md`. No current CV was available for reconciliation.
- Research project descriptions do not certify performance or clinical readiness.
- Custom-domain DNS and HTTPS must be checked once the owner supplies the chosen domain.

## Reproduce

Run `npm ci`, `npm run build`, `npm run check` and `npm test`. Windows tests use installed Chrome; other systems can use `npx playwright install chromium` first. Detailed test output and screenshots are written to the ignored `.artifacts/` directory.
