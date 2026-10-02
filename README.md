# Patient Treatment Calculator

A two-screen React app for building a patient treatment/billing estimate under
one of two billing entities (Personal Injury Medical Center or Texas Personal
Injury Medical Center).

## Screens

**1. Billing setup** — pick which entity the bill is issued under (with its
logo), then accept the Terms & Conditions / Privacy Policy (tap either link
to open them in a modal) before continuing.

**2. Calculator** — branded with the selected entity's logo and address.
Each treatment row has both an **Original Amount** and an **Attorney Amount**
side by side. A discount (%) applies only to the Attorney Amount. Totals for
both are shown separately, never combined. A small "Terms & Privacy" button
in the corner reopens the same modal at any time. "Change billing entity"
returns to screen 1.

## Features
- Patient details: Name, Date of Birth, Referral Date
- Treatments/services dropdown (includes Miscellaneous, no longer includes
  Transport, Notary, Policy Limit, or Funder fees — see below), with
  Original Amount and Attorney Amount columns per row
- When a row's service is set to "Miscellaneous", a text field appears to
  describe what the item actually is
- Add / remove treatment rows
- **Additional charges panel** — Transport, Funder fees, Policy limit
  charges, and Notary charge are their own dedicated (optional) number
  fields, separate from the treatment dropdown. Whatever is entered flows
  automatically into the Original Amount
- **Automatic $10 service fee** added into the Original Amount for every
  treatment row that has a service selected
- **Automatic case duration charge** ($20/month) added into the Original
  Amount, calculated from how many days ago the Referral Date was (days ÷ 30,
  rounded up to the nearest month)
- Original Amount total (treatment subtotal + service fees + case duration
  charge + the four required additional charges) and Attorney Amount total,
  always shown separately from each other
- Discount (%) applied only to the Attorney Amount, with discount amount and
  the resulting Attorney Amount After Discount shown
- Terms & Conditions / Privacy Policy as an accessible tabbed accordion
  modal (ARIA roles for tabs, accordion headers, and dialog)
- Logos are transparent PNGs so they sit directly on the page background
- Light theme only (locked, ignores system dark mode)
- Print / Save as PDF, Clear button to reset the form

All amounts are displayed in US Dollars ($).

## Project structure
```
patient-treatment-calculator/
├── package.json
├── vite.config.js
├── index.html
├── .gitignore
├── README.md
└── src/
    ├── main.jsx
    ├── styles.css
    └── assets/
        ├── icon-tpimc.png
        └── icon-pimc.png
```

## Setup & run

1. Install [Node.js](https://nodejs.org/) (v18 or later recommended).
2. Open a terminal in this project folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Build for production
```
npm run build
```
This outputs a static, production-ready build in the `dist/` folder:
an `index.html` plus an `assets/` folder with a bundled JS file, a bundled CSS
file, and the two logo images — everything needed to run, with no server-side
code required.

## Customizing the service list
Edit the `SERVICE_LIST` array near the top of `src/main.jsx` to add, remove,
or rename treatment/service options.

## Customizing the automatic charges
Inside `CalculatorScreen` in `src/main.jsx`:
- `SERVICE_FEE` (default `10`) — the flat fee added per treatment row that
  has a service selected.
- `MONTHLY_CASE_RATE` (default `20`) — the monthly rate charged for how long
  it's been since the Referral Date (days ÷ 30, rounded up).

Change either constant to adjust the rate; both automatically flow into the
Original Amount total.

## Hosting inside WordPress

This app is a static single-page app (SPA) — there's no backend, so any of
these work. Pick based on how much control you have over your WordPress
hosting:

**Option A — Dedicated page/subfolder (recommended, cleanest)**
1. Run `npm run build`.
2. Upload the contents of `dist/` to a subfolder on your WordPress host via
   FTP or your host's File Manager, e.g. `yourdomain.com/calculator/`.
3. Link to that URL from a WordPress menu item or button, or embed it on a
   page using an "Iframe" block / the Custom HTML block:
   ```html
   <iframe src="https://yourdomain.com/calculator/" style="width:100%;height:900px;border:0;"></iframe>
   ```
   This keeps the app fully isolated from your WordPress theme's CSS, which
   avoids style conflicts.

**Option B — Embed directly into a page (no subfolder)**
1. Run `npm run build` and open the generated `dist/index.html` to find the
   hashed filenames of the built JS and CSS in `dist/assets/`.
2. Upload the whole `dist/assets/` folder (JS, CSS, and the two logo images)
   somewhere reachable, e.g. via the WordPress Media Library or a plugin
   like **WP File Manager**.
3. In a WordPress page, add a **Custom HTML** block containing:
   ```html
   <div id="root"></div>
   <link rel="stylesheet" href="/wp-content/uploads/calculator/assets/index-XXXX.css">
   <script type="module" src="/wp-content/uploads/calculator/assets/index-XXXX.js"></script>
   ```
   (replace the `XXXX` filenames and paths with your uploaded ones).
4. Because the app is self-contained React, it will mount into that `#root`
   div without affecting the rest of the page — but test thoroughly, since
   some themes/plugins load their own conflicting scripts.

**Option C — Simplest, no build step at all**
If you don't want to run `npm run build` yourself, ask and a single
self-contained `.html` file (React loaded from a CDN, no bundler needed) can
be generated instead — just paste its contents into a Custom HTML block or
upload it directly and link to it. This is the least "proper" option for a
growing codebase, but it's the fastest to get live.
