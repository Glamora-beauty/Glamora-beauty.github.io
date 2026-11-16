# GLAMORA — Premium Beauty & Cosmetics E-Commerce Platform

> **"Discover Your Beauty. Express Your Elegance."**

**GLAMORA** is an elegant, modern, responsive multi-brand beauty and cosmetics e-commerce website built for **GitHub Pages**. Customers can discover genuine cosmetics, explore comprehensive product categories, customize shades and variants, curate a shopping bag, and place personalized orders directly through **WhatsApp**.

Official WhatsApp Ordering Number: **`+92 318 3085519`**  
Official WhatsApp Link: [https://wa.me/923183085519](https://wa.me/923183085519)

---

## 1. Strict Business Principles

1. **Zero Price Display**: Prices are never displayed on cards, details, cart, or messages. No fake baseline prices, fake sale prices, or discount badges. Live batch pricing and availability are confirmed exclusively via WhatsApp consultation.
2. **100% Genuine Brands Only**: Displays only authentic, original brand names (Huda Beauty, NARS, L'Oréal Paris, e.l.f., MAC, The Ordinary, Dior, etc.). Never claims affiliation, authorization, or certifications without reliable evidence.
3. **WhatsApp Assisted Checkout**: No online payment gateways or card processors. All orders are submitted for confirmation directly to `+92 318 3085519`.
4. **Configurable Product Status**: Configurable availability statuses (`in_stock`, `low_stock`, `pre_order`).
5. **Static Hosting Compatibility**: Fully compatible with zero-backend GitHub Pages hosting.

---

## 2. Directory & File Structure

```
Glamora/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Pages CI/CD workflow
├── assets/
│   ├── banners/                    # Editorial luxury SVG banners
│   ├── icons/                      # Category and feature icons
│   ├── logo/
│   │   └── glamora-logo.png        # Official high-resolution Glamora logo
│   └── products/
│       ├── accessories/            # Makeup brushes, Taklon kits, blenders
│       ├── beauty-kits/            # Lip contour sets, cheek palettes, spray duos
│       ├── haircare/               # Hairline touch-up powders, scalp essentials
│       ├── makeup/                 # Foundations, lipsticks, mascaras, eyeshadows
│       ├── skincare/               # Cleansers, toners, Centella ampoules, masks
│       └── placeholder.svg         # Elegant branded Glamora SVG placeholder
├── css/
│   ├── animations.css              # Subtle shimmer, transitions, and live pulses
│   ├── components.css              # Gallery, cart, checkout, filters, accordion
│   ├── responsive.css              # Mobile-first overrides, drawer, sticky bottom bar
│   └── style.css                   # Core design system tokens, typography, grid
├── data/
│   ├── brands.json                 # Directory of authentic represented brands
│   ├── categories.json             # 6 primary categories and subcategories
│   └── products.json               # Master product catalog (53+ items, zero prices)
├── js/
│   ├── config/
│   │   └── visitor-counter-config.js # Analytics configuration (CountAPI & Firebase)
│   ├── app.js                      # Core UI, mobile nav drawer, toasts, year
│   ├── cart.js                     # LocalStorage cart manager with variant tracking
│   ├── checkout.js                 # Customer form, live WhatsApp draft preview
│   ├── filters.js                  # Multi-facet filter and non-price sorting engine
│   ├── products.js                 # Catalog loader, product card & details renderer
│   ├── search.js                   # Instant search engine with history & tags
│   ├── visitor-counter.js          # Live 4-metric visitor engine with PKT timezone
│   └── whatsapp.js                 # WhatsApp message generator & wa.me encoder
├── 404.html                        # Custom luxury 404 error page
├── about.html                      # About Glamora & multi-brand philosophy
├── brands.html                     # Authentic brand directory with A-Z index
├── cart.html                       # Shopping bag with variant controls (no prices)
├── categories.html                 # Comprehensive category & subcategory directory
├── checkout.html                   # Delivery details & WhatsApp checkout workflow
├── contact.html                    # Direct concierge contact form & WhatsApp link
├── faq.html                        # Frequently Asked Questions accordion
├── index.html                      # Premium homepage with hero, trending & stats
├── new-arrivals.html               # New arrivals collection
├── privacy.html                    # Privacy policy (localStorage & analytics)
├── product.html                    # Dynamic product detail page (?id=...)
├── README.md                       # Comprehensive documentation
├── robots.txt                      # Search engine crawler permissions
├── shop.html                       # Complete shop catalog with faceted sidebar
├── sitemap.xml                     # Search engine sitemap
└── terms.html                      # Terms & conditions & multi-brand disclaimers
```

---

## 3. Pages & Features

| Page | URL | Purpose & Functionality |
|------|-----|-------------------------|
| **Home** | `index.html` | Hero cosmetics banner, category highlights, trending products, featured brands, new arrivals, curated collection, why shop with Glamora, Instagram aesthetic gallery, newsletter, and 4-metric footer analytics. |
| **Shop All** | `shop.html` | Complete product catalog with faceted sidebar filters (category, brand, availability, trending, new) and non-price sorting (Popularity, Newest, A-Z, Z-A). |
| **Product Details** | `product.html?id=[id]` | Large interactive image gallery with thumbnails, shade selectors, color swatches, size options, quantity counter, customer notes field, Add to Bag, Direct WhatsApp Order, specifications table, and complementary products. |
| **Categories** | `categories.html` | Full category showcase across Makeup, Skincare, Beauty Kits, Accessories, Haircare, and Fragrance with clickable subcategory tags. |
| **Brands** | `brands.html` | Authentic brand directory with alphabetical A–Z filtering, brand heritage, and direct catalog links. |
| **Trending** | `trending.html` | Dedicated view for high-demand, trending beauty products. |
| **New Arrivals** | `new-arrivals.html` | Dedicated view for newly introduced catalog arrivals. |
| **Shopping Bag** | `cart.html` | LocalStorage bag with quantity counters, variant preservation, custom shade notes, gift wrapping toggle, and zero prices. |
| **Order Information** | `checkout.html` | Pakistan delivery form (City, Address, Instructions), live formatted WhatsApp message preview, copy-to-clipboard, WhatsApp redirection, and confirmation screen. |
| **About Us** | `about.html` | Glamora brand story, authenticity pledge, and multi-brand retailer transparency. |
| **Contact Us** | `contact.html` | Direct concierge inquiries, WhatsApp link, and support hours. |
| **FAQ** | `faq.html` | Common questions about no-price policy, WhatsApp checkout, authenticity, and Pakistan delivery. |
| **Privacy Policy** | `privacy.html` | Transparent information on client-side localStorage, anonymous analytics UUIDs, and WhatsApp privacy. |
| **Terms & Conditions**| `terms.html` | Ordering conditions, availability verification, and disclaimers. |
| **404 Page** | `404.html` | Luxury error page with catalog redirection. |

---

## 4. Live Visitor Statistics System

The website footer displays four live analytics metrics:
1. **TOTAL VISITORS**: All-time deduplicated unique visitors.
2. **TODAY'S VISITORS**: Unique visitors for the current Pakistan calendar day (PKT, UTC+5). Resets automatically at 00:00:00 PKT.
3. **ONLINE VISITORS**: Active concurrent shoppers within a 5-minute activity window.
4. **TOTAL PAGE VIEWS**: Total catalog page views.

### File Architecture
- `js/config/visitor-counter-config.js`
- `js/visitor-counter.js`

### Operational Modes

#### Mode 1: Zero-Setup Mode (Default)
Uses public keyless **CountAPI** (`https://countapi.mileshilliard.com/api/v1`) combined with client-side deduplication using an anonymous UUID v4 stored in `localStorage` (`glamora_anon_uid`).
- No API keys or server setup needed.
- If CountAPI is blocked by an adblocker or network restriction, the system gracefully falls back to deterministic local session counters without throwing JavaScript console errors or breaking page load.
- *Technical Note on Limitations*: CountAPI increments simple numerical counters; it does not maintain a cross-device relational user database. Mode 1 provides the best possible zero-setup approximation for static GitHub Pages.

#### Mode 2: Optional Firebase Realtime Database
For 100% accurate global presence across multiple devices:
1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com).
2. Create a **Realtime Database**.
3. Open `js/config/visitor-counter-config.js` and update:
   ```javascript
   window.GLAMORA_VISITOR_CONFIG = {
     provider: 'firebase', // Change from 'countapi' to 'firebase'
     firebase: {
       apiKey: "YOUR_API_KEY",
       authDomain: "your-app.firebaseapp.com",
       databaseURL: "https://your-app-default-rtdb.firebaseio.com",
       projectId: "your-app",
       storageBucket: "your-app.appspot.com",
       messagingSenderId: "...",
       appId: "..."
     },
     // ...
   };
   ```
4. Set the following Realtime Database security rules:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
5. Add the Firebase SDK scripts before `js/visitor-counter.js` in your HTML:
   ```html
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
   ```

---

## 5. How to Add and Update Products

All product data is centralized inside `data/products.json`. No database or server-side build step is required!

### Product Schema
```json
{
  "id": "unique-product-slug",
  "name": "Full Product Title",
  "brand": "Genuine Brand Name",
  "brandSlug": "genuine-brand-slug",
  "category": "makeup", // makeup, skincare, beauty-kits, haircare, accessories, fragrance
  "subcategory": "Foundation",
  "shortDescription": "One-line highlight of the product.",
  "description": "Full paragraph description explaining formulation and benefits.",
  "primaryImage": "assets/products/makeup/product-image.jpeg",
  "images": [
    "assets/products/makeup/product-image.jpeg"
  ],
  "shades": [
    "Fair 01",
    "Natural 02",
    "Honey 03"
  ],
  "colors": [
    { "name": "Natural", "hex": "#f5ddcf" }
  ],
  "sizes": ["30ml / 1.0 fl oz"],
  "variants": ["Matte Finish"],
  "specifications": {
    "Formulation": "Liquid",
    "Coverage": "Medium to Full",
    "Finish": "Natural Satin",
    "Skin Type": "All Skin Types"
  },
  "availability": "in_stock", // in_stock, low_stock, or pre_order
  "trending": true,
  "newArrival": false,
  "featured": true
}
```

> **IMPORTANT**: Never add price fields (`price`, `old_price`, `sale_price`, `pkr`, etc.) into `products.json`. In accordance with Glamora's business rules, all pricing is confirmed via WhatsApp.

---

## 6. How to Deploy to GitHub Pages

### Step 1: Initialize Git Repository
In the root folder of Glamora, run:
```bash
git init
git add .
git commit -m "Initial commit of Glamora beauty platform"
```

### Step 2: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `Glamora`.
2. Connect your local repository and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Glamora.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** &rarr; **Pages** (under Code and automation).
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** (the included `.github/workflows/deploy.yml` will automatically build and deploy the site).
   - *Alternative*: If choosing "Deploy from a branch", select branch `main` and folder `/ (root)`, then click Save.
4. Your website will be live at:
   `https://YOUR_USERNAME.github.io/Glamora/`

All asset links (`href="shop.html"`, `src="assets/..."`) use relative paths, guaranteeing 100% path compatibility with GitHub Pages repository sub-paths.

---

## 7. Local Testing & Development

To test the website locally, run any local static file server:

### With Node.js:
```bash
npx serve .
# or
npx http-server .
```

### With Python:
```bash
python -m http.server 8000
```

Then open `http://localhost:8000` (or the port reported) in your browser.

---

## 8. License & Authentic Brand Credits

All third-party brand names, logos, and trademarks (e.g., Huda Beauty, NARS, MAC Cosmetics, L'Oréal Paris, The Ordinary, Dior, Cetaphil, Anua, SKIN1004, etc.) are the property of their respective trademark holders. Glamora is an independent beauty destination retailing multi-brand cosmetics in Pakistan.

&copy; 2026 GLAMORA. All rights reserved. Premium Beauty & Cosmetics. &bull; Developed by [https://murtuzadeveloper.github.io/](https://murtuzadeveloper.github.io/)
