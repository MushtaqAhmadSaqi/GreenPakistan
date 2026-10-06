# Green Pakistan

Green Pakistan is a responsive single-page e-commerce prototype for plants,
reusable essentials, and grow-your-own products. It is designed around the
idea that sustainable habits should feel practical, welcoming, and easy to
start.

## Preview

The project is currently implemented as a static website in
[`index.html`](./index.html).

## Features

- Responsive storefront layout for desktop and mobile screens
- Editorial hero section with animated visual treatment
- Product catalogue with:
  - Category filters
  - Search
  - Price and name sorting
  - Grid/list view toggle (saved in `localStorage`)
  - Product information disclosures
- Demo shopping bag with:
  - Add, remove, and quantity controls
  - Persistent cart state through `localStorage`
  - Demo delivery calculation
  - Illustrative checkout preview
- Scroll progress indicator
- Sticky, scroll-aware navigation header
- Reveal-on-scroll and product interaction animations
- Newsletter signup demonstration
- Business plan section with print support
- Accessibility basics including:
  - Skip link
  - Keyboard focus states
  - Semantic labels
  - Reduced-motion support

## Running locally

No build tools or dependencies are required.

### Option 1: Open directly

Open `index.html` in a modern browser.

### Option 2: Use a local server

From the project directory, run any static file server. For example, with
Python:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Project structure

```text
.
├── index.html   # Site markup and inline SVG illustration symbols
├── styles.css   # Complete site styling
├── script.js    # Catalogue, cart, and interactive behavior
└── README.md    # Project documentation
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Inline SVG illustrations
- Browser `localStorage` for the demo shopping bag and catalog view preference

## Important prototype notes

This is a student/business concept prototype rather than a production commerce
system.

- Product prices are illustrative and shown in PKR.
- Product descriptions and supplier claims require verification.
- No real orders or payments are processed.
- Newsletter submissions are demonstrations only; no email is saved or sent.
- A production launch would require a secure backend, server-side price and
  stock validation, verified suppliers, shipping and returns policies, privacy
  information, and a payment or cash-on-delivery workflow.

## Customization

The main catalogue is defined in `script.js` in the
`products` array. Each product includes its name, category, price,
illustration reference, color, badge, and description.

The primary visual theme is defined at the top of `styles.css` in the CSS
`:root` variables, including the forest green, lime, cream, and neutral
surface colors.
