# SupplierScore

A dependency-free supplier quotation calculator for Navodyakithma. Enter comparable quotations, adjust price/delivery/quality weights, optionally exclude late suppliers from recommendations, and export a transparent CSV comparison.

Open `index.html` directly in a modern browser. No installation, account, backend, database, analytics or SAP credentials are required. Quotations remain in the current page memory and are lost on reload; download the CSV to keep results. The example button loads clearly labelled fictional quotations.

## Calculation

- Price: lowest entered price / supplier price × 100.
- Delivery: fastest entered days / supplier days × 100.
- Quality: user-entered score out of 100.
- Total: weighted sum using weights normalized to 100%.
- Late suppliers remain scored but sort after eligible suppliers. All quotes establish the price/delivery baselines. Equal scores share a rank. No supplier is recommended if all are late.

Use identical currency, quantities, tax treatment, scope and destination. Currency selection is a display label, not conversion. This is a decision-support calculator, not a live SAP module; it does not place orders, verify quality or persist approval records.

## Validation

With an existing Node.js installation: `node --test test/scoring.test.cjs`. There are no dependencies to download. Covers weighting, deadline eligibility, ties, validation and CSV formula escaping.

## GitHub Pages

Publish the `main` branch, root directory, in repository Settings → Pages. Static files are `index.html`, `styles.css`, `scoring.js`, and `app.js`.

Optional WebMCP exposes a read-only current-ranking tool in supporting browsers; ordinary browsers work without it.
