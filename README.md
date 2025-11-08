# EAI Conference Deadline Dashboard

This repository hosts a lightweight static site that renders a real-time countdown to the next
submission deadline for the following conferences: **ICRA, IROS, CoRL, ICLR, and RSS**. The site
is built with vanilla HTML, CSS, and JavaScript, and ships with a single JSON file that keeps all
deadline metadata in one place for easy updates.

## Project structure

```
.
├── index.html          # Page shell and markup
├── styles.css          # Styling (CSS variables + responsive layout)
├── script.js           # Fetches JSON data and updates the countdowns once per second
└── data
    └── conferences.json  # Conference metadata and deadlines (edit this first)
```

## Running locally

You can open `index.html` directly in a browser, but using a local server keeps the fetch request
for `data/conferences.json` happy:

```bash
cd EAI_Conference_DDL
python3 -m http.server 8000
# then visit http://localhost:8000 in your browser
```

## Updating deadlines

1. Open `data/conferences.json`.
2. Update each object with the latest information (deadline ISO string, notes, link, etc.).
3. Save, refresh the browser, and the timers will automatically reflect the new values.

> **Tip:** Keep the `deadline` values in ISO 8601 format (`YYYY-MM-DDTHH:MM:SS±HH:MM`) so the script
> can parse the timestamps reliably across timezones.

## Publishing to GitHub Pages

1. Create a GitHub repository (for example, `EAI_Conference_DDL`) and push this project to the `main`
   branch.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and the
   `/ (root)` folder, then click **Save**.
4. GitHub will provision `https://<your-username>.github.io/EAI_Conference_DDL/` in a minute or two.
5. Edit the “View on GitHub” button in `index.html` so it points to your actual repository URL.

Once Pages is enabled, every push to `main` automatically refreshes the live site.
