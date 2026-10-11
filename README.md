# BiteCraft — Premium Sandwich & Fast Food Website

BiteCraft is a complete frontend-only demo website for a premium sandwich and fast-food brand.

**Tagline:** Freshly Made. Seriously Delicious.

## Project Structure

```text
bitecraft/
├── index.html
├── menu.html
├── about.html
├── contact.html
├── cart.html
├── admin.html
├── css/
│   └── style.css
└── js/
    ├── data.js
    ├── main.js
    ├── menu.js
    ├── cart.js
    ├── contact.js
    └── admin.js
```

## How to Run Locally

### Option 1 — Open directly

Double-click:

```text
index.html
```

The site is designed to run without a build system, backend, database, or API key.

### Option 2 — Run a simple local server

From the `bitecraft` folder, you can run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Working Features

- Premium responsive homepage
- Sticky navigation
- Mobile menu
- Light/Dark theme toggle with localStorage persistence
- Product Quick View modal
- Product Favorites / Wishlist with heart toggle
- Homepage saved favorites preview section
- Menu page budget slider (up to ₹350)
- Menu page "Saved Favorites Only" filter
- Menu page "Reset Filters" action
- Homepage category links
- Best sellers product grid
- Dedicated menu page
- Search by product name, category, or description
- Category filters
- Vegetarian-only filter
- Sorting by price and name
- Product customization modal
- Add-ons with accurate price updates
- Interactive shopping cart drawer
- Full cart page
- Quantity increase/decrease
- Remove item
- Clear cart
- LocalStorage cart persistence
- Demo promo codes
  - `BITE10`
  - `SUPER20`
  - `FLAT50`
  - `FREESHIP`
- Demo delivery charge calculation
- Demo checkout modal
- Required field validation
- Phone and email validation
- Demo order confirmation number
- About page
- Contact page with validation
- Newsletter form with validation
- Local business dashboard demo
- Add/edit/delete/toggle products locally
- Product changes saved in localStorage
- Responsive layout for desktop, tablet, and mobile
- Food image fallbacks

## Demo-Only Features

This is a frontend demonstration only.

- No real orders are sent
- No real payments are collected
- No real email subscription is created
- Contact form messages are not delivered
- Dashboard is not secure and is not production admin software
- Menu products, prices, ratings, testimonials, and contact details are editable sample content

## Customization Guide

Most menu and brand data lives in:

```text
js/data.js
```

Update product names, descriptions, prices, categories, image URLs, vegetarian flags, bestseller flags, and customization options there.

Main styling lives in:

```text
css/style.css
```

Update brand colors at the top of the file inside the `:root` block.

## Future Backend Integration Suggestions

For a production food ordering website, add:

1. Backend API for menu, cart, checkout, and orders
2. Secure admin authentication
3. Real database such as PostgreSQL, MySQL, MongoDB, or Firebase
4. Payment gateway integration such as Razorpay or Stripe
5. Order status workflow
6. Customer accounts and order history
7. Real email/SMS/WhatsApp notifications
8. Image upload and CDN storage
9. Analytics and conversion tracking
10. Security hardening and server-side validation
