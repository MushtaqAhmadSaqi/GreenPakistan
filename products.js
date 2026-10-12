/**
 * ReGongches — Product Data
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the single source of truth for the product catalogue.
 * To add a new product, append an object to the PRODUCTS array below.
 *
 * Field reference:
 *  id            – unique slug string (used as cart key)
 *  name          – display name (do NOT include "(Sample)")
 *  category      – one of: 'Clothing' | 'Headwear' | 'Shawls & Textiles' | 'Waistcoats' | 'Accessories' | 'Heritage Gifts'
 *  region        – one of: 'Gilgit' | 'Baltistan' | 'Hunza' | 'Ghizer' | 'Nagar' | 'Diamer' | 'Astore'
 *  price         – PKR integer
 *  compareAtPrice – PKR integer or null (shows strikethrough)
 *  status        – 'Available' | 'Made-to-Order' | 'Low Stock'
 *  handmade      – boolean
 *  handmadeLabel – short string e.g. 'Handmade' | 'Hand-finished' | 'Hand-embroidered'
 *  materials     – string describing materials
 *  care          – care instructions string
 *  sizes         – array of strings (e.g. ['S','M','L','XL'] or ['One Size'])
 *  colors        – array of {label, hex}
 *  images        – array; index 0 = primary, index 1 = hover (use same if only one)
 *  shortStory    – 1–2 sentence cultural context (must be reviewed before publish)
 *  artisanNote   – optional string (omit if not confirmed)
 *  isNew         – boolean
 *  isBestseller  – boolean
 *  isSample      – true on ALL entries (prototype disclaimer; never rendered on screen)
 *
 * IMPORTANT: All prices, descriptions and cultural claims are sample/prototype
 * content that MUST be reviewed and confirmed before public launch.
 */

