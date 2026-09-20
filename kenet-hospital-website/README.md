# Kenet Group Medical Service Limited website

A responsive, accessible static website created from the hospital summary and photographs supplied on 20 September 2026.

## Preview

Double-click `Open Kenet Website.cmd`, or open `index.html` directly in a browser.

For a local HTTP preview from this folder:

```powershell
python -m http.server 4174
```

Then visit `http://localhost:4174`.

## Before launch

The supplied source document did not contain a phone number, email address, street address, appointment channel, or social links. Add these verified details before publishing. The appointment form currently validates and prepares a request locally; it deliberately does not transmit patient information.

The website is ready for static hosting such as GitHub Pages, Cloudflare Pages or Netlify. All assets are local and there is no build step.

## Source notes

- Hospital facts and service descriptions: `SUMMARY OF KENET GROUP MEDICAL SERVICE LIMITED ACTIVITIES.docx`
- Photography: supplied Kenet Group Hospital photographs
- `CONTENT-SOURCES.md` records the exact content boundary and launch checklist.
