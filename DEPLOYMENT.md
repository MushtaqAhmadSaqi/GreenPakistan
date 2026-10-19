# ReGongches — Production Deployment & Configuration Guide

This guide details how to configure, verify, test, and deploy the **ReGongches** e-commerce storefront to any modern static hosting provider.

---

## 1. Architecture Summary

- **Technology:** Pure HTML5, Modular CSS3 (custom properties design system), Modern JavaScript (ES6+ with `defer` modules).
- **Build Step:** **Zero build steps required.** No Node compilation, Webpack, Vite, or npm installs needed to run the website.
- **Data Layer:** `data/products.js` containing 16 handcrafted products, 7 district profiles, curated journal essays, artisan collectives, and reviews.
- **Cart & Order Storage:** Client-side `localStorage` with multi-tab `storage` event synchronization and defensive error handling.
- **Order Hand-off:** Two-tier dispatch:
  1. Pre-filled WhatsApp Studio Dispatch (auto-generates a structured order breakdown).
  2. Optional automated webhook (Formspree or Google Apps Script) to receive orders directly in your inbox or Google Sheets.

---

## 2. Pre-Launch Checklist (Action Required by Store Owner)

Before taking the website live on `regongches.store`, update the placeholder values in `config.js`:

| Config Path | Default Placeholder | What to Replace With |
|---|---|---|
| `CONFIG.contact.phoneDisplay` | `+92 300 123 4567` | Your actual studio customer service phone |
| `CONFIG.contact.phoneRaw` | `+923001234567` | Phone in E.164 format (`+92...`) for `tel:` links |
| `CONFIG.contact.whatsappNumber` | `923001234567` | WhatsApp digits only (e.g. `923129876543`) |
| `CONFIG.contact.email` | `hello@regongches.store` | Verified custom domain mailbox |
| `CONFIG.payment.bank.bankName` | `Meezan Bank...` | Your merchant bank name |
| `CONFIG.payment.bank.accountTitle` | `ReGongches Heritage Crafts` | Your legal bank account title |
| `CONFIG.payment.bank.iban` | `PK36 MEZN 0001 2345 6789 0102` | Your genuine 24-character Pakistani IBAN |
| `CONFIG.payment.wallet.number` | `0300-1234567` | Your JazzCash / EasyPaisa / Raast mobile wallet |
| `CONFIG.orderHandoff.endpointUrl` | `''` (empty) | Your Formspree or Google Apps Script endpoint URL |

> [!NOTE]
> When `CONFIG.payment.bank.iban` or wallet numbers remain at placeholder values, the checkout engine automatically shields customers from seeing placeholder details and prompts them to arrange payment via WhatsApp.

---

## 3. Webhook Setup for Automatic Order Logging

Static sites cannot run server-side databases directly. Setting up an order webhook ensures every completed order is permanently archived in your email or Google Sheet without relying solely on WhatsApp.

### Option A: Formspree (5 Minutes, No Coding)
1. Go to [https://formspree.io](https://formspree.io) and create a free account.
2. Click **New Form**, name it `ReGongches Orders`, and specify your notification email.
3. Formspree will give you an endpoint URL like:
   ```text
   https://formspree.io/f/mqkvojpq
   ```
4. Open `config.js` and set:
   ```javascript
   CONFIG.orderHandoff.endpointUrl = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
5. Every time a customer places an order, you will receive an instant email notification containing the order ID, items, customer address, phone number, and total in PKR.

---

### Option B: Google Apps Script (Free Google Sheet Logging)
If you want every order automatically entered as a new row in a private Google Sheet:
1. Open [Google Sheets](https://sheets.new) and create a new sheet named `ReGongches Orders`.
2. Set row 1 columns:
   `Order ID | Date | Customer | Phone | Email | City | Address | Items | Grand Total (PKR) | Payment | Status`
3. Click **Extensions > Apps Script** and paste:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     var itemsList = (data.items || []).map(function(i) {
       return i.name + ' (x' + i.qty + ')';
     }).join(', ');

     sheet.appendRow([
       data.id,
       data.date || new Date().toISOString(),
       data.customer,
       data.phone,
       data.email || '',
       data.city,
       data.address,
       itemsList,
       data.totalPkr,
       data.payment,
       'Pending WhatsApp Dispatch'
     ]);

     return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
4. Click **Deploy > New deployment**. Select type **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the generated Web App URL (`https://script.google.com/macros/s/.../exec`) and paste it into `config.js` as `CONFIG.orderHandoff.endpointUrl`.

---

## 4. Hosting Platform Deployment Options

### Platform 1: Cloudflare Pages (Recommended)
Cloudflare Pages provides world-class global CDN speed, zero cost, unlimited bandwidth, and automatic SSL for custom domains.

1. Create a free account at [Cloudflare](https://pages.cloudflare.com/).
2. Connect your GitHub repository (`MushtaqAhmadSaqi/GreenPakistan` or your own fork).
3. Configuration:
   - **Framework preset:** `None`
   - **Build command:** (leave blank)
   - **Build output directory:** `/` (root directory)
4. Click **Save and Deploy**.
5. Add your custom domain `regongches.store` under **Custom domains**; Cloudflare provisions the SSL certificate automatically.

---

### Platform 2: GitHub Pages
1. Push your changes to the repository:
   ```bash
   git add .
   git commit -m "Production release: ReGongches static storefront"
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Choose Branch: `main`, Folder: `/ (root)`.
5. Click **Save**. The website will be live in 60 seconds at `https://<username>.github.io/<repo-name>/`.
6. To attach `regongches.store`, enter it in **Custom domain** and enable **Enforce HTTPS**.

---

### Platform 3: Netlify
1. Log into [Netlify](https://www.netlify.com/).
2. Click **Add new site > Import an existing project** (or drag and drop the project folder directly into the Netlify app).
3. Set build command to empty and publish directory to `.`.
4. Deploy site and add custom domain.

---

### Platform 4: Vercel
1. Install Vercel CLI: `npm i -g vercel` or import the repository in [vercel.com](https://vercel.com).
2. Run in the root directory:
   ```bash
   vercel --prod
   ```

---

## 5. Automated Verification & Testing

Before deploying, run the built-in automated test suite to ensure all commerce calculations, promos, and product data are working:

```bash
node test_suite.js
```

Expected result:
```text
========================================
✦ ReGongches Automated Test Suite ✦
========================================
Test Results: 80 Passed, 0 Failed
========================================
```

To run a local server for browser review:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.

---

## 6. Routine Maintenance

- **Adding a Product:** Open `data/products.js` and add a new product object to the `PRODUCTS` array following the existing schema. Update `sitemap.xml` with the new `?id=your-product-id` URL.
- **Updating Shipping Fees:** Edit the `CONFIG.shipping.cities` mapping in `config.js`.
- **Creating Promo Codes:** Add a new entry into `CONFIG.promos.codes` in `config.js`.