const PRODUCTS = [

  /* ── HEADWEAR ─────────────────────────────────────────────────────────── */
  {
    id: 'gilgiti-wool-cap-01',
    name: 'Traditional Gilgiti Pakol Cap',
    category: 'Headwear',
    region: 'Gilgit',
    price: 1800,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Pure wool, natural dye. Outer shell 100% wool; soft inner lining.',
    care: 'Hand wash cold in mild detergent. Reshape while damp and air dry flat. Do not tumble dry.',
    sizes: ['S/M (56–58 cm)', 'L/XL (59–61 cm)', 'One Size'],
    colors: [
      { label: 'Natural Oatmeal', hex: '#C8B89A' },
      { label: 'Charcoal Grey',   hex: '#4A4A4A' },
      { label: 'Mountain Brown',  hex: '#7A5C3A' }
    ],
    images: ['gilgiti-wool-cap.webp', 'gilgiti-wool-cap.webp'],
    shortStory: 'The pakol is an iconic rolled-brim cap worn across Gilgit-Baltistan and the broader Hindu Kush region. Its distinctive silhouette has been shaped by generations of highland craftspeople using local wool.',
    artisanNote: null,
    isNew: false,
    isBestseller: true,
    isSample: true
  },

  {
    id: 'balti-embroidered-cap-02',
    name: 'Balti Embroidered Woollen Cap',
    category: 'Headwear',
    region: 'Baltistan',
    price: 2200,
    compareAtPrice: 2800,
    status: 'Low Stock',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    materials: '100% handspun wool with silk thread embroidery detailing.',
    care: 'Dry clean or spot clean gently. Store in the dust bag provided.',
    sizes: ['S/M (56–58 cm)', 'L/XL (59–61 cm)'],
    colors: [
      { label: 'Deep Maroon',   hex: '#7A263A' },
      { label: 'Forest Green',  hex: '#2D5A3D' }
    ],
    images: ['gilgiti-wool-cap.webp', 'gilgiti-wool-cap.webp'],
    shortStory: 'Baltistan's embroidery tradition uses geometric motifs passed down through family lineages. Each cap's border pattern carries regional significance that varies by valley.',
    artisanNote: null,
    isNew: true,
    isBestseller: false,
    isSample: true
  },

  /* ── SHAWLS & TEXTILES ─────────────────────────────────────────────────── */
  {
    id: 'embroidered-mountain-shawl-03',
    name: 'Embroidered Mountain Shawl',
    category: 'Shawls & Textiles',
    region: 'Baltistan',
    price: 5000,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Hand-finished',
    materials: 'Soft merino wool blend, hand-embroidered border in silk thread.',
    care: 'Hand wash in cold water with wool-safe detergent. Dry flat in shade. Iron on low heat with cloth.',
    sizes: ['One Size (180 × 75 cm)'],
    colors: [
      { label: 'Ivory & Gold',   hex: '#F7F1E7' },
      { label: 'Charcoal & Red', hex: '#252525' }
    ],
    images: ['embroidered-wool-shawl.webp', 'embroidered-wool-shawl.webp'],
    shortStory: 'Woven in the high valleys of Baltistan, this shawl's border pattern is inspired by the geometric tilework of historic Balti architecture — a tradition of embellishment adapted to textile by local weavers.',
    artisanNote: null,
    isNew: false,
    isBestseller: true,
    isSample: true
  },

  {
    id: 'hunza-pattu-shawl-04',
    name: 'Hunza Pattu Woven Shawl',
    category: 'Shawls & Textiles',
    region: 'Hunza',
    price: 6500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handwoven',
    materials: 'Traditional pattu fabric — hand-woven yak and sheep wool blend on a frame loom.',
    care: 'Dry clean recommended. If hand washing, use cold water only. Lay flat to dry.',
    sizes: ['Standard (200 × 80 cm)', 'Large (220 × 90 cm)'],
    colors: [
      { label: 'Natural Undyed', hex: '#C8B89A' },
      { label: 'Earthy Rust',    hex: '#8B4513' }
    ],
    images: ['embroidered-wool-shawl.webp', 'embroidered-wool-shawl.webp'],
    shortStory: 'Pattu, the hand-woven textile of the Hunza valley, has been produced on traditional frame looms for centuries. Its characteristic herringbone weave provides exceptional warmth suited to high-altitude winters.',
    artisanNote: null,
    isNew: true,
    isBestseller: false,
    isSample: true
  },

  /* ── CLOTHING ──────────────────────────────────────────────────────────── */
  {
    id: 'ghizer-shuqa-robe-05',
    name: 'Ghizer Shuqa Woollen Robe',
    category: 'Clothing',
    region: 'Ghizer',
    price: 8500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Locally sourced wool, hand-stitched with a traditional Ghizer cut. Unlined for breathability.',
    care: 'Cold hand wash or dry clean. Hang dry. Store folded with cedar.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { label: 'Natural Grey',  hex: '#9E9E9E' },
      { label: 'Walnut Brown',  hex: '#5C4033' }
    ],
    images: ['embroidered-wool-waistcoat.webp', 'embroidered-wool-waistcoat.webp'],
    shortStory: 'The Shuqa is a full-length woollen robe traditionally worn by men in the Ghizer district during colder months. Its ample cut and durable wool make it equally suited to daily life and ceremonial occasions.',
    artisanNote: null,
    isNew: false,
    isBestseller: false,
    isSample: true
  },

  {
    id: 'astore-traditional-dress-06',
    name: 'Astore Ceremonial Dress Set',
    category: 'Clothing',
    region: 'Astore',
    price: 12000,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Handwoven cotton-wool blend with embroidered neckline and cuffs.',
    care: 'Dry clean only. Do not wring. Store in breathable cloth bag.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { label: 'Deep Indigo',   hex: '#2C3E7A' },
      { label: 'Warm Maroon',   hex: '#7A263A' }
    ],
    images: ['embroidered-wool-waistcoat.webp', 'embroidered-wool-waistcoat.webp'],
    shortStory: 'Traditional dress from Astore district features intricate embroidery at the collar and sleeve openings. The patterns are region-specific and have been documented as part of the broader Dardic textile tradition.',
    artisanNote: null,
    isNew: true,
    isBestseller: false,
    isSample: true
  },

  /* ── WAISTCOATS & OUTERWEAR ────────────────────────────────────────────── */
  {
    id: 'ghizer-wool-waistcoat-07',
    name: 'Embroidered Wool Waistcoat',
    category: 'Waistcoats',
    region: 'Ghizer',
    price: 6500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Handwoven wool outer, cotton lining. Front embroidery in wool thread.',
    care: 'Dry clean recommended. Spot clean with damp cloth if needed.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { label: 'Forest Green',   hex: '#2D5A3D' },
      { label: 'Mountain Brown', hex: '#7A5C3A' },
      { label: 'Navy Slate',     hex: '#2C3E50' }
    ],
    images: ['embroidered-wool-waistcoat.webp', 'embroidered-wool-waistcoat.webp'],
    shortStory: 'The embroidered waistcoat is a central garment in the festive dress of Ghizer communities. Its front panels feature repeating floral and geometric motifs worked in contrasting wool thread.',
    artisanNote: null,
    isNew: false,
    isBestseller: true,
    isSample: true
  },

  {
    id: 'nagar-embroidered-jacket-08',
    name: 'Nagar Embroidered Wool Jacket',
    category: 'Waistcoats',
    region: 'Nagar',
    price: 9800,
    compareAtPrice: 11500,
    status: 'Low Stock',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    materials: 'Outer: 100% wool. Lining: soft cotton. All embroidery by hand in silk thread.',
    care: 'Dry clean only. Keep away from direct sunlight to preserve embroidery colour.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { label: 'Midnight Blue', hex: '#1B2A4A' },
      { label: 'Terracotta',    hex: '#A0522D' }
    ],
    images: ['embroidered-wool-waistcoat.webp', 'embroidered-wool-waistcoat.webp'],
    shortStory: 'Nagar valley is known for its fine embroidery skills, particularly the dense floral motifs worked in silk thread on dark wool grounds. This jacket represents that tradition in a wearable everyday garment.',
    artisanNote: null,
    isNew: false,
    isBestseller: false,
    isSample: true
  },

  /* ── ACCESSORIES ───────────────────────────────────────────────────────── */
  {
    id: 'nagar-textile-handbag-09',
    name: 'Embroidered Textile Handbag',
    category: 'Accessories',
    region: 'Nagar',
    price: 2200,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Outer: embroidered wool textile. Inner: cotton lining. Strap: braided cotton.',
    care: 'Spot clean with damp cloth. Do not machine wash. Air dry only.',
    sizes: ['One Size (28 × 22 × 8 cm)'],
    colors: [
      { label: 'Oatmeal & Gold',  hex: '#C8B89A' },
      { label: 'Maroon & Ivory',  hex: '#7A263A' }
    ],
    images: ['embroidered-textile-handbag.webp', 'embroidered-textile-handbag.webp'],
    shortStory: 'Woven textile bags have been practical companions in the mountain communities of GB for generations. This handbag adapts a traditional textile panel into a contemporary accessory without altering the original motif.',
    artisanNote: null,
    isNew: false,
    isBestseller: false,
    isSample: true
  },

  {
    id: 'hunza-handwoven-belt-10',
    name: 'Hunza Hand-Woven Woollen Belt',
    category: 'Accessories',
    region: 'Hunza',
    price: 950,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handwoven',
    materials: '100% wool, woven on a traditional narrow loom. Brass buckle closure.',
    care: 'Spot clean only. Do not soak. Store rolled.',
    sizes: ['S/M (70–85 cm)', 'L/XL (86–100 cm)'],
    colors: [
      { label: 'Red & Black',      hex: '#8B0000' },
      { label: 'Indigo & Natural', hex: '#2C3E7A' }
    ],
    images: ['embroidered-textile-handbag.webp', 'embroidered-textile-handbag.webp'],
    shortStory: 'Narrow-loom belts and sashes are an integral part of traditional dress across Hunza. Their repeating geometric patterns are among the oldest documented textile motifs of the Karakoram highlands.',
    artisanNote: null,
    isNew: true,
    isBestseller: false,
    isSample: true
  },

  {
    id: 'diamer-embroidered-cushion-11',
    name: 'Diamer Embroidered Cushion Cover',
    category: 'Accessories',
    region: 'Diamer',
    price: 1500,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Hand-embroidered',
    materials: 'Cotton-linen ground, wool embroidery thread. Zip closure. 45 × 45 cm.',
    care: 'Remove cover and hand wash cold. Iron reverse side on medium. Insert not included.',
    sizes: ['45 × 45 cm'],
    colors: [
      { label: 'Natural Linen',  hex: '#D2B48C' },
      { label: 'Off-White',      hex: '#F5F5DC' }
    ],
    images: ['embroidered-textile-handbag.webp', 'embroidered-textile-handbag.webp'],
    shortStory: 'The mirror-work and chain-stitch embroidery style of Diamer district adorns ceremonial textiles and domestic objects alike. This cushion cover brings that decorative language into the home.',
    artisanNote: null,
    isNew: false,
    isBestseller: false,
    isSample: true
  },

  /* ── HERITAGE GIFTS ────────────────────────────────────────────────────── */
  {
    id: 'heritage-gift-box-cap-shawl-12',
    name: 'Traditional Cap & Shawl Gift Set',
    category: 'Heritage Gifts',
    region: 'Gilgit',
    price: 7500,
    compareAtPrice: 8500,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Includes one pakol cap (wool) and one shawl (wool blend). Gift-boxed with story card.',
    care: 'Refer to individual item care guides enclosed in the gift box.',
    sizes: ['Cap: S/M or L/XL (specify at checkout)', 'Shawl: One Size'],
    colors: [
      { label: 'Natural Heritage Palette', hex: '#C8B89A' }
    ],
    images: ['heritage-gift-box.webp', 'heritage-gift-box.webp'],
    shortStory: 'This curated set pairs two of Gilgit-Baltistan's most iconic textile objects — the pakol cap and the woven shawl — in premium gift packaging with an authenticity card and cultural story insert.',
    artisanNote: null,
    isNew: false,
    isBestseller: true,
    isSample: true
  },

  {
    id: 'embroidered-accessories-set-13',
    name: 'Embroidered Accessories Gift Set',
    category: 'Heritage Gifts',
    region: 'Baltistan',
    price: 4800,
    compareAtPrice: null,
    status: 'Available',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Includes one embroidered handbag and one hand-woven belt. Premium gift packaging.',
    care: 'Refer to individual item care guides enclosed.',
    sizes: ['One Size'],
    colors: [
      { label: 'Maroon & Ivory', hex: '#7A263A' }
    ],
    images: ['heritage-gift-box.webp', 'heritage-gift-box.webp'],
    shortStory: 'A thoughtfully assembled introduction to the textile traditions of Baltistan — combining an embroidered bag and a woven belt, each made using regional techniques and presented with cultural context.',
    artisanNote: null,
    isNew: true,
    isBestseller: false,
    isSample: true
  },

  {
    id: 'cultural-textile-gift-box-14',
    name: 'Cultural Textile Heritage Box',
    category: 'Heritage Gifts',
    region: 'Hunza',
    price: 9500,
    compareAtPrice: null,
    status: 'Made-to-Order',
    handmade: true,
    handmadeLabel: 'Handmade',
    materials: 'Curated selection of 3–4 small textile items. Content varies by season. Full list provided at order.',
    care: 'Individual care guides enclosed with each item.',
    sizes: ['Standard Gift Box'],
    colors: [
      { label: 'Seasonal Selection', hex: '#C59A3D' }
    ],
    images: ['heritage-gift-box.webp', 'heritage-gift-box.webp'],
    shortStory: 'The Heritage Box brings together a seasonally curated selection of small textile objects from the Hunza valley — a considered introduction to the material culture of one of Pakistan's most celebrated mountain regions.',
    artisanNote: null,
    isNew: false,
    isBestseller: false,
    isSample: true
  }

];

