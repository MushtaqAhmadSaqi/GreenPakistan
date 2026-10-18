/**
 * ReGongches — Threads of Mountain Heritage
 * Catalogue, Regional Provenance, Lookbook, Reviews & Editorial Data (data/products.js)
 * ============================================================================
 * Preserves all 16 products, prices, SKUs, and policies from the source archive,
 * while enriching SVG fallbacks, 3D-styled trust/state icons, themed rails,
 * 4-Step Authenticity Promise, and interactive 7-District GB map coordinates.
 */

'use strict';

/* ── 1. BESPOKE 3D-TACTILE SVG BADGE GENERATOR (Inspired by 3dicons.co CC0) ──
 * Produces lightweight (<3 KB), brand-tinted 3D-shaded SVG icons for trust
 * badges, empty cart, order confirmation, and the 404 page.
 */
function create3DIconSvg(type = 'gift') {
  const defs = `
    <defs>
      <linearGradient id="gold3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F2D58B"/>
        <stop offset="50%" stop-color="#C59A3D"/>
        <stop offset="100%" stop-color="#8A661D"/>
      </linearGradient>
      <linearGradient id="slate3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#366E8A"/>
        <stop offset="55%" stop-color="#214C63"/>
        <stop offset="100%" stop-color="#112836"/>
      </linearGradient>
      <linearGradient id="apricot3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F0A586"/>
        <stop offset="55%" stop-color="#D97B54"/>
        <stop offset="100%" stop-color="#7A263A"/>
      </linearGradient>
      <linearGradient id="ivory3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="65%" stop-color="#F5EDE0"/>
        <stop offset="100%" stop-color="#D8C4A8"/>
      </linearGradient>
      <filter id="softDrop" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#0E202B" flood-opacity="0.28"/>
      </filter>
    </defs>
  `;

  let body = '';
  if (type === 'truck') {
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="78" rx="32" ry="6" fill="#0E202B" opacity="0.18"/>
        <rect x="12" y="28" width="44" height="34" rx="7" fill="url(#slate3d)"/>
        <path d="M56 38 H74 L84 50 V62 H56 Z" fill="url(#gold3d)"/>
        <rect x="60" y="42" width="14" height="10" rx="2" fill="url(#ivory3d)"/>
        <rect x="18" y="34" width="32" height="4" rx="2" fill="url(#gold3d)" opacity="0.8"/>
        <circle cx="28" cy="64" r="9" fill="url(#apricot3d)" stroke="#F5EDE0" stroke-width="2.5"/>
        <circle cx="70" cy="64" r="9" fill="url(#apricot3d)" stroke="#F5EDE0" stroke-width="2.5"/>
      </g>
    `;
  } else if (type === 'shield') {
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="80" rx="26" ry="5" fill="#0E202B" opacity="0.18"/>
        <path d="M48 12 L78 24 V46 C78 64 64 76 48 82 C32 76 18 64 18 46 V24 Z" fill="url(#slate3d)" stroke="url(#gold3d)" stroke-width="2.5"/>
        <path d="M48 20 L70 29 V45 C70 58 59 68 48 73 C37 68 26 58 26 45 V29 Z" fill="url(#gold3d)" opacity="0.22"/>
        <path d="M36 47 L44 55 L61 37" fill="none" stroke="url(#gold3d)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  } else if (type === 'chat') {
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="80" rx="28" ry="5" fill="#0E202B" opacity="0.18"/>
        <rect x="14" y="18" width="54" height="40" rx="14" fill="url(#slate3d)"/>
        <path d="M26 58 L20 70 L36 58 Z" fill="url(#slate3d)"/>
        <rect x="32" y="32" width="48" height="34" rx="12" fill="url(#gold3d)"/>
        <path d="M68 66 L74 75 L58 66 Z" fill="url(#gold3d)"/>
        <circle cx="46" cy="49" r="3.2" fill="#172F3D"/>
        <circle cx="56" cy="49" r="3.2" fill="#172F3D"/>
        <circle cx="66" cy="49" r="3.2" fill="#172F3D"/>
      </g>
    `;
  } else if (type === 'bag') {
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="82" rx="30" ry="6" fill="#0E202B" opacity="0.18"/>
        <path d="M34 30 C34 16 62 16 62 30" fill="none" stroke="url(#gold3d)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M20 30 H76 L72 74 C71 78 67 80 62 80 H34 C29 80 25 78 24 74 Z" fill="url(#slate3d)" stroke="url(#gold3d)" stroke-width="1.5"/>
        <polygon points="48,42 58,54 48,66 38,54" fill="url(#apricot3d)" stroke="url(#gold3d)" stroke-width="1.5"/>
        <circle cx="48" cy="54" r="3.5" fill="url(#ivory3d)"/>
      </g>
    `;
  } else if (type === 'check') {
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="82" rx="28" ry="5" fill="#0E202B" opacity="0.18"/>
        <circle cx="48" cy="45" r="30" fill="url(#slate3d)" stroke="url(#gold3d)" stroke-width="3"/>
        <circle cx="48" cy="45" r="22" fill="url(#gold3d)" opacity="0.2"/>
        <path d="M35 46 L44 55 L62 35" fill="none" stroke="url(#gold3d)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  } else if (type === 'compass') {
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="82" rx="30" ry="5" fill="#0E202B" opacity="0.18"/>
        <circle cx="48" cy="45" r="31" fill="url(#slate3d)" stroke="url(#gold3d)" stroke-width="3"/>
        <circle cx="48" cy="45" r="24" fill="none" stroke="url(#ivory3d)" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
        <polygon points="48,21 55,45 48,51 41,45" fill="url(#apricot3d)"/>
        <polygon points="48,69 55,45 48,39 41,45" fill="url(#ivory3d)"/>
        <circle cx="48" cy="45" r="4" fill="url(#gold3d)"/>
      </g>
    `;
  } else {
    // 'gift' default
    body = `
      <g filter="url(#softDrop)">
        <ellipse cx="48" cy="80" rx="30" ry="5" fill="#0E202B" opacity="0.18"/>
        <rect x="20" y="38" width="56" height="36" rx="6" fill="url(#slate3d)" stroke="url(#gold3d)" stroke-width="1.5"/>
        <rect x="16" y="28" width="64" height="12" rx="4" fill="url(#apricot3d)" stroke="url(#gold3d)" stroke-width="1.5"/>
        <rect x="43" y="28" width="10" height="46" fill="url(#gold3d)"/>
        <path d="M48 28 C34 14 26 24 44 28 C62 24 58 14 48 28 Z" fill="none" stroke="url(#gold3d)" stroke-width="4" stroke-linecap="round"/>
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 90" width="96" height="90">${defs}${body}</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ── 2. BESPOKE 3-ANGLE STUDIO PRODUCT SVG GENERATOR ─────────────────────── */
function createProductSvg(config) {
  const {
    bg1 = '#1B3B4E',
    bg2 = '#214C63',
    accent = '#C59A3D',
    secondary = '#7A263A',
    garment = '#E8D8BF',
    region = 'Gilgit-Baltistan',
    title = 'Heritage Textile',
    subtitle = 'Handcrafted Origin',
    type = 'cap',
    view = 1
  } = config;

  let centerArt = '';

  if (view === 2) {
    centerArt = `
      <g transform="translate(200, 235)">
        <rect x="-125" y="-125" width="250" height="250" rx="14" fill="${garment}" opacity="0.12" stroke="${accent}" stroke-width="1.5"/>
        <rect x="-108" y="-108" width="216" height="216" rx="10" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="6 4" opacity="0.7"/>
        <g stroke="${garment}" stroke-width="1.2" opacity="0.28">
          <line x1="-100" y1="-80" x2="100" y2="-80"/>
          <line x1="-100" y1="-40" x2="100" y2="-40"/>
          <line x1="-100" y1="0" x2="100" y2="0"/>
          <line x1="-100" y1="40" x2="100" y2="40"/>
          <line x1="-100" y1="80" x2="100" y2="80"/>
          <line x1="-80" y1="-100" x2="-80" y2="100"/>
          <line x1="-40" y1="-100" x2="-40" y2="100"/>
          <line x1="0" y1="-100" x2="0" y2="100"/>
          <line x1="40" y1="-100" x2="40" y2="100"/>
          <line x1="80" y1="-100" x2="80" y2="100"/>
        </g>
        <polygon points="0,-78 22,-22 78,0 22,22 0,78 -22,22 -78,0 -22,-22" fill="${secondary}" stroke="${accent}" stroke-width="2.5"/>
        <polygon points="0,-46 46,0 0,46 -46,0" fill="${accent}" opacity="0.9"/>
        <circle cx="0" cy="0" r="16" fill="${bg1}" stroke="${garment}" stroke-width="2"/>
        <circle cx="0" cy="0" r="6" fill="${accent}"/>
        <circle cx="-68" cy="-68" r="10" fill="none" stroke="${accent}" stroke-width="2"/>
        <circle cx="68" cy="-68" r="10" fill="none" stroke="${accent}" stroke-width="2"/>
        <circle cx="-68" cy="68" r="10" fill="none" stroke="${accent}" stroke-width="2"/>
        <circle cx="68" cy="68" r="10" fill="none" stroke="${accent}" stroke-width="2"/>
      </g>
      <text x="200" y="405" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="13" font-style="italic" letter-spacing="1.5">MACRO WEAVE &amp; MOTIF STUDY</text>
    `;
  } else if (view === 3) {
    centerArt = `
      <g transform="translate(200, 230)">
        <rect x="-115" y="-85" width="230" height="170" rx="10" fill="#172833" stroke="${accent}" stroke-width="2"/>
        <rect x="-103" y="-73" width="206" height="146" rx="6" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.5"/>
        <line x1="-115" y1="0" x2="115" y2="0" stroke="${accent}" stroke-width="10" opacity="0.85"/>
        <line x1="0" y1="-85" x2="0" y2="85" stroke="${accent}" stroke-width="10" opacity="0.85"/>
        <circle cx="0" cy="0" r="28" fill="${secondary}" stroke="${accent}" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="21" fill="none" stroke="${garment}" stroke-width="0.8" stroke-dasharray="3 2"/>
        <text x="0" y="6" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="18" font-weight="bold">R</text>
        <rect x="28" y="26" width="95" height="52" rx="4" fill="#F7F1E7" stroke="${accent}" stroke-width="1.2"/>
        <text x="75" y="46" text-anchor="middle" fill="#214C63" font-family="sans-serif" font-size="8" font-weight="bold" letter-spacing="1">ORIGIN VERIFIED</text>
        <text x="75" y="62" text-anchor="middle" fill="#7A263A" font-family="Georgia, serif" font-size="10" font-style="italic">${region}</text>
      </g>
      <text x="200" y="405" text-anchor="middle" fill="${garment}" font-family="Georgia, serif" font-size="13" font-style="italic" letter-spacing="1.2">ARCHIVE PACKAGING &amp; STORY CARD</text>
    `;
  } else {
    if (type === 'cap') {
      centerArt = `
        <g transform="translate(200, 235)">
          <circle cx="0" cy="0" r="115" fill="${accent}" opacity="0.08"/>
          <circle cx="0" cy="0" r="95" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3" stroke-dasharray="4 4"/>
          <path d="M-88,18 C-92,-55 -48,-82 0,-82 C48,-82 92,-55 88,18 Z" fill="${garment}" stroke="${accent}" stroke-width="2"/>
          <path d="M-55,-65 Q-20,-35 -40,15" fill="none" stroke="${bg1}" stroke-width="1.5" opacity="0.35"/>
          <path d="M0,-80 Q10,-35 0,15" fill="none" stroke="${bg1}" stroke-width="1.5" opacity="0.35"/>
          <path d="M52,-65 Q25,-35 42,15" fill="none" stroke="${bg1}" stroke-width="1.5" opacity="0.35"/>
          <rect x="-98" y="8" width="196" height="44" rx="22" fill="${garment}" stroke="${accent}" stroke-width="2.2"/>
          <path d="M-86,30 L86,30" stroke="${secondary}" stroke-width="3" stroke-dasharray="8 5" opacity="0.8"/>
          <path d="M48,10 Q72,-35 58,-68 Q40,-40 44,10 Z" fill="${accent}" opacity="0.9"/>
          <circle cx="46" cy="12" r="6" fill="${secondary}" stroke="${accent}" stroke-width="1.5"/>
        </g>
      `;
    } else if (type === 'shawl') {
      centerArt = `
        <g transform="translate(200, 230)">
          <circle cx="0" cy="0" r="118" fill="${accent}" opacity="0.08"/>
          <path d="M-82,-92 L82,-92 L96,78 L-96,78 Z" fill="${garment}" stroke="${accent}" stroke-width="2"/>
          <path d="M-55,-92 L-38,78 M45,-92 L62,78" stroke="${bg1}" stroke-width="1.4" opacity="0.22"/>
          <rect x="-86" y="34" width="172" height="26" fill="${secondary}" opacity="0.92"/>
          <path d="M-78,47 L-66,39 L-54,47 L-42,39 L-30,47 L-18,39 L-6,47 L6,39 L18,47 L30,39 L42,47 L54,39 L66,47 L78,39" fill="none" stroke="${accent}" stroke-width="2"/>
          <rect x="-82" y="-76" width="164" height="10" fill="${accent}" opacity="0.65"/>
          <g stroke="${garment}" stroke-width="2" opacity="0.85">
            <line x1="-84" y1="78" x2="-84" y2="98"/><line x1="-70" y1="78" x2="-70" y2="98"/>
            <line x1="-56" y1="78" x2="-56" y2="98"/><line x1="-42" y1="78" x2="-42" y2="98"/>
            <line x1="-28" y1="78" x2="-28" y2="98"/><line x1="-14" y1="78" x2="-14" y2="98"/>
            <line x1="0" y1="78" x2="0" y2="98"/><line x1="14" y1="78" x2="14" y2="98"/>
            <line x1="28" y1="78" x2="28" y2="98"/><line x1="42" y1="78" x2="42" y2="98"/>
            <line x1="56" y1="78" x2="56" y2="98"/><line x1="70" y1="78" x2="70" y2="98"/>
            <line x1="84" y1="78" x2="84" y2="98"/>
          </g>
        </g>
      `;
    } else if (type === 'waistcoat' || type === 'robe') {
      centerArt = `
        <g transform="translate(200, 232)">
          <circle cx="0" cy="0" r="118" fill="${accent}" opacity="0.08"/>
          <path d="M-48,-95 L-18,-95 L0,-62 L18,-95 L48,-95 L88,-52 L72,92 L-72,92 L-88,-52 Z" fill="${garment}" stroke="${accent}" stroke-width="2.2"/>
          <line x1="0" y1="-62" x2="0" y2="92" stroke="${secondary}" stroke-width="3"/>
          <rect x="-54" y="-42" width="34" height="96" rx="4" fill="none" stroke="${secondary}" stroke-width="1.8" stroke-dasharray="5 3"/>
          <rect x="20" y="-42" width="34" height="96" rx="4" fill="none" stroke="${secondary}" stroke-width="1.8" stroke-dasharray="5 3"/>
          <circle cx="-37" cy="-16" r="9" fill="${accent}"/><circle cx="-37" cy="18" r="9" fill="${secondary}"/>
          <circle cx="37" cy="-16" r="9" fill="${accent}"/><circle cx="37" cy="18" r="9" fill="${secondary}"/>
          <circle cx="0" cy="-35" r="4" fill="${accent}"/><circle cx="0" cy="-10" r="4" fill="${accent}"/>
          <circle cx="0" cy="15" r="4" fill="${accent}"/><circle cx="0" cy="40" r="4" fill="${accent}"/>
        </g>
      `;
    } else if (type === 'accessory') {
      centerArt = `
        <g transform="translate(200, 235)">
          <circle cx="0" cy="0" r="112" fill="${accent}" opacity="0.08"/>
          <path d="M-46,-35 C-46,-98 46,-98 46,-35" fill="none" stroke="${accent}" stroke-width="5"/>
          <path d="M-84,-35 L84,-35 L74,78 C74,88 64,92 54,92 L-54,92 C-64,92 -74,88 -74,78 Z" fill="${garment}" stroke="${accent}" stroke-width="2.2"/>
          <rect x="-64" y="-14" width="128" height="76" rx="6" fill="${secondary}" opacity="0.9"/>
          <polygon points="0,-4 26,24 0,52 -26,24" fill="${accent}"/>
          <polygon points="-42,10 -26,24 -42,38 -58,24" fill="${garment}" opacity="0.85"/>
          <polygon points="42,10 58,24 42,38 26,24" fill="${garment}" opacity="0.85"/>
        </g>
      `;
    } else {
      centerArt = `
        <g transform="translate(200, 235)">
          <circle cx="0" cy="0" r="116" fill="${accent}" opacity="0.1"/>
          <rect x="-86" y="-42" width="172" height="122" rx="8" fill="${garment}" stroke="${accent}" stroke-width="2.2"/>
          <rect x="-94" y="-68" width="188" height="32" rx="6" fill="${secondary}" stroke="${accent}" stroke-width="2.2"/>
          <rect x="-12" y="-68" width="24" height="148" fill="${accent}" opacity="0.9"/>
          <path d="M0,-68 C-38,-102 -56,-68 -8,-68 C56,-68 38,-102 0,-68 Z" fill="none" stroke="${accent}" stroke-width="5"/>
          <circle cx="0" cy="-8" r="18" fill="${secondary}" stroke="${garment}" stroke-width="2"/>
          <text x="0" y="-2" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="14" font-weight="bold">RG</text>
        </g>
      `;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 24" fill="none" stroke="${accent}" stroke-width="0.6" opacity="0.12"/>
      </pattern>
    </defs>
    <rect width="400" height="500" fill="url(#bg)"/>
    <rect width="400" height="500" fill="url(#grid)"/>
    <rect x="18" y="18" width="364" height="464" rx="10" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
    <rect x="26" y="26" width="348" height="448" rx="6" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.2"/>
    <text x="200" y="54" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-size="10" font-weight="700" letter-spacing="3">${region.toUpperCase()} ORIGIN</text>
    <line x1="150" y1="64" x2="250" y2="64" stroke="${accent}" stroke-width="1" opacity="0.45"/>
    ${centerArt}
    <text x="200" y="440" text-anchor="middle" fill="#F7F1E7" font-family="Georgia, serif" font-size="16" font-weight="600">${title}</text>
    <text x="200" y="460" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-size="10" letter-spacing="1.8" opacity="0.9">${subtitle.toUpperCase()}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ── 3. BRAND LOGO SVG FALLBACKS ─────────────────────────────────────────── */
const BRAND_LOGO_DARK_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 54" width="220" height="54">
  <rect x="2" y="7" width="40" height="40" rx="8" fill="#214C63" stroke="#C59A3D" stroke-width="1.5"/>
  <polygon points="22,13 35,37 9,37" fill="none" stroke="#C59A3D" stroke-width="1.5" opacity="0.45"/>
  <text x="22" y="34" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#C59A3D">R</text>
  <text x="54" y="29" font-family="Georgia, serif" font-size="23" font-weight="700" fill="#214C63" letter-spacing="0.5">ReGongches</text>
  <text x="55" y="43" font-family="sans-serif" font-size="7.5" font-weight="600" fill="#7A263A" letter-spacing="2.2">MOUNTAIN HERITAGE · GB</text>
</svg>`);

const BRAND_LOGO_LIGHT_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 54" width="220" height="54">
  <rect x="2" y="7" width="40" height="40" rx="8" fill="#C59A3D"/>
  <text x="22" y="34" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#172F3D">R</text>
  <text x="54" y="29" font-family="Georgia, serif" font-size="23" font-weight="700" fill="#F7F1E7" letter-spacing="0.5">ReGongches</text>
  <text x="55" y="43" font-family="sans-serif" font-size="7.5" font-weight="600" fill="#C59A3D" letter-spacing="2.2">MOUNTAIN HERITAGE · GB</text>
</svg>`);

/* ── 4. 3D ICON MAP FOR UI STATES & TRUST STRIPS ────────────────────────── */
const ICONS_3D = {
  truck: create3DIconSvg('truck'),
  gift: create3DIconSvg('gift'),
  shield: create3DIconSvg('shield'),
  chat: create3DIconSvg('chat'),
  bag: create3DIconSvg('bag'),
  check: create3DIconSvg('check'),
  compass: create3DIconSvg('compass')
};

/* ── 5. PRODUCT CATALOGUE (16 CURATED ITEMS) ─────────────────────────────── */
const PRODUCTS = [
  /* ── HEADWEAR ── */
  {
    id: 'gilgiti-wool-cap-01',
    sku: 'RG-GIL-101',
    name: 'Traditional Gilgiti Pakol Cap',
    category: 'Headwear',
    region: 'Gilgit',
    price: 1800,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 4.9,
    reviewCount: 64,
    leadTime: 'Dispatches within 24 hours',
    weight: '165g · 100% Highland Sheep Wool',
    warmthLevel: 'High-Altitude Winter',
    originVillage: 'Punial & Gilgit Artisan Guild',
    craftTechnique: 'Hand-fulled wool & traditional rolled brim',
    artisanName: 'Ustad Ghulam Abbas Collective [ARTISAN NAME VERIFIED PLACEHOLDER]',
    highlights: [
      'Pure undyed highland wool with breathable soft inner band',
      'Adjustable rolled brim adapts to weather and head circumference',
      'Accompanied by a numbered Gilgit origin verification card'
    ],
    materials: 'Pure wool, natural dye. Outer shell 100% highland sheep wool; soft brushed cotton-wool inner forehead band.',
    care: 'Hand wash cold in mild wool detergent. Reshape while damp and air dry flat in shade. Do not tumble dry.',
    sizes: ['S/M (56–58 cm)', 'L/XL (59–61 cm)', 'One Size'],
    colors: [
      { label: 'Natural Oatmeal', hex: '#C8B89A' },
      { label: 'Charcoal Grey',   hex: '#4A4A4A' },
      { label: 'Mountain Brown',  hex: '#7A5C3A' }
    ],
    images: [
      'assets/images/gilgiti-wool-cap.webp',
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Gilgit', title: 'Gilgiti Pakol Cap', subtitle: 'Weave & Brim Detail', type: 'cap', view: 2 }),
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Gilgit', title: 'Gilgiti Pakol Cap', subtitle: 'Origin Story Card', type: 'cap', view: 3 })
    ],
    imageAlts: [
      'Traditional Gilgiti Pakol Cap in hand-fulled natural oatmeal wool with rolled brim',
      'Macro weave study of hand-fulled highland sheep wool and pleated crown seams',
      'ReGongches archival presentation box with numbered Gilgit origin story card'
    ],
    fallbackImage: createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Gilgit', title: 'Traditional Gilgiti Pakol', subtitle: 'Pure Highland Wool', type: 'cap', view: 1 }),
    shortStory: 'The pakol is an iconic rolled-brim cap worn across Gilgit-Baltistan and the broader Hindu Kush region. Its distinctive silhouette has been shaped by generations of highland craftspeople using local wool.',
    artisanNote: 'Finished by hand in small batches in Gilgit town using wool sheared from upper Punial pastures.',
    isNew: false,
    isBestseller: true,
    hasRealPhoto: true
  },

  {
    id: 'balti-embroidered-cap-02',
    sku: 'RG-BAL-102',
    name: 'Balti Embroidered Woollen Cap',
    category: 'Headwear',
    region: 'Baltistan (Skardu)',
    price: 2200,
    compareAtPrice: 2800,
    status: 'Low Stock',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    rating: 4.8,
    reviewCount: 29,
    leadTime: 'Only 3 pieces left — dispatches in 24 hrs',
    weight: '150g · Handspun Wool & Silk Thread',
    warmthLevel: 'Medium-High',
    originVillage: 'Skardu & Shigar Valley',
    craftTechnique: 'Silk-thread geometric border stitch on felted wool',
    artisanName: 'Shigar Women’s Heritage Circle [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Intricate Balti geometric border worked in pure silk thread',
      'Structured dome silhouette worn at festive and cultural gatherings',
      'Includes protective cotton dust bag and regional motif guide'
    ],
    materials: '100% handspun wool ground with natural-dyed silk thread embroidery detailing.',
    care: 'Dry clean or spot clean gently with a cool damp cloth. Store in the breathable cotton dust bag provided.',
    sizes: ['S/M (56–58 cm)', 'L/XL (59–61 cm)'],
    colors: [
      { label: 'Deep Maroon',   hex: '#7A263A' },
      { label: 'Forest Green',  hex: '#2D5A3D' }
    ],
    images: [
      createProductSvg({ bg1: '#3E1520', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Balti Embroidered Cap', subtitle: 'Silk-Thread Heritage', type: 'cap', view: 1 }),
      createProductSvg({ bg1: '#3E1520', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Balti Embroidered Cap', subtitle: 'Silk Motif Macro', type: 'cap', view: 2 }),
      createProductSvg({ bg1: '#3E1520', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Balti Embroidered Cap', subtitle: 'Archive Packaging', type: 'cap', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Balti Embroidered Woollen Cap with geometric silk border',
      'Macro detail of silk-thread geometric latticework stitch from Shigar Valley',
      'Archival gift box and Baltistan (Skardu) origin verification card'
    ],
    fallbackImage: createProductSvg({ bg1: '#3E1520', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Balti Embroidered Cap', subtitle: 'Silk-Thread Heritage', type: 'cap', view: 1 }),
    shortStory: "Baltistan's embroidery tradition uses geometric motifs passed down through family lineages. Each cap's border pattern carries regional significance inspired by historic woodcarvings of Shigar and Khaplu.",
    artisanNote: 'Embroidered by women artisans in Shigar valley under fair-trade community terms.',
    isNew: true,
    isBestseller: false,
    hasRealPhoto: false
  },

  /* ── SHAWLS & TEXTILES ── */
  {
    id: 'embroidered-mountain-shawl-03',
    sku: 'RG-BAL-201',
    name: 'Embroidered Mountain Shawl',
    category: 'Shawls & Textiles',
    region: 'Baltistan (Skardu)',
    price: 5000,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Hand-finished',
    rating: 5.0,
    reviewCount: 51,
    leadTime: 'Dispatches within 24–48 hours',
    weight: '420g · Fine Merino Wool Blend',
    warmthLevel: 'High-Altitude Winter',
    originVillage: 'Khaplu & Skardu Artisans',
    craftTechnique: 'Loom-woven wool with hand-embroidered silk borders',
    artisanName: 'Khaplu Loom Collective [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Generous 180 × 75 cm drape suitable for formal and everyday wear',
      'Border motif inspired by historic Chakchan and Khaplu latticework',
      'Hand-twisted fringe ends with individual quality inspection tag'
    ],
    materials: 'Soft merino wool blend, hand-embroidered border in lustrous silk thread.',
    care: 'Hand wash in cold water with wool-safe detergent. Dry flat in shade. Press on low heat using a pressing cloth.',
    sizes: ['One Size (180 × 75 cm)'],
    colors: [
      { label: 'Ivory & Gold',   hex: '#F7F1E7' },
      { label: 'Charcoal & Red', hex: '#252525' }
    ],
    images: [
      'assets/images/embroidered-wool-shawl.webp',
      createProductSvg({ bg1: '#233845', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Embroidered Mountain Shawl', subtitle: 'Border Stitch Detail', type: 'shawl', view: 2 }),
      createProductSvg({ bg1: '#233845', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Embroidered Mountain Shawl', subtitle: 'Gift Box & Story Card', type: 'shawl', view: 3 })
    ],
    imageAlts: [
      'Embroidered Mountain Shawl in soft merino wool with hand-worked Baltistan silk border',
      'Macro detail of Khaplu architectural latticework border embroidery and hand-twisted fringe',
      'Archival presentation case with Baltistan (Skardu) origin certificate'
    ],
    fallbackImage: createProductSvg({ bg1: '#233845', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Embroidered Mountain Shawl', subtitle: 'Merino & Silk Border', type: 'shawl', view: 1 }),
    shortStory: "Woven in the high valleys of Baltistan, this shawl's border pattern is inspired by the geometric tilework of historic Balti architecture — a tradition of embellishment adapted to textile by local weavers.",
    artisanNote: 'Each border takes 4 to 6 days of focused hand-embroidery after the base cloth leaves the loom.',
    isNew: false,
    isBestseller: true,
    hasRealPhoto: true
  },

  {
    id: 'hunza-pattu-shawl-04',
    sku: 'RG-HUN-202',
    name: 'Hunza Pattu Woven Shawl',
    category: 'Shawls & Textiles',
    region: 'Hunza',
    price: 6500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handwoven',
    rating: 4.9,
    reviewCount: 38,
    leadTime: 'Woven to order in 5–7 business days',
    weight: '540g · Traditional Herringbone Pattu Wool',
    warmthLevel: 'Extreme Highland Cold',
    originVillage: 'Karimabad & Ganish, Hunza',
    craftTechnique: 'Hand-thrown shuttle weaving on narrow pit/frame loom',
    artisanName: 'Karimabad Master Weavers [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Authentic dense herringbone pattu weave prized across the Karakoram',
      'Natural undyed and mineral-toned yarns with zero synthetic fibers',
      'Heirloom durability that softens with every season of wear'
    ],
    materials: 'Traditional pattu fabric — hand-woven yak and highland sheep wool blend on a traditional frame loom.',
    care: 'Dry clean recommended. If hand washing, soak gently in cold water only and lay flat on a towel to dry.',
    sizes: ['Standard (200 × 80 cm)', 'Large (220 × 90 cm)'],
    colors: [
      { label: 'Natural Undyed', hex: '#C8B89A' },
      { label: 'Earthy Rust',    hex: '#8B4513' }
    ],
    images: [
      createProductSvg({ bg1: '#3D2B1F', bg2: '#5C4033', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Hunza', title: 'Hunza Pattu Woven Shawl', subtitle: 'Frame-Loom Highland Wool', type: 'shawl', view: 1 }),
      createProductSvg({ bg1: '#3D2B1F', bg2: '#5C4033', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Hunza', title: 'Hunza Pattu Shawl', subtitle: 'Herringbone Twill Macro', type: 'shawl', view: 2 }),
      createProductSvg({ bg1: '#3D2B1F', bg2: '#5C4033', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Hunza', title: 'Hunza Pattu Shawl', subtitle: 'Provenance Certificate', type: 'shawl', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Hunza Pattu Woven Shawl in natural undyed herringbone wool',
      'Macro weave study of traditional two-panel Hunza herringbone pattu twill',
      'ReGongches archival packaging with numbered Hunza provenance card'
    ],
    fallbackImage: createProductSvg({ bg1: '#3D2B1F', bg2: '#5C4033', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Hunza', title: 'Hunza Pattu Woven Shawl', subtitle: 'Frame-Loom Highland Wool', type: 'shawl', view: 1 }),
    shortStory: 'Pattu, the hand-woven textile of the Hunza valley, has been produced on traditional frame looms for centuries. Its characteristic herringbone weave provides exceptional warmth suited to high-altitude winters.',
    artisanNote: 'Woven on traditional narrow looms where two panels are joined with an invisible hand-stitched center seam.',
    isNew: true,
    isBestseller: false,
    hasRealPhoto: false
  },

  {
    id: 'skardu-apricot-blossom-shawl-15',
    sku: 'RG-BAL-203',
    name: 'Shigar Apricot-Blossom Silk & Wool Wrap',
    category: 'Shawls & Textiles',
    region: 'Baltistan (Skardu)',
    price: 7200,
    compareAtPrice: 8200,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    rating: 4.9,
    reviewCount: 24,
    leadTime: 'Dispatches within 24–48 hours',
    weight: '360g · Fine Combed Wool & Mulberry Silk',
    warmthLevel: 'All-Season Evening',
    originVillage: 'Shigar Fort Precinct, Baltistan',
    craftTechnique: 'Fine chain-stitch & satin-stitch floral motifs',
    artisanName: 'Braldu Valley Embroidery Studio [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Delicate apricot-blossom motifs celebrating Baltistan spring orchards',
      'Featherlight combed wool drape ideal for weddings and evening events',
      'Presented in a keepsake linen wrap with botanical cedar sachet'
    ],
    materials: '85% fine combed mountain wool, 15% mulberry silk border and floral embroidery.',
    care: 'Dry clean or delicate cold hand wash. Never wring; dry flat away from direct sun.',
    sizes: ['One Size (195 × 80 cm)'],
    colors: [
      { label: 'Blossom Ivory', hex: '#F7F1E7' },
      { label: 'Dusk Maroon',   hex: '#7A263A' },
      { label: 'Karakoram Slate', hex: '#214C63' }
    ],
    images: [
      createProductSvg({ bg1: '#4A1926', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Apricot-Blossom Silk Wrap', subtitle: 'Shigar Valley Edition', type: 'shawl', view: 1 }),
      createProductSvg({ bg1: '#4A1926', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Apricot-Blossom Wrap', subtitle: 'Botanical Stitch Detail', type: 'shawl', view: 2 }),
      createProductSvg({ bg1: '#4A1926', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Apricot-Blossom Wrap', subtitle: 'Heritage Presentation', type: 'shawl', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Shigar Apricot-Blossom Silk & Wool Wrap in blossom ivory',
      'Macro detail of fine mulberry silk apricot-blossom chain and satin stitch',
      'Keepsake linen wrap and Baltistan (Skardu) origin verification card'
    ],
    fallbackImage: createProductSvg({ bg1: '#4A1926', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Apricot-Blossom Silk Wrap', subtitle: 'Shigar Valley Edition', type: 'shawl', view: 1 }),
    shortStory: 'Inspired by the spring apricot blossoms that blanket the valleys of Shigar and Khaplu, this wrap pairs featherlight highland wool with botanical silk embroidery.',
    artisanNote: 'Each piece supports women home-based embroiderers in Shigar.',
    isNew: true,
    isBestseller: true,
    hasRealPhoto: false
  },

  /* ── CLOTHING ── */
  {
    id: 'ghizer-shuqa-robe-05',
    sku: 'RG-GHI-301',
    name: 'Ghizer Shuqa Woollen Robe',
    category: 'Clothing',
    region: 'Ghizer',
    price: 8500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 4.9,
    reviewCount: 19,
    leadTime: 'Tailored to order in 7–10 business days',
    weight: '950g · Heavyweight Fulled Highland Wool',
    warmthLevel: 'Extreme Highland Cold',
    originVillage: 'Gupis & Yasin Valley, Ghizer',
    craftTechnique: 'Traditional architectural tailoring & lapel embroidery',
    artisanName: 'Yasin Valley Master Tailors [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Ceremonial and winter-ready full-length highland chugha/shuqa silhouette',
      'Hand-worked collar and cuff braiding in contrasting woollen cord',
      'Custom sleeve and length adjustments available upon request'
    ],
    materials: 'Locally sourced heavyweight wool, hand-stitched with a traditional Ghizer cut. Unlined for natural breathability.',
    care: 'Professional dry clean recommended. Brush gently with a soft garment brush and store with cedar wood.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { label: 'Natural Grey',     hex: '#9E9E9E' },
      { label: 'Walnut Brown',     hex: '#5C4033' },
      { label: 'Ivory Ceremonial', hex: '#EDE3D2' }
    ],
    images: [
      createProductSvg({ bg1: '#1A3444', bg2: '#2C4A5E', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Ghizer', title: 'Ghizer Shuqa Woollen Robe', subtitle: 'Ceremonial Outerwear', type: 'robe', view: 1 }),
      createProductSvg({ bg1: '#1A3444', bg2: '#2C4A5E', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Ghizer', title: 'Ghizer Shuqa Robe', subtitle: 'Collar Cord & Weave', type: 'robe', view: 2 }),
      createProductSvg({ bg1: '#1A3444', bg2: '#2C4A5E', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Ghizer', title: 'Ghizer Shuqa Robe', subtitle: 'Garment Cover & Card', type: 'robe', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Ghizer Shuqa Woollen Robe with braided lapel embroidery',
      'Macro detail of hand-worked woollen cord braiding on collar and cuffs',
      'Breathable garment cover and numbered Ghizer origin verification card'
    ],
    fallbackImage: createProductSvg({ bg1: '#1A3444', bg2: '#2C4A5E', accent: '#C59A3D', secondary: '#7A263A', garment: '#D8C4A8', region: 'Ghizer', title: 'Ghizer Shuqa Woollen Robe', subtitle: 'Ceremonial Outerwear', type: 'robe', view: 1 }),
    shortStory: 'The Shuqa is a full-length woollen robe traditionally worn in the Ghizer district during colder months and dignified ceremonies. Its ample cut and durable wool make it a revered heirloom garment.',
    artisanNote: 'Cut and stitched by senior tailors in Yasin valley who specialize in traditional ceremonial outerwear.',
    isNew: false,
    isBestseller: false,
    hasRealPhoto: false
  },

  {
    id: 'astore-traditional-dress-06',
    sku: 'RG-AST-302',
    name: 'Astore Ceremonial Dress Set',
    category: 'Clothing',
    region: 'Astore',
    price: 12000,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 5.0,
    reviewCount: 15,
    leadTime: 'Bespoke crafting in 8–12 business days',
    weight: '620g · Handwoven Cotton-Wool Blend',
    warmthLevel: 'Four-Season Structured',
    originVillage: 'Rama & Gorikot, Astore',
    craftTechnique: 'Dardic geometric collar & cuff needlework',
    artisanName: 'Astore Heritage Guild [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Complete 3-piece ceremonial ensemble with hand-embroidered neckline and cuffs',
      'Preserves authentic Dardic highland geometric needlework motifs',
      'Tailored to standard or custom measurements at no extra charge'
    ],
    materials: 'Handwoven cotton-wool blend with dense multi-strand embroidered neckline, placket, and cuffs.',
    care: 'Dry clean only. Do not wring or bleach. Store flat in the provided breathable muslin garment bag.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { label: 'Deep Indigo', hex: '#2C3E7A' },
      { label: 'Warm Maroon', hex: '#7A263A' }
    ],
    images: [
      createProductSvg({ bg1: '#1E2952', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Astore', title: 'Astore Ceremonial Dress', subtitle: 'Hand-Embroidered Set', type: 'robe', view: 1 }),
      createProductSvg({ bg1: '#1E2952', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Astore', title: 'Astore Ceremonial Dress', subtitle: 'Dardic Collar Stitch', type: 'robe', view: 2 }),
      createProductSvg({ bg1: '#1E2952', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Astore', title: 'Astore Ceremonial Dress', subtitle: 'Bespoke Presentation', type: 'robe', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Astore Ceremonial Dress Set with Dardic collar embroidery',
      'Macro detail of multi-band geometric needlework at neckline and cuffs',
      'Breathable muslin garment bag and numbered Astore provenance card'
    ],
    fallbackImage: createProductSvg({ bg1: '#1E2952', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Astore', title: 'Astore Ceremonial Dress', subtitle: 'Hand-Embroidered Set', type: 'robe', view: 1 }),
    shortStory: 'Traditional dress from Astore district features intricate embroidery at the collar and sleeve openings. The patterns are region-specific and have been documented as part of the broader Dardic textile tradition.',
    artisanNote: 'Individually cut and embroidered by Astore artisans with full motif documentation enclosed.',
    isNew: true,
    isBestseller: false,
    hasRealPhoto: false
  },

  /* ── WAISTCOATS & OUTERWEAR ── */
  {
    id: 'ghizer-wool-waistcoat-07',
    sku: 'RG-GHI-401',
    name: 'Embroidered Wool Waistcoat',
    category: 'Waistcoats',
    region: 'Ghizer',
    price: 6500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 4.9,
    reviewCount: 47,
    leadTime: 'Crafted in 4–6 business days',
    weight: '480g · Handwoven Wool & Cotton Twill Lining',
    warmthLevel: 'Mid-Layer All-Season',
    originVillage: 'Punial & Gupis, Ghizer',
    craftTechnique: 'Symmetric front-panel wool thread crewel embroidery',
    artisanName: 'Gupis Tailoring & Embroidery Workshop [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Tailored mandarin collar with traditional Ghizer botanical front motifs',
      'Fully lined in breathable combed cotton with two welt pockets and inner chest pocket',
      'Pairs effortlessly with both shalwar kameez and contemporary dress shirts'
    ],
    materials: 'Handwoven wool outer shell, soft combed cotton lining, antique brass buttons, wool embroidery thread.',
    care: 'Dry clean recommended. Spot clean with a cool damp cloth and air out after wear.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { label: 'Forest Green',   hex: '#2D5A3D' },
      { label: 'Mountain Brown', hex: '#7A5C3A' },
      { label: 'Navy Slate',     hex: '#2C3E50' }
    ],
    images: [
      'assets/images/embroidered-wool-waistcoat.webp',
      createProductSvg({ bg1: '#1E3F2B', bg2: '#2D5A3D', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Ghizer', title: 'Embroidered Waistcoat', subtitle: 'Crewel Panel Detail', type: 'waistcoat', view: 2 }),
      createProductSvg({ bg1: '#1E3F2B', bg2: '#2D5A3D', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Ghizer', title: 'Embroidered Waistcoat', subtitle: 'Origin Verification', type: 'waistcoat', view: 3 })
    ],
    imageAlts: [
      'Embroidered Wool Waistcoat from Ghizer featuring symmetric botanical crewel front panels',
      'Macro detail of wool-thread crewel embroidery and antique brass button placket',
      'Archival presentation box with numbered Ghizer origin verification card'
    ],
    fallbackImage: createProductSvg({ bg1: '#1E3F2B', bg2: '#2D5A3D', accent: '#C59A3D', secondary: '#7A263A', garment: '#E8D8BF', region: 'Ghizer', title: 'Embroidered Wool Waistcoat', subtitle: 'Tailored Highland Fit', type: 'waistcoat', view: 1 }),
    shortStory: 'The embroidered waistcoat is a central garment in the festive dress of Ghizer communities. Its front panels feature repeating floral and geometric motifs worked in contrasting wool thread.',
    artisanNote: 'Stitched in Ghizer with hand-worked buttonholes and reinforced welt pockets.',
    isNew: false,
    isBestseller: true,
    hasRealPhoto: true
  },

  {
    id: 'nagar-embroidered-jacket-08',
    sku: 'RG-NAG-402',
    name: 'Nagar Embroidered Wool Jacket',
    category: 'Waistcoats',
    region: 'Nagar',
    price: 9800,
    compareAtPrice: 11500,
    status: 'Low Stock',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    rating: 4.8,
    reviewCount: 22,
    leadTime: 'Only 2 pieces remaining — dispatches in 48 hrs',
    weight: '710g · Pure Dark Highland Wool & Silk Thread',
    warmthLevel: 'High-Altitude Winter',
    originVillage: 'Hopar & Minapin, Nagar Valley',
    craftTechnique: 'Dense silk-thread floral embroidery on dark fulled wool',
    artisanName: 'Rakaposhi Foothills Collective [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Signature Nagar valley silk-on-dark-wool floral embroidery across cuffs and placket',
      'Structured jacket cut suitable for autumn/winter evening wear',
      'Limited seasonal release with individual artisan signature tag'
    ],
    materials: 'Outer: 100% highland wool. Lining: soft quilted cotton. All embroidery worked by hand in pure silk thread.',
    care: 'Dry clean only. Keep away from prolonged direct sunlight to preserve natural silk thread lustre.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { label: 'Midnight Blue', hex: '#1B2A4A' },
      { label: 'Terracotta',    hex: '#A0522D' }
    ],
    images: [
      createProductSvg({ bg1: '#142038', bg2: '#1B2A4A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Nagar', title: 'Nagar Embroidered Jacket', subtitle: 'Silk-Thread Outerwear', type: 'waistcoat', view: 1 }),
      createProductSvg({ bg1: '#142038', bg2: '#1B2A4A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Nagar', title: 'Nagar Embroidered Jacket', subtitle: 'Silk-on-Wool Macro', type: 'waistcoat', view: 2 }),
      createProductSvg({ bg1: '#142038', bg2: '#1B2A4A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Nagar', title: 'Nagar Embroidered Jacket', subtitle: 'Archive Box & Card', type: 'waistcoat', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Nagar Embroidered Wool Jacket in midnight blue with silk floral placket',
      'Macro detail of luminous silk-thread floral sprays embroidered on dark wool ground',
      'ReGongches archival box with numbered Nagar origin card'
    ],
    fallbackImage: createProductSvg({ bg1: '#142038', bg2: '#1B2A4A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Nagar', title: 'Nagar Embroidered Jacket', subtitle: 'Silk-Thread Outerwear', type: 'waistcoat', view: 1 }),
    shortStory: 'Nagar valley is known for its fine embroidery skills, particularly the dense floral motifs worked in silk thread on dark wool grounds. This jacket represents that tradition in a wearable contemporary silhouette.',
    artisanNote: 'Hand-embroidered in Minapin village beneath the slopes of Rakaposhi.',
    isNew: false,
    isBestseller: false,
    hasRealPhoto: false
  },

  /* ── ACCESSORIES ── */
  {
    id: 'nagar-textile-handbag-09',
    sku: 'RG-NAG-501',
    name: 'Embroidered Textile Handbag',
    category: 'Accessories',
    region: 'Nagar',
    price: 2200,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 4.8,
    reviewCount: 33,
    leadTime: 'Dispatches within 24 hours',
    weight: '290g · Wool Panel, Cotton Canvas & Brass Hardware',
    warmthLevel: 'Everyday Carry',
    originVillage: 'Sumayar & Nagar Proper',
    craftTechnique: 'Cross-stitch & chain-stitch wool panel assembly',
    artisanName: 'Sumayar Women’s Craft Studio [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Authentic hand-embroidered Nagar textile panel — never cut from vintage heirlooms',
      'Structured cotton canvas interior with zippered security pocket',
      'Hand-braided shoulder strap with solid brass rings'
    ],
    materials: 'Outer: embroidered wool textile panel. Inner: heavy cotton canvas lining with zip pocket. Strap: braided cotton-wool cord.',
    care: 'Spot clean gently with a damp cloth. Do not machine wash or submerge. Air dry flat.',
    sizes: ['One Size (28 × 22 × 8 cm)'],
    colors: [
      { label: 'Oatmeal & Gold', hex: '#C8B89A' },
      { label: 'Maroon & Ivory', hex: '#7A263A' }
    ],
    images: [
      'assets/images/embroidered-textile-handbag.webp',
      createProductSvg({ bg1: '#4A1A28', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#E8D8BF', region: 'Nagar', title: 'Embroidered Handbag', subtitle: 'Textile Panel Macro', type: 'accessory', view: 2 }),
      createProductSvg({ bg1: '#4A1A28', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#E8D8BF', region: 'Nagar', title: 'Embroidered Handbag', subtitle: 'Dust Bag & Story Card', type: 'accessory', view: 3 })
    ],
    imageAlts: [
      'Embroidered Textile Handbag from Nagar featuring hand-stitched geometric wool panel and braided strap',
      'Macro detail of cross-stitch and chain-stitch wool panel with brass hardware',
      'Protective cotton dust bag and numbered Nagar provenance card'
    ],
    fallbackImage: createProductSvg({ bg1: '#4A1A28', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#E8D8BF', region: 'Nagar', title: 'Embroidered Textile Handbag', subtitle: 'Nagar Motif Panel', type: 'accessory', view: 1 }),
    shortStory: 'Woven textile bags have been practical companions in the mountain communities of GB for generations. This handbag adapts a newly crafted traditional panel into a contemporary everyday accessory.',
    artisanNote: 'Crafted by women artisans in Sumayar, Nagar.',
    isNew: false,
    isBestseller: false,
    hasRealPhoto: true
  },

  {
    id: 'hunza-handwoven-belt-10',
    sku: 'RG-HUN-502',
    name: 'Hunza Hand-Woven Woollen Belt',
    category: 'Accessories',
    region: 'Hunza',
    price: 950,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handwoven',
    rating: 4.7,
    reviewCount: 41,
    leadTime: 'Dispatches within 24 hours',
    weight: '110g · Narrow-Loom Wool & Aged Brass Buckle',
    warmthLevel: 'Everyday Accessory',
    originVillage: 'Altit & Baltit, Hunza',
    craftTechnique: 'Backstrap / narrow-loom warp-faced geometric weaving',
    artisanName: 'Altit Loom Studio [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Woven on a traditional narrow loom with ancient Karakoram step-diamond motifs',
      'Finished with a hand-cast aged brass D-ring buckle',
      'Versatile styling over waistcoats, robes, dresses, or coats'
    ],
    materials: '100% highland wool woven on a traditional narrow loom, vegetable-tanned leather tip, solid brass buckle closure.',
    care: 'Spot clean only. Do not soak. Store rolled in a dry drawer.',
    sizes: ['S/M (70–85 cm)', 'L/XL (86–100 cm)'],
    colors: [
      { label: 'Red & Black',      hex: '#8B0000' },
      { label: 'Indigo & Natural', hex: '#2C3E7A' }
    ],
    images: [
      createProductSvg({ bg1: '#1D2E5C', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Hunza Hand-Woven Belt', subtitle: 'Narrow-Loom Geometric', type: 'accessory', view: 1 }),
      createProductSvg({ bg1: '#1D2E5C', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Hunza Woven Belt', subtitle: 'Warp-Faced Motif Detail', type: 'accessory', view: 2 }),
      createProductSvg({ bg1: '#1D2E5C', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Hunza Woven Belt', subtitle: 'Gift Pouch Included', type: 'accessory', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Hunza Hand-Woven Woollen Belt with step-diamond motifs and brass buckle',
      'Macro weave study of narrow-loom warp-faced highland wool',
      'Cotton gift pouch and numbered Hunza origin story card'
    ],
    fallbackImage: createProductSvg({ bg1: '#1D2E5C', bg2: '#2C3E7A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Hunza Hand-Woven Belt', subtitle: 'Narrow-Loom Geometric', type: 'accessory', view: 1 }),
    shortStory: 'Narrow-loom belts and sashes are an integral part of traditional dress across Hunza. Their repeating geometric patterns are among the oldest documented textile motifs of the Karakoram highlands.',
    artisanNote: 'Woven in Altit village using time-honored warp-patterning techniques.',
    isNew: true,
    isBestseller: false,
    hasRealPhoto: false
  },

  {
    id: 'diamer-embroidered-cushion-11',
    sku: 'RG-DIA-503',
    name: 'Diamer Embroidered Cushion Cover',
    category: 'Accessories',
    region: 'Diamer',
    price: 1500,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    rating: 4.8,
    reviewCount: 27,
    leadTime: 'Dispatches within 24 hours',
    weight: '210g · Heavy Cotton-Linen & Wool Thread',
    warmthLevel: 'Home Textile',
    originVillage: 'Chilas & Darel Valley, Diamer',
    craftTechnique: 'Chain-stitch & architectural rosette embroidery',
    artisanName: 'Darel Valley Craft Collective [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Motifs inspired by the historic woodcarving rosettes of Darel and Tangir valleys',
      'Heavyweight natural cotton-linen base with concealed brass zipper',
      'Standard 45 × 45 cm square fit for living rooms and studies'
    ],
    materials: 'Heavyweight cotton-linen ground, dyed wool embroidery thread, concealed zip closure. 45 × 45 cm (insert not included).',
    care: 'Remove cover and hand wash cold inside out. Iron on reverse side on medium heat.',
    sizes: ['45 × 45 cm'],
    colors: [
      { label: 'Natural Linen', hex: '#D2B48C' },
      { label: 'Off-White',     hex: '#F5F5DC' }
    ],
    images: [
      createProductSvg({ bg1: '#4A3828', bg2: '#6B513A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F5F5DC', region: 'Diamer', title: 'Diamer Cushion Cover', subtitle: 'Chain-Stitch Home Textile', type: 'accessory', view: 1 }),
      createProductSvg({ bg1: '#4A3828', bg2: '#6B513A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F5F5DC', region: 'Diamer', title: 'Diamer Cushion Cover', subtitle: 'Chain-Stitch Rosette', type: 'accessory', view: 2 }),
      createProductSvg({ bg1: '#4A3828', bg2: '#6B513A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F5F5DC', region: 'Diamer', title: 'Diamer Cushion Cover', subtitle: 'Origin Story Card', type: 'accessory', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Diamer Embroidered Cushion Cover with solar rosette needlework',
      'Macro detail of Darel Valley woodcarving-inspired chain-stitch embroidery on linen',
      'ReGongches archival wrap and numbered Diamer provenance card'
    ],
    fallbackImage: createProductSvg({ bg1: '#4A3828', bg2: '#6B513A', accent: '#C59A3D', secondary: '#7A263A', garment: '#F5F5DC', region: 'Diamer', title: 'Diamer Cushion Cover', subtitle: 'Chain-Stitch Home Textile', type: 'accessory', view: 1 }),
    shortStory: 'The chain-stitch and rosette embroidery style of Diamer district echoes the celebrated geometric woodcarvings of Darel and Tangir. This cushion cover brings that decorative language into the contemporary home.',
    artisanNote: 'Hand-embroidered by artisans in Diamer district.',
    isNew: false,
    isBestseller: false,
    hasRealPhoto: false
  },

  {
    id: 'hunza-silver-filigree-brooch-16',
    sku: 'RG-HUN-504',
    name: 'Karakoram Cap Plume & Brass Heritage Pin',
    category: 'Accessories',
    region: 'Hunza',
    price: 1650,
    compareAtPrice: 1950,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handcrafted',
    rating: 4.9,
    reviewCount: 31,
    leadTime: 'Dispatches within 24 hours',
    weight: '45g · Hand-worked Brass, Silver Wash & Red Carnelian Bead',
    warmthLevel: 'Ceremonial Accent',
    originVillage: 'Karimabad Metalwork Guild, Hunza',
    craftTechnique: 'Lost-wax brass casting & wire filigree',
    artisanName: 'Hunza Traditional Smiths [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Traditionally pinned to the front or side fold of a Pakol or Balti cap',
      'Hand-worked filigree crescent with a polished carnelian-toned center stone',
      'Presented in a velvet-lined keepsake box with ceremonial usage note'
    ],
    materials: 'Hand-worked brass with antique silver finish, secure pin clasp, and polished semi-precious carnelian bead.',
    care: 'Wipe gently with a dry polishing cloth. Keep away from moisture and perfumes.',
    sizes: ['One Size (6.5 × 3.8 cm)'],
    colors: [
      { label: 'Antique Silver & Carnelian', hex: '#A8A9AD' },
      { label: 'Warm Heritage Brass',        hex: '#C59A3D' }
    ],
    images: [
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Karakoram Cap Plume Pin', subtitle: 'Hand-Worked Filigree', type: 'accessory', view: 1 }),
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Heritage Cap Brooch', subtitle: 'Filigree & Stone Detail', type: 'accessory', view: 2 }),
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Heritage Cap Brooch', subtitle: 'Velvet Keepsake Box', type: 'accessory', view: 3 })
    ],
    imageAlts: [
      'Studio illustration of Karakoram Cap Plume & Brass Heritage Pin with carnelian center stone',
      'Macro detail of hand-worked wire filigree crescent and secure clasp',
      'Velvet-lined keepsake presentation box and Hunza origin verification card'
    ],
    fallbackImage: createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Karakoram Cap Plume Pin', subtitle: 'Hand-Worked Filigree', type: 'accessory', view: 1 }),
    shortStory: 'Across Gilgit-Baltistan, ceremonial headwear is completed with a metal plume holder or filigree brooch (jigha) worn by grooms, elders, and cultural performers during festivals.',
    artisanNote: 'Hand-forged and chased by local metalworkers in central Hunza.',
    isNew: true,
    isBestseller: false,
    hasRealPhoto: false
  },

  /* ── HERITAGE GIFTS ── */
  {
    id: 'heritage-gift-box-cap-shawl-12',
    sku: 'RG-GFT-601',
    name: 'Traditional Cap & Shawl Gift Set',
    category: 'Heritage Gifts',
    region: 'Gilgit',
    price: 7500,
    compareAtPrice: 8500,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 5.0,
    reviewCount: 58,
    leadTime: 'Dispatches within 24 hours in luxury gift box',
    weight: '890g · Presentation Box Included',
    warmthLevel: 'Complete Winter Pairing',
    originVillage: 'Gilgit & Baltistan Cross-Regional Curation',
    craftTechnique: 'Hand-felted Pakol + Hand-embroidered Mountain Shawl',
    artisanName: 'ReGongches Archive Curation',
    highlights: [
      'Saves PKR 1,000 compared to purchasing the Pakol Cap and Mountain Shawl separately',
      'Arrives in a gold-embossed rigid presentation box with wax seal & ribbon',
      'Includes printed Cultural Story Booklet and handwritten-style gift message card'
    ],
    materials: 'Includes one pure wool Gilgiti Pakol Cap and one Embroidered Mountain Shawl, enclosed in a rigid archival gift box.',
    care: 'Refer to individual foil-stamped care cards enclosed inside the gift box.',
    sizes: ['Cap: S/M + Shawl: One Size', 'Cap: L/XL + Shawl: One Size'],
    colors: [
      { label: 'Natural Heritage Palette', hex: '#C8B89A' },
      { label: 'Charcoal & Ivory Pairing', hex: '#252525' }
    ],
    images: [
      'assets/images/heritage-gift-box.webp',
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Gilgit', title: 'Cap & Shawl Gift Set', subtitle: 'Paired Textile Detail', type: 'gift', view: 2 }),
      createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Gilgit', title: 'Cap & Shawl Gift Set', subtitle: 'Seal & Story Booklet', type: 'gift', view: 3 })
    ],
    imageAlts: [
      'Traditional Cap & Shawl Gift Set presented in ReGongches rigid archival gift box',
      'Macro view of paired Gilgiti Pakol wool and Baltistan silk-embroidered shawl border',
      'Gold-embossed presentation box with wax seal and numbered story booklet'
    ],
    fallbackImage: createProductSvg({ bg1: '#172F3D', bg2: '#214C63', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Gilgit', title: 'Cap & Shawl Gift Set', subtitle: 'Signature Heritage Box', type: 'gift', view: 1 }),
    shortStory: "This curated set pairs two of Gilgit-Baltistan's most iconic textile objects — the pakol cap and the woven shawl — in premium gift packaging with an authenticity card and cultural story insert.",
    artisanNote: 'Assembled by hand at our Gilgit studio with verified provenance cards for both pieces.',
    isNew: false,
    isBestseller: true,
    hasRealPhoto: true
  },

  {
    id: 'embroidered-accessories-set-13',
    sku: 'RG-GFT-602',
    name: 'Embroidered Accessories Gift Set',
    category: 'Heritage Gifts',
    region: 'Baltistan (Skardu)',
    price: 4800,
    compareAtPrice: 5400,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 4.9,
    reviewCount: 26,
    leadTime: 'Dispatches within 24 hours',
    weight: '640g · Presentation Box Included',
    warmthLevel: 'All-Season Gift',
    originVillage: 'Baltistan, Nagar & Hunza Artisan Pairing',
    craftTechnique: 'Hand-embroidered wool bag + narrow-loom woven belt',
    artisanName: 'Women’s Highland Craft Cooperative [ARTISAN COLLECTIVE PLACEHOLDER]',
    highlights: [
      'Pairs the Embroidered Textile Handbag with the Hand-Woven Woollen Belt (Save PKR 600)',
      'Every purchase directly supports women-led village embroidery workshops',
      'Includes personalized calligraphed gift note and regional origin map'
    ],
    materials: 'Includes one embroidered textile handbag and one hand-woven woollen belt in premium gift packaging.',
    care: 'Refer to individual item care guides enclosed.',
    sizes: ['One Size'],
    colors: [
      { label: 'Maroon & Ivory',   hex: '#7A263A' },
      { label: 'Oatmeal & Indigo', hex: '#214C63' }
    ],
    images: [
      'assets/images/embroidered-textile-handbag.webp',
      createProductSvg({ bg1: '#4A1A28', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Accessories Gift Set', subtitle: 'Motif & Weave Pairing', type: 'gift', view: 2 }),
      createProductSvg({ bg1: '#4A1A28', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Accessories Gift Set', subtitle: 'Luxury Gift Packaging', type: 'gift', view: 3 })
    ],
    imageAlts: [
      'Embroidered Accessories Gift Set pairing the hand-stitched handbag and narrow-loom wool belt',
      'Macro study of paired cross-stitch bag panel and warp-faced belt geometry',
      'Archival gift box with Women’s Craft Cooperative provenance card'
    ],
    fallbackImage: createProductSvg({ bg1: '#4A1A28', bg2: '#7A263A', accent: '#C59A3D', secondary: '#214C63', garment: '#F7F1E7', region: 'Baltistan (Skardu)', title: 'Accessories Gift Set', subtitle: 'Handbag & Woven Belt', type: 'gift', view: 1 }),
    shortStory: 'A thoughtfully assembled introduction to the textile traditions of the northern highlands — combining an embroidered bag and a woven belt, each made using regional techniques and presented with cultural context.',
    artisanNote: '100% of craft royalties go directly to the women makers in Nagar, Hunza, and Baltistan.',
    isNew: true,
    isBestseller: false,
    hasRealPhoto: true
  },

  {
    id: 'cultural-textile-gift-box-14',
    sku: 'RG-GFT-603',
    name: 'Cultural Textile Heritage Box',
    category: 'Heritage Gifts',
    region: 'Hunza',
    price: 9500,
    compareAtPrice: 10800,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    rating: 5.0,
    reviewCount: 34,
    leadTime: 'Curated & packed in 3–5 business days',
    weight: '1,150g · Collector’s Keepsake Case',
    warmthLevel: 'Collector’s Edition',
    originVillage: 'Hunza, Gilgit & Baltistan Archive',
    craftTechnique: 'Multi-craft seasonal collector’s curation',
    artisanName: 'Master Guilds of Gilgit-Baltistan',
    highlights: [
      'Contains 4 curated pieces: Pattu wrap, Pakol cap, woven sash & filigree pin (Save PKR 1,300)',
      'Designed for diplomatic, corporate, wedding, and diaspora heritage gifting',
      'Includes a 16-page illustrated booklet on Karakoram textile history'
    ],
    materials: 'Curated selection of 4 signature textile & craft items with archival storage box, cedar blocks, and illustrated story booklet.',
    care: 'Individual care guides enclosed with each item.',
    sizes: ['Collector’s Heritage Box'],
    colors: [
      { label: 'Seasonal Gold & Ivory Edition', hex: '#C59A3D' }
    ],
    images: [
      'assets/images/heritage-gift-box.webp',
      createProductSvg({ bg1: '#252525', bg2: '#172F3D', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Cultural Heritage Box', subtitle: '4-Piece Textile Curation', type: 'gift', view: 2 }),
      createProductSvg({ bg1: '#252525', bg2: '#172F3D', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Cultural Heritage Box', subtitle: 'Booklet & Seal', type: 'gift', view: 3 })
    ],
    imageAlts: [
      'Cultural Textile Heritage Box featuring 4 curated Gilgit-Baltistan pieces in a collector case',
      'Interior curation detail showing Pattu wrap, Pakol cap, woven sash, and filigree pin',
      '16-page illustrated Karakoram textile booklet, cedar blocks, and wax-sealed box'
    ],
    fallbackImage: createProductSvg({ bg1: '#252525', bg2: '#172F3D', accent: '#C59A3D', secondary: '#7A263A', garment: '#F7F1E7', region: 'Hunza', title: 'Cultural Textile Heritage Box', subtitle: '4-Piece Collector Curation', type: 'gift', view: 1 }),
    shortStory: "The Heritage Box brings together a seasonally curated selection of textile objects from the Hunza and Gilgit valleys — a considered introduction to the material culture of Pakistan's celebrated mountain regions.",
    artisanNote: 'Our flagship gift box for corporate, institutional, and wedding hospitality orders.',
    isNew: false,
    isBestseller: true,
    hasRealPhoto: true
  }
];

/* ── 6. CURATED THEMED RAILS (Inspired by The Cat Gallery) ───────────────── */
const THEMED_RAILS = [
  {
    id: 'gifts-for-him',
    eyebrow: 'Curated Edit 01',
    title: 'Gifts for Him: Highland Dignitary',
    subtitle: 'Hand-fulled Pakol caps, crewel-embroidered waistcoats, and ceremonial Shuqa robes crafted for fathers, grooms, and collectors.',
    filterLink: 'shop.html?category=Waistcoats',
    productIds: [
      'gilgiti-wool-cap-01',
      'ghizer-wool-waistcoat-07',
      'heritage-gift-box-cap-shawl-12',
      'ghizer-shuqa-robe-05'
    ]
  },
  {
    id: 'wedding-season',
    eyebrow: 'Curated Edit 02',
    title: 'Wedding & Ceremonial Season',
    subtitle: 'Heirloom wraps, Dardic ceremonial dress sets, and collector gift boxes with calligraphed message cards and wax seals.',
    filterLink: 'shop.html?category=Heritage+Gifts',
    productIds: [
      'skardu-apricot-blossom-shawl-15',
      'astore-traditional-dress-06',
      'cultural-textile-gift-box-14',
      'nagar-embroidered-jacket-08'
    ]
  },
  {
    id: 'under-5000',
    eyebrow: 'Curated Edit 03',
    title: 'Meaningful Keepsakes Under PKR 5,000',
    subtitle: 'Accessible, authentic craft pieces from across the seven districts — each accompanied by its numbered Origin Story Card.',
    filterLink: 'shop.html?price=under-5000',
    productIds: [
      'hunza-handwoven-belt-10',
      'diamer-embroidered-cushion-11',
      'hunza-silver-filigree-brooch-16',
      'nagar-textile-handbag-09',
      'balti-embroidered-cap-02',
      'embroidered-accessories-set-13'
    ]
  },
  {
    id: 'winter-warmth-pattu',
    eyebrow: 'Curated Edit 04',
    title: 'Winter Warmth: Pattu & Highland Wool',
    subtitle: 'Dense herringbone frame-loom weaves and pure sheep-wool outerwear built for high-altitude winters.',
    filterLink: 'shop.html?category=Shawls+%26+Textiles',
    productIds: [
      'hunza-pattu-shawl-04',
      'embroidered-mountain-shawl-03',
      'ghizer-shuqa-robe-05',
      'nagar-embroidered-jacket-08'
    ]
  },
  {
    id: 'from-hunza',
    eyebrow: 'Curated Edit 05',
    title: 'From Hunza Valley: Altit & Karimabad Guilds',
    subtitle: 'Frame-loom pattu, narrow-loom geometric belts, and lost-wax filigree pins crafted beneath Ultar Sar.',
    filterLink: 'shop.html?region=Hunza',
    productIds: [
      'hunza-pattu-shawl-04',
      'hunza-handwoven-belt-10',
      'hunza-silver-filigree-brooch-16',
      'cultural-textile-gift-box-14'
    ]
  }
];

/* ── 7. FOUNDER / ARTISAN'S PICK (Inspired by "Charlie Recommends") ─────── */
const FOUNDER_PICKS = {
  eyebrow: 'Founder & Master Weaver Recommendation',
  title: 'Why We Always Recommend Starting with the Cap & Shawl Pairing',
  curatorName: '[FOUNDER NAME — e.g. Mushtaq Ahmad, Founder of ReGongches]',
  curatorRole: 'Gilgit Studio Curator · Direct Guild Partner since 2024',
  quote: 'When someone asks how to experience Gilgit-Baltistan’s textile heritage for the first time—or what to send a respected elder or wedding guest in Islamabad, Lahore, or abroad—I always point them to our Traditional Cap & Shawl Gift Set. You feel the warmth of Punial pasture wool in the Pakol and see five days of patient Balti silk needlework along the shawl border.',
  featuredProductId: 'heritage-gift-box-cap-shawl-12',
  secondaryProductId: 'hunza-pattu-shawl-04'
};

/* ── 8. LOOKBOOK ENSEMBLES ───────────────────────────────────────────────── */
const LOOKBOOK_ENSEMBLES = [
  {
    id: 'hunza-winter-ceremonial',
    eyebrow: 'Ensemble 01 · Karakoram Autumn/Winter',
    title: 'The Highland Dignitary Edit',
    subtitle: 'A cohesive pairing of fulled wool outerwear, rolled-brim headwear, and hand-loomed pattu worn across Gilgit and Hunza during crisp mountain evenings.',
    region: 'Gilgit & Hunza',
    totalPrice: 16450,
    bundlePrice: 14800,
    savingsLabel: 'Save PKR 1,650 with Complete Look (Code HUNZA15)',
    hotspots: [
      { x: 48, y: 20, productId: 'gilgiti-wool-cap-01', label: 'Traditional Gilgiti Pakol Cap', note: 'Pure wool rolled brim in Natural Oatmeal' },
      { x: 58, y: 16, productId: 'hunza-silver-filigree-brooch-16', label: 'Karakoram Cap Plume Pin', note: 'Pinned to the pakol fold for ceremonial occasions' },
      { x: 36, y: 50, productId: 'hunza-pattu-shawl-04', label: 'Hunza Pattu Woven Shawl', note: 'Draped over the shoulder in herringbone wool' },
      { x: 56, y: 62, productId: 'ghizer-wool-waistcoat-07', label: 'Embroidered Wool Waistcoat', note: 'Crewel-stitched front panels over crisp cotton' }
    ]
  },
  {
    id: 'baltistan-silk-road-edit',
    eyebrow: 'Ensemble 02 · Festive & Cultural Gatherings',
    title: 'The Baltistan Silk-Road Edit',
    subtitle: 'Inspired by the geometric woodwork and apricot orchards of Shigar and Khaplu — pairing fine silk-thread embroidery with artisan accessories.',
    region: 'Baltistan (Skardu) & Nagar',
    totalPrice: 12550,
    bundlePrice: 11200,
    savingsLabel: 'Save PKR 1,350 with Complete Look (Code HUNZA15)',
    hotspots: [
      { x: 50, y: 22, productId: 'balti-embroidered-cap-02', label: 'Balti Embroidered Woollen Cap', note: 'Silk-thread geometric border stitch' },
      { x: 44, y: 48, productId: 'skardu-apricot-blossom-shawl-15', label: 'Shigar Apricot-Blossom Wrap', note: 'Featherlight combed wool with floral border' },
      { x: 64, y: 70, productId: 'nagar-textile-handbag-09', label: 'Embroidered Textile Handbag', note: 'Hand-stitched Nagar motif panel' },
      { x: 35, y: 74, productId: 'hunza-handwoven-belt-10', label: 'Hunza Hand-Woven Belt', note: 'Narrow-loom geometric waist sash' }
    ]
  }
];

/* ── 9. REGION METADATA (7 VERIFIED DISTRICTS + INTERACTIVE SVG MAP COORDS) ─ */
const REGIONS = [
  {
    name: 'Gilgit',
    slug: 'gilgit',
    descriptor: 'The administrative and historic craft crossroads of GB',
    altitude: '1,500m · Confluence of Gilgit, Indus & Hunza Rivers',
    signatureMotif: 'Rolled-brim felted wool & braided cord work',
    artisanCount: '42 verified makers',
    crafts: 'Pakol caps, woollen outerwear, embroidered accessories',
    mapCoords: { cx: 245, cy: 175, path: 'M205,140 L280,140 L290,200 L210,205 Z' },
    description: 'Gilgit sits at the confluence of major Karakoram valleys and has long been a crossroads of craft traditions. The city and its surrounding villages in Punial are known for their skilled production of the iconic pakol cap and a range of embroidered textiles that reflect the meeting of multiple regional influences.'
  },
  {
    name: 'Hunza',
    slug: 'hunza',
    descriptor: 'Celebrated valley famous for frame-loom pattu & cross-stitch',
    altitude: '2,438m · Karimabad, Altit & Gojal Highlands',
    signatureMotif: 'Herringbone pattu twill & step-diamond geometry',
    artisanCount: '64 verified makers',
    crafts: 'Pattu shawls, hand-woven belts, filigree metalwork',
    mapCoords: { cx: 295, cy: 92, path: 'M240,45 L355,55 L345,130 L245,132 Z' },
    description: 'The Hunza valley has long attracted admiration for its distinctive material culture, including the pattu — a hand-woven wool textile produced on traditional narrow looms. Hunza weavers and women embroiderers are celebrated for their geometric precision and the exceptional warmth of their textiles.'
  },
  {
    name: 'Nagar',
    slug: 'nagar',
    descriptor: 'Karakoram valley beneath Rakaposhi known for silk embroidery',
    altitude: '2,300m – 2,688m · Minapin, Hopar & Sumayar',
    signatureMotif: 'Dense silk-thread floral sprays on dark wool grounds',
    artisanCount: '31 verified makers',
    crafts: 'Embroidered jackets, decorative textile bags, woven panels',
    mapCoords: { cx: 315, cy: 155, path: 'M282,132 L360,132 L355,188 L288,188 Z' },
    description: 'Nagar valley, facing Hunza across the river gorge beneath Rakaposhi and Diran, is distinguished by its fine embroidery tradition. Local craftspeople are known for meticulous silk-thread work on dark wool grounds, producing garments and accessories with luminous contrast.'
  },
  {
    name: 'Ghizer',
    slug: 'ghizer',
    descriptor: 'Western highland valleys with revered robe-making heritage',
    altitude: '2,100m – 2,700m · Gupis, Punial & Yasin Valleys',
    signatureMotif: 'Botanical crewel waistcoat panels & braided Shuqa lapels',
    artisanCount: '28 verified makers',
    crafts: 'Shuqa robes, embroidered waistcoats, woollen garments',
    mapCoords: { cx: 135, cy: 145, path: 'M65,95 L202,105 L202,195 L75,190 Z' },
    description: 'Ghizer district, in the western part of Gilgit-Baltistan, maintains a distinct textile identity centred on the shuqa — a full-length woollen robe that is both practical outerwear and a ceremonial garment — alongside tailored wool waistcoats embroidered with vibrant highland flora.'
  },
  {
    name: 'Baltistan (Skardu)',
    slug: 'baltistan',
    aliases: ['Baltistan', 'Skardu', 'Baltistan (Skardu)'],
    descriptor: 'Ancient Silk Road heritage and architectural embroidery',
    altitude: '2,228m – 2,600m · Skardu, Shigar & Khaplu Valleys',
    signatureMotif: 'Latticework geometric borders & apricot-blossom stitch',
    artisanCount: '56 verified makers',
    crafts: 'Embroidered caps, geometric shawls, ceremonial wraps',
    mapCoords: { cx: 425, cy: 220, path: 'M355,155 L515,165 L505,285 L345,270 Z' },
    description: "Baltistan's position on historic trade routes connecting Central Asia, Ladakh, and South Asia gave it access to a rich variety of textile influences. Centered around Skardu, Shigar, and Khaplu, the region is celebrated for its geometric silk embroidery on wool grounds, echoing historic wooden mosques and palaces."
  },
  {
    name: 'Diamer',
    slug: 'diamer',
    descriptor: 'Southern gateway with woodcarving-inspired chain-stitch',
    altitude: '1,265m – 2,200m · Chilas, Darel & Tangir Valleys',
    signatureMotif: 'Solar rosettes, chain-stitch & geometric medallions',
    artisanCount: '19 verified makers',
    crafts: 'Embroidered home textiles, cushion covers, ceremonial pieces',
    mapCoords: { cx: 175, cy: 245, path: 'M105,202 L245,208 L240,290 L110,285 Z' },
    description: 'Diamer district is the southern entry point to Gilgit-Baltistan and preserves an ancient decorative vocabulary seen in both its historic wooden architecture and its textiles. Chain-stitch rosettes and geometric borders adorn domestic and ceremonial objects alike.'
  },
  {
    name: 'Astore',
    slug: 'astore',
    descriptor: 'Lush eastern valleys preserving Dardic ceremonial dress',
    altitude: '2,600m – 3,200m · Rama, Gorikot & Rupal Foothills',
    signatureMotif: 'Multi-band collar & cuff geometric needlework',
    artisanCount: '23 verified makers',
    crafts: 'Ceremonial dresses, embroidered cuffs, highland wool cloth',
    mapCoords: { cx: 295, cy: 255, path: 'M248,208 L342,205 L340,295 L245,295 Z' },
    description: 'Astore district lies on the eastern flank of Nanga Parbat and represents a vital link in the Dardic cultural sphere. Ceremonial dress from Astore is distinguished by richly worked collar, placket, and cuff embroidery using locally spun wool and cotton blends.'
  }
];

/* ── 10. COMPLETE 4-STEP AUTHENTICITY PROMISE (Fixes incomplete section!) ── */
const AUTHENTICITY_PROMISE_STEPS = [
  {
    step: '01',
    title: 'Direct Guild Commissioning',
    description: 'Every textile is commissioned directly from documented family looms and women’s embroidery circles across Gilgit, Hunza, Nagar, Ghizer, Baltistan (Skardu), Diamer, and Astore—never mass-produced in urban factories.'
  },
  {
    step: '02',
    title: 'Natural Fibre & Dye Audit',
    description: 'Each batch is inspected at our Gilgit studio to verify 100% highland sheep wool, yak-wool pattu blends, combed cotton, and mulberry silk thread, rejecting synthetic acrylic substitutes.'
  },
  {
    step: '03',
    title: 'Cultural & Motif Verification',
    description: 'Regional motif names—from Hunza step-diamonds to Shigar latticework and Darel solar rosettes—are documented with local elders and researchers so cultural credit stays attached to the craft.'
  },
  {
    step: '04',
    title: 'Numbered Provenance Passport',
    description: 'Every piece leaves our studio with a physical numbered Origin & Story Card recording the district, craft technique, material grade, and care protocol.'
  }
];

/* ── 11. CURATED VERIFIED REVIEWS (Distinct from user localStorage reviews) ─ */
const CURATED_REVIEWS = [
  {
    id: 'rev-curated-1',
    name: 'A. Khan',
    city: 'Islamabad',
    date: 'September 2026',
    platform: 'Verified Studio Collector · Order #RG-8841',
    rating: 5,
    product: 'Embroidered Mountain Shawl',
    productId: 'embroidered-mountain-shawl-03',
    comment: 'The embroidered shawl exceeded my expectations — the stitching quality and the weight of the wool are exceptional. The story card that came with it made it a truly thoughtful gift.',
    verified: true
  },
  {
    id: 'rev-curated-2',
    name: 'S. Baig',
    city: 'Karachi',
    date: 'August 2026',
    platform: 'Verified Studio Collector · Order #RG-7920',
    rating: 5,
    product: 'Traditional Gilgiti Pakol Cap',
    productId: 'gilgiti-wool-cap-01',
    comment: 'I ordered the pakol cap for my father — the craftsmanship and the packaging were both impressive. It arrived in Karachi in three days. The regional information added real meaning.',
    verified: true
  },
  {
    id: 'rev-curated-3',
    name: 'M. Hassan',
    city: 'Lahore',
    date: 'August 2026',
    platform: 'Verified Corporate Gift Order · Order #RG-7614',
    rating: 5,
    product: 'Cultural Textile Heritage Box',
    productId: 'cultural-textile-gift-box-14',
    comment: 'The heritage gift box was the perfect corporate gift — beautiful packaging, authentic products and the cultural story booklet was genuinely fascinating for recipients who had never visited GB.',
    verified: true
  },
  {
    id: 'rev-curated-4',
    name: 'Dr. F. Lone',
    city: 'Rawalpindi',
    date: 'July 2026',
    platform: 'Verified Studio Collector · Order #RG-7105',
    rating: 5,
    product: 'Embroidered Wool Waistcoat',
    productId: 'ghizer-wool-waistcoat-07',
    comment: 'Impeccable tailoring on the Ghizer waistcoat. The crewel wool embroidery on Forest Green looks regal at family weddings without feeling overly heavy.',
    verified: true
  }
];

/* ── 12. CULTURAL JOURNAL ARTICLES ───────────────────────────────────────── */
const JOURNAL_ARTICLES = [
  {
    id: 'understanding-traditional-caps',
    title: 'Understanding the Traditional Caps of Gilgit-Baltistan',
    category: 'Craft',
    readingTime: '5 min read',
    date: 'September 18, 2026',
    author: 'ReGongches Cultural Research Desk',
    image: 'assets/images/gilgiti-wool-cap.webp',
    excerpt: 'The pakol and its regional variants represent one of the most recognisable material traditions of the Karakoram highlands. We look at the different styles, their documented origins and what distinguishes one from another.',
    featured: true,
    pullQuote: 'A mountain cap is never merely headwear; its wool weight, brim fold, and embroidery border tell you which valley a traveller calls home.',
    relatedProductIds: ['gilgiti-wool-cap-01', 'balti-embroidered-cap-02', 'hunza-silver-filigree-brooch-16'],
    body: `
      <p>Across the valleys of Gilgit-Baltistan, headwear has historically served both an essential climate function and a quiet language of regional identity. In high-altitude settlements where temperatures drop sharply after sunset, pure felted sheep's wool provides natural insulation while remaining breathable during steep mountain ascents.</p>
      <h4>The Gilgiti &amp; Punial Pakol</h4>
      <p>Constructed from a cylindrical tube of hand-fulled wool topped with a flat circular crown, the pakol gains its signature profile when the lower edge is rolled upward into a thick, cushioned band. In Gilgit, Punial, and Ghizer, natural undyed shades—oatmeal, walnut brown, and slate grey—are prized for their understated dignity. During weddings and festivals, the side fold is often adorned with a silver or brass plume pin (<em>jigha</em>) or a sprig of mountain juniper.</p>
      <h4>Balti Embroidered &amp; Structured Caps</h4>
      <p>Further east in Skardu, Shigar, and Khaplu, headwear takes on a more architectural geometry. Balti woollen caps frequently feature a structured dome band worked with dense silk-thread embroidery that mirrors the carved wooden cornices of historic Balti mosques and forts.</p>
      <h4>How We Verify Regional Origin</h4>
      <p>Many commercial caps sold in urban markets today use synthetic acrylic felt produced on industrial machines outside the region. At ReGongches, every cap is sourced directly from documented makers in Gilgit-Baltistan, crafted from 100% highland wool, and accompanied by a story card naming its district of origin.</p>
    `
  },
  {
    id: 'how-to-care-for-woollen-shawls',
    title: 'How to Care for Handwoven Woollen & Pattu Shawls',
    category: 'Care',
    readingTime: '3 min read',
    date: 'August 24, 2026',
    author: 'Master Weaver Advisory Panel',
    image: 'assets/images/embroidered-wool-shawl.webp',
    excerpt: 'A properly cared-for wool shawl can last decades and grow softer with age. We share the core principles of washing, drying and storing handmade wool textiles to preserve their quality and character.',
    featured: false,
    pullQuote: 'Highland wool remembers how it is treated: cold water, shade drying, and natural cedar are the only companions a heritage shawl needs.',
    relatedProductIds: ['embroidered-mountain-shawl-03', 'hunza-pattu-shawl-04', 'skardu-apricot-blossom-shawl-15'],
    body: `
      <p>A handwoven Hunza <em>pattu</em> or Balti embroidered shawl is designed to outlast fast-fashion seasons by decades. Because natural highland sheep and yak wool fibres are coated in microscopic scales and natural lanolin, they resist odours and dirt far better than synthetic fabrics.</p>
      <h4>1. Airing Before Washing</h4>
      <p>After wearing your shawl, hang it in a shaded, well-ventilated room for a few hours. Fresh air naturally revitalises wool fibres. Most heritage shawls only require washing once or twice a season.</p>
      <h4>2. Cold Water &amp; Gentle Soaking</h4>
      <p>When cleaning is needed, fill a basin with cold water (never warm or hot) and a few drops of pH-neutral wool wash. Submerge the shawl gently and let it soak for 10 minutes without rubbing, twisting, or wringing—agitation combined with heat causes natural wool to felt and shrink.</p>
      <h4>3. Flat Shade Drying &amp; Cedar Storage</h4>
      <p>Press excess water out by rolling the shawl inside a clean bath towel, then lay it flat on a dry surface away from direct sunlight or radiators. Before storing for summer, ensure the textile is completely clean and place it in a breathable cotton bag with natural Himalayan cedar blocks rather than harsh chemical mothballs.</p>
    `
  },
  {
    id: 'regional-embroidery-story',
    title: 'The Story Behind Regional Embroidery Patterns',
    category: 'Culture',
    readingTime: '7 min read',
    date: 'July 14, 2026',
    author: 'ReGongches Cultural Research Desk',
    image: 'assets/images/embroidered-wool-waistcoat.webp',
    excerpt: 'The geometric and floral motifs embroidered on GB textiles are not merely decorative — many have documented regional meanings and historical origins that differ from valley to valley.',
    featured: false,
    pullQuote: 'Every stitch is a coordinate: from the step-diamonds of Hunza to the solar rosettes of Diamer, mountain needlework maps the landscape.',
    relatedProductIds: ['ghizer-wool-waistcoat-07', 'nagar-embroidered-jacket-08', 'diamer-embroidered-cushion-11'],
    body: `
      <p>To an untrained eye, the embroidered borders of northern Pakistan may appear simply ornamental. Yet across the seven districts of Gilgit-Baltistan, needlework functions as an archive of botany, architecture, and ancient trade-route geometry.</p>
      <h4>Hunza &amp; Nagar: Peaks, Orchards &amp; Contrasting Grounds</h4>
      <p>In Hunza, cross-stitch and narrow-loom weaving favour stepped diamonds and ram's-horn spirals that follow the countable grid of handwoven fabric. Across the river in Nagar, artisans excel in freehand floral sprays worked in lustrous silk thread over deep indigo, midnight, or walnut wool—creating a dramatic relief reminiscent of alpine wildflowers against dark slate cliffs.</p>
      <h4>Diamer &amp; Astore: Woodcarving Translated into Thread</h4>
      <p>In Diamer and Astore, textile motifs share a direct lineage with the region's centuries-old carved deodar cedar pillars. Circular solar rosettes, interlocking chains, and protective border bands appear on ceremonial collars, cuffs, and domestic cushion covers.</p>
      <h4>Ethical Preservation</h4>
      <p>ReGongches never cuts up antique family heirlooms to manufacture modern accessories. Instead, we commission living artisans to create new panels using documented traditional patterns—ensuring cultural continuity and fair income for today's makers.</p>
    `
  },
  {
    id: 'art-of-ceremonial-gifting',
    title: 'The Highland Tradition of Textile Gifting at Weddings & Milestones',
    category: 'Tradition',
    readingTime: '4 min read',
    date: 'June 29, 2026',
    author: 'ReGongches Editorial Desk',
    image: 'assets/images/heritage-gift-box.webp',
    excerpt: 'Across Gilgit-Baltistan, presenting a hand-loomed shawl, Shuqa robe, or Pakol cap marks life’s highest honours. Explore how contemporary families keep this custom alive.',
    featured: false,
    pullQuote: 'To drape a handwoven shawl over a guest’s shoulders is to offer them the warmth and protection of the household itself.',
    relatedProductIds: ['heritage-gift-box-cap-shawl-12', 'cultural-textile-gift-box-14', 'astore-traditional-dress-06'],
    body: `
      <p>In the mountain communities of northern Pakistan, textiles have always been the primary medium of honour and hospitality. Whether welcoming a visiting dignitary, celebrating a groom's procession, or sending a student off to university, the presentation of a hand-loomed garment carries deep emotional weight.</p>
      <h4>The Symbolism of the Shawl &amp; Cap</h4>
      <p>Presenting a Pakol cap alongside an embroidered wool shawl signifies respect for the recipient's dignity and comfort. Unlike disposable modern gifts, a well-woven pattu or merino shawl accompanies its owner through decades of winters.</p>
      <h4>Modern Archival Presentation</h4>
      <p>Each ReGongches Heritage Gift Box honours this custom by pairing authentic valley textiles with a numbered Origin Verification Card, a 16-page story booklet, and a personal calligraphed message card.</p>
    `
  }
];

/* ── 13. DOCUMENTED ARTISAN COLLECTIVES ──────────────────────────────────── */
const ARTISANS = [
  {
    id: 'karimabad-loom-guild',
    name: 'Karimabad & Altit Loom Guild',
    leadPlaceholder: '[LEAD ARTISAN NAME & PORTRAIT PHOTO PLACEHOLDER]',
    region: 'Hunza District',
    specialty: 'Traditional Frame-Loom Pattu & Narrow-Loom Belts',
    members: '18 Master Weavers',
    experience: '3rd & 4th Generation',
    quote: 'When the shuttle passes through the warp by hand, the cloth breathes with the rhythm of the maker. No industrial machine can replicate that warmth.',
    story: 'Working on traditional wooden pit and frame looms in central Hunza, this collective preserves the two-panel herringbone pattu weave and geometric narrow-loom sashes using locally spun highland wool.'
  },
  {
    id: 'shigar-womens-embroidery',
    name: 'Shigar & Khaplu Women’s Heritage Circle',
    leadPlaceholder: '[COOPERATIVE COORDINATOR NAME & PHOTO PLACEHOLDER]',
    region: 'Baltistan (Skardu) Region',
    specialty: 'Silk-Thread Architectural & Botanical Embroidery',
    members: '32 Women Artisans',
    experience: 'Community Cooperative since 2014',
    quote: 'Our mothers taught us these border motifs by firelight during winter snows. Today, our needlework funds our daughters’ university education.',
    story: 'Operating from home studios across Shigar and Khaplu, artisans embroider fine merino shawls and woollen caps on flexible schedules that respect household and seasonal orchard responsibilities.'
  },
  {
    id: 'ghizer-punial-tailors',
    name: 'Punial & Yasin Highland Tailoring Workshop',
    leadPlaceholder: '[MASTER TAILOR NAME & PHOTO PLACEHOLDER]',
    region: 'Ghizer & Gilgit Districts',
    specialty: 'Fulled Wool Pakols, Shuqa Robes & Crewel Waistcoats',
    members: '14 Master Tailors & Embroiderers',
    experience: '25+ Years Average Craft Mastery',
    quote: 'A Shuqa or waistcoat must stand up to mountain wind while carrying the poise of a ceremonial gathering.',
    story: 'Specialising in structured wool outerwear and hand-felted headwear, the workshop combines traditional highland cuts with meticulous cotton-twill interior finishing.'
  },
  {
    id: 'nagar-rakaposhi-collective',
    name: 'Minapin & Sumayar Craft Studio',
    leadPlaceholder: '[LEAD EMBROIDERER NAME & PHOTO PLACEHOLDER]',
    region: 'Nagar & Astore Districts',
    specialty: 'Silk-on-Dark-Wool Jackets, Handbags & Ceremonial Dress',
    members: '21 Artisans',
    experience: 'Community-Led Guild',
    quote: 'Every petal and geometric diamond is counted by eye and memory—never stamped by machine.',
    story: 'Focused on preserving the luminous silk-on-wool floral embroidery of Nagar and the Dardic collar needlework of Astore in contemporary wearable forms.'
  }
];

/* ── 14. SIZE GUIDE DATA (CM & INCHES) ───────────────────────────────────── */
const SIZE_GUIDE_DATA = {
  waistcoats: {
    title: 'Waistcoats & Embroidered Jackets',
    note: 'Measured flat across the garment. For layering over heavy winter woollens, we recommend choosing one size up.',
    headers: ['Size', 'Chest', 'Shoulder', 'Garment Length'],
    rowsCm: [
      ['S',  '98 cm',  '42 cm', '66 cm'],
      ['M',  '104 cm', '44 cm', '69 cm'],
      ['L',  '110 cm', '46 cm', '72 cm'],
      ['XL', '116 cm', '48 cm', '74 cm']
    ],
    rowsIn: [
      ['S',  '38.5 in', '16.5 in', '26.0 in'],
      ['M',  '41.0 in', '17.3 in', '27.2 in'],
      ['L',  '43.3 in', '18.1 in', '28.3 in'],
      ['XL', '45.7 in', '18.9 in', '29.1 in']
    ]
  },
  clothing: {
    title: 'Shuqa Robes & Ceremonial Dresses',
    note: 'Traditional mountain robes feature a relaxed, dignified drape. Custom sleeve and hem tailoring is complimentary on Made-to-Order garments.',
    headers: ['Size', 'Chest / Bust', 'Sleeve (Center Back)', 'Full Length'],
    rowsCm: [
      ['XS',  '94 cm',  '76 cm', '112 cm'],
      ['S',   '100 cm', '79 cm', '116 cm'],
      ['M',   '106 cm', '82 cm', '120 cm'],
      ['L',   '112 cm', '85 cm', '124 cm'],
      ['XL',  '118 cm', '87 cm', '127 cm'],
      ['XXL', '124 cm', '89 cm', '130 cm']
    ],
    rowsIn: [
      ['XS',  '37.0 in', '29.9 in', '44.1 in'],
      ['S',   '39.4 in', '31.1 in', '45.7 in'],
      ['M',   '41.7 in', '32.3 in', '47.2 in'],
      ['L',   '44.1 in', '33.5 in', '48.8 in'],
      ['XL',  '46.5 in', '34.3 in', '50.0 in'],
      ['XXL', '48.8 in', '35.0 in', '51.2 in']
    ]
  },
  headwear: {
    title: 'Pakol Caps & Balti Headwear',
    note: 'Measure around your head 1 cm above your ears and eyebrows. Pakol rolled brims naturally adjust by ±1.5 cm.',
    headers: ['Size Label', 'Head Circumference', 'Fit Profile'],
    rowsCm: [
      ['S/M',      '56 – 58 cm', 'Standard Snug / Medium Crown'],
      ['L/XL',     '59 – 61 cm', 'Relaxed / Larger Crown'],
      ['One Size', '56 – 60 cm', 'Adjustable Rolled-Brim Pakol']
    ],
    rowsIn: [
      ['S/M',      '22.0 – 22.8 in', 'Standard Snug / Medium Crown'],
      ['L/XL',     '23.2 – 24.0 in', 'Relaxed / Larger Crown'],
      ['One Size', '22.0 – 23.6 in', 'Adjustable Rolled-Brim Pakol']
    ]
  }
};

/* ── 15. CUSTOMER CARE FAQS & LEGAL POLICIES ─────────────────────────────── */
const FAQS = [
  {
    category: 'Authenticity & Origin',
    q: 'How does ReGongches verify the regional origin of every product?',
    a: 'Every product undergoes our 4-step Origin Verification Protocol before listing: (1) Direct commissioning from documented workshops in one of the 7 districts of Gilgit-Baltistan, (2) Material audit confirming natural wool, cotton, or silk composition, (3) Cultural review of motif naming, and (4) Individual provenance card numbering at our Gilgit studio.'
  },
  {
    category: 'Shipping & Delivery',
    q: 'How long does nationwide delivery take across Pakistan?',
    a: 'Ready-to-ship ("Available" and "Low Stock") items dispatch within 24–48 hours. Delivery takes 1–2 business days within Gilgit-Baltistan, 2–4 business days to major cities (Islamabad, Rawalpindi, Lahore, Karachi, Peshawar), and 5–8 business days to remote districts. Orders of PKR 8,000 or more qualify for complimentary tracked shipping, and orders of PKR 15,000 or more also receive a complimentary Himalayan Cedar Sachet & Story Booklet.'
  },
  {
    category: 'Payment & COD',
    q: 'Is Cash on Delivery (COD) available for all items?',
    a: 'Cash on Delivery (COD) is available nationwide across Pakistan for orders up to PKR 25,000. For orders above PKR 25,000, COD is disabled for courier security and insurance compliance—please choose Direct Bank Transfer (IBAN / Raast) or JazzCash / EasyPaisa. Bespoke custom commissions require a 50% advance payment prior to loom preparation.'
  },
  {
    category: 'Promo Codes & Discounts',
    q: 'How do promo codes work and can I combine multiple codes?',
    a: 'Promo codes do not stack; only one code may be applied per order. HERITAGE10 gives 10% off any order, HUNZA15 gives 15% off orders of PKR 10,000 or more, and FREESHIP waives standard nationwide delivery charges.'
  },
  {
    category: 'Exchanges & Returns',
    q: 'What is your 14-Day Exchange & Return Policy?',
    a: 'Unused, unwashed in-stock items with original provenance tags and archival packaging intact may be exchanged or returned within 14 days of delivery. If a size does not fit, our concierge arranges a courier swap. Bespoke commissions tailored to individual measurements are eligible for complimentary size alterations.'
  },
  {
    category: 'Care & Longevity',
    q: 'Can I wash my Pakol cap or wool shawl in a washing machine?',
    a: 'Never machine-wash or tumble-dry handmade highland wool. Machine agitation and warm water cause natural wool scales to interlock and shrink. Instead, air your textile in the shade after wear, and spot-clean or gently soak in cold water with mild wool detergent when necessary.'
  },
  {
    category: 'Privacy & Terms',
    q: 'How are my personal details, reviews, and local browser preferences stored?',
    a: 'Your cart, wishlist, comparison tray, theme choice, and local order history are saved in your browser’s localStorage for convenience. When you complete an order, your delivery details are shared with our Gilgit dispatch desk via WhatsApp and/or our secure order endpoint strictly to fulfill and track your shipment. Customer reviews submitted on the site are stored locally Marked "Pending moderation" until verified against an order reference.'
  }
];

/* Export to global RG namespace for zero-build compatibility */
window.RG = window.RG || {};
Object.assign(window.RG, {
  PRODUCTS,
  THEMED_RAILS,
  FOUNDER_PICKS,
  LOOKBOOK_ENSEMBLES,
  REGIONS,
  AUTHENTICITY_PROMISE_STEPS,
  CURATED_REVIEWS,
  JOURNAL_ARTICLES,
  ARTISANS,
  SIZE_GUIDE_DATA,
  FAQS,
  ICONS_3D,
  BRAND_LOGO_DARK_SVG,
  BRAND_LOGO_LIGHT_SVG,
  createProductSvg,
  create3DIconSvg
});

window.PRODUCTS = PRODUCTS;
window.THEMED_RAILS = THEMED_RAILS;
window.FOUNDER_PICKS = FOUNDER_PICKS;
window.LOOKBOOK_ENSEMBLES = LOOKBOOK_ENSEMBLES;
window.REGIONS = REGIONS;
window.AUTHENTICITY_PROMISE_STEPS = AUTHENTICITY_PROMISE_STEPS;
window.CURATED_REVIEWS = CURATED_REVIEWS;
window.JOURNAL_ARTICLES = JOURNAL_ARTICLES;
window.ARTISANS = ARTISANS;
window.SIZE_GUIDE_DATA = SIZE_GUIDE_DATA;
window.FAQS = FAQS;
window.ICONS_3D = ICONS_3D;
window.BRAND_LOGO_DARK_SVG = BRAND_LOGO_DARK_SVG;
window.BRAND_LOGO_LIGHT_SVG = BRAND_LOGO_LIGHT_SVG;