/* ── REGION METADATA ──────────────────────────────────────────────────────── */
const REGIONS = [
  {
    name: 'Gilgit',
    descriptor: 'The administrative and cultural hub of GB',
    crafts: 'Pakol caps, woollen outerwear, embroidered accessories',
    description: 'Gilgit sits at the confluence of major Karakoram valleys and has long been a crossroads of craft traditions. The city and its surrounding villages are known for their skilled production of the iconic pakol cap and a range of embroidered textiles that reflect the meeting of multiple regional influences.'
  },
  {
    name: 'Baltistan',
    descriptor: 'Ancient Silk Road heritage and mountain embroidery',
    crafts: 'Embroidered caps, geometric shawls, decorative textiles',
    description: 'Baltistan's position on historic trade routes connecting Central Asia and South Asia gave it access to a rich variety of textile influences. The region is particularly known for its distinctive geometric embroidery, worked in silk thread on wool grounds, with motifs that carry documented historical significance.'
  },
  {
    name: 'Hunza',
    descriptor: 'Celebrated valley famous for pattu weaving traditions',
    crafts: 'Pattu shawls, hand-woven belts, dyed textiles',
    description: 'The Hunza valley has long attracted attention for its distinctive material culture, including the pattu — a hand-woven wool textile produced on traditional frame looms. Hunza weavers are known for their precision and the exceptional warmth of their products, suited to the valley's high altitude.'
  },
  {
    name: 'Ghizer',
    descriptor: 'Remote western district with distinct robe-making heritage',
    crafts: 'Shuqa robes, woollen garments, woven sashes',
    description: 'Ghizer district, in the western part of Gilgit-Baltistan, maintains a distinct textile identity centred on the shuqa — a full-length woollen robe that is both practical outerwear and a ceremonial garment. The district's relative isolation has helped preserve older production techniques.'
  },
  {
    name: 'Nagar',
    descriptor: 'Karakoram valley known for fine silk-thread embroidery',
    crafts: 'Embroidered jackets, decorative textiles, woven accessories',
    description: 'Nagar valley, adjacent to Hunza, is distinguished by its fine embroidery tradition. Local craftspeople are known for their meticulous silk-thread work on dark wool grounds, producing garments and objects characterised by their dense floral and geometric patterning.'
  },
  {
    name: 'Diamer',
    descriptor: 'Southern gateway with mirror-work and chain-stitch traditions',
    crafts: 'Embroidered textiles, cushion covers, decorative pieces',
    description: 'Diamer district is the southern entry point to Gilgit-Baltistan and has a distinctive embroidery style featuring mirror-work and chain-stitch patterns. This decorative language appears on both clothing and domestic textiles and is among the most visually distinctive craft traditions of the region.'
  },
  {
    name: 'Astore',
    descriptor: 'Eastern district with Dardic textile traditions',
    crafts: 'Ceremonial dresses, embroidered garments, woollen cloth',
    description: 'Astore district lies at the southern edge of Gilgit-Baltistan and represents a meeting point between the textile traditions of the broader Dardic cultural area and those of the Karakoram. Ceremonial dress from Astore is distinguished by its embroidered collar and cuff work, using local wool and thread.'
  }
];

/* ── JOURNAL ARTICLES ─────────────────────────────────────────────────────── */
const JOURNAL_ARTICLES = [
  {
    id: 'understanding-traditional-caps',
    title: 'Understanding the Traditional Caps of Gilgit-Baltistan',
    category: 'Craft',
    readingTime: '5 min read',
    date: 'September 2026',
    excerpt: 'The pakol and its regional variants represent one of the most recognisable material traditions of the Karakoram highlands. We look at the different styles, their documented origins and what distinguishes one from another.',
    featured: true
  },
  {
    id: 'how-to-care-for-woollen-shawls',
    title: 'How to Care for Woollen Shawls',
    category: 'Care',
    readingTime: '3 min read',
    date: 'August 2026',
    excerpt: 'A properly cared-for wool shawl can last decades. We share the core principles of washing, drying and storing handmade wool textiles to preserve their quality and character.',
    featured: false
  },
  {
    id: 'regional-embroidery-story',
    title: 'The Story Behind Regional Embroidery Patterns',
    category: 'Culture',
    readingTime: '7 min read',
    date: 'July 2026',
    excerpt: 'The geometric and floral motifs embroidered on GB textiles are not merely decorative — many have documented regional meanings and historical origins that differ from valley to valley.',
    featured: false
  }
];

/* ── CONSTANTS ─────────────────────────────────────────────────────────────── */
const FREE_DELIVERY_THRESHOLD = 8000;   // PKR
const GIFT_WRAP_PRICE         = 350;    // PKR
const WHATSAPP_NUMBER         = '923001234567'; // Replace with real number before launch
const WHATSAPP_BASE_URL       = `https://wa.me/${WHATSAPP_NUMBER}`;
const CART_KEY                = 'regongches-cart';
const WISHLIST_KEY            = 'regongches-wishlist';
const CURRENCY_KEY            = 'regongches-currency';
const RECENT_SEARCHES_KEY     = 'regongches-recent-searches';
const RECENTLY_VIEWED_KEY     = 'regongches-recently-viewed';

/* Export for use in script.js via global scope (no bundler) */
