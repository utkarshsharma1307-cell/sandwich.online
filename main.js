/**
 * BiteCraft - Core Frontend Application Engine
 * Handles State, Cart Drawer, Modals, Customizations, Live Order Tracking,
 * Store Status, Location Switcher, Smart Upsells, and UI Interactions.
 */

(function () {
  'use strict';

  // Global namespace
  window.BiteCraft = window.BiteCraft || {};

  const CART_STORAGE_KEY = 'bitecraft_cart_v1';
  const APPLIED_COUPON_KEY = 'bitecraft_applied_coupon';
  const FAVORITES_STORAGE_KEY = 'bitecraft_favorites_v1';
  const THEME_STORAGE_KEY = 'bitecraft_theme_v1';
  const ORDERS_STORAGE_KEY = 'bitecraft_orders';
  const OUTLET_STORAGE_KEY = 'bitecraft_outlet';
  const STORE_OVERRIDE_KEY = 'bitecraft_store_override';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let icon = '🍔';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠';

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(iconSpan);
    toast.appendChild(messageSpan);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /* ==========================================================================
     Location / Outlet Switcher
     ========================================================================== */
  function getSelectedOutlet() {
    const list = window.BiteCraftData ? (window.BiteCraftData.outlets || []) : [];
    const stored = localStorage.getItem(OUTLET_STORAGE_KEY) || 'downtown';
    const found = list.find(o => o.id === stored);
    return found || list[0] || { id: 'downtown', name: 'Metro Downtown Hub', eta: '20 - 30 mins' };
  }

  function setSelectedOutlet(id) {
    localStorage.setItem(OUTLET_STORAGE_KEY, id);
    syncOutletUI();
    const outlet = getSelectedOutlet();
    showToast(`Delivery outlet: ${outlet.name} (${outlet.eta})`, 'info');
  }

  function syncOutletUI() {
    const outlet = getSelectedOutlet();
    document.querySelectorAll('.outlet-select').forEach(sel => {
      sel.value = outlet.id;
    });
    document.querySelectorAll('.outlet-display-text').forEach(el => {
      el.textContent = `${outlet.name} (${outlet.eta})`;
    });
  }

  /* ==========================================================================
     Store Live Operating Hours Status (11 AM to 11 PM)
     ========================================================================== */
  function isStoreOpen() {
    const override = localStorage.getItem(STORE_OVERRIDE_KEY);
    if (override === 'open') return true;
    if (override === 'closed') return false;
    const hour = new Date().getHours();
    return hour >= 11 && hour < 23;
  }

  function toggleStoreOverride() {
    const current = isStoreOpen();
    const next = current ? 'closed' : 'open';
    localStorage.setItem(STORE_OVERRIDE_KEY, next);
    syncStoreStatusUI();
    showToast(`Demo Store Status: ${next.toUpperCase()} (11 AM - 11 PM)`, 'info');
  }

  function syncStoreStatusUI() {
    const open = isStoreOpen();
    document.querySelectorAll('.store-status-badge').forEach(badge => {
      badge.className = `store-status-badge ${open ? 'open' : 'closed'}`;
      badge.setAttribute('title', 'Click to toggle demo Open/Closed state');
      badge.innerHTML = open
        ? `<span class="status-pulse-dot"></span><span>Open Now (11 AM - 11 PM)</span>`
        : `<span class="status-pulse-dot red"></span><span>Kitchen Closed (Opens 11 AM)</span>`;
    });
  }

  /* ==========================================================================
     Cart Manager
     ========================================================================== */
  const Cart = {
    getItems: function () {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    saveItems: function (items) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving cart to localStorage', e);
      }
      this.updateBadge();
      this.renderDrawer();
      if (window.BiteCraftCartPage && typeof window.BiteCraftCartPage.render === 'function') {
        window.BiteCraftCartPage.render();
      }
    },

    addItem: function (product, customizations = [], quantity = 1) {
      if (!product) return;
      const items = this.getItems();

      // Calculate unit price with customizations
      let customAddPrice = 0;
      const customKeyParts = [];

      customizations.forEach(c => {
        customAddPrice += (c.price || 0);
        // Include price in key to avoid collisions between same-name different-price options
        customKeyParts.push(`${c.name}:${c.price || 0}`);
      });

      const unitPrice = product.price + customAddPrice;
      const customKey = customKeyParts.sort().join('|');
      const itemKey = `${product.id}__${customKey}`;

      const existingIndex = items.findIndex(i => i.itemKey === itemKey);

      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({
          itemKey: itemKey,
          productId: product.id,
          name: product.name,
          category: product.category,
          basePrice: product.price,
          unitPrice: unitPrice,
          image: product.image,
          fallbackImage: product.fallbackImage,
          vegetarian: product.vegetarian,
          customizations: customizations,
          quantity: quantity
        });
      }

      this.saveItems(items);
      showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');

      // Subtle cart badge animation
      const badge = document.querySelector('.cart-badge');
      if (badge) {
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 300);
      }
    },

    updateQuantity: function (itemKey, delta) {
      let items = this.getItems();
      const index = items.findIndex(i => i.itemKey === itemKey);
      if (index > -1) {
        items[index].quantity += delta;
        if (items[index].quantity <= 0) {
          items.splice(index, 1);
          showToast('Item removed from cart', 'info');
        }
        this.saveItems(items);
      }
    },

    removeItem: function (itemKey) {
      let items = this.getItems();
      items = items.filter(i => i.itemKey !== itemKey);
      this.saveItems(items);
      showToast('Item removed from cart', 'info');
    },

    clearCart: function () {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(APPLIED_COUPON_KEY);
      this.updateBadge();
      this.renderDrawer();
      if (window.BiteCraftCartPage && typeof window.BiteCraftCartPage.render === 'function') {
        window.BiteCraftCartPage.render();
      }
    },

    getCount: function () {
      const items = this.getItems();
      return items.reduce((total, item) => total + item.quantity, 0);
    },

    updateBadge: function () {
      const count = this.getCount();
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'flex' : 'none';
      });
    },

    getCoupon: function () {
      try {
        const c = localStorage.getItem(APPLIED_COUPON_KEY);
        return c ? JSON.parse(c) : null;
      } catch (e) {
        return null;
      }
    },

    setCoupon: function (coupon) {
      if (!coupon) {
        localStorage.removeItem(APPLIED_COUPON_KEY);
      } else {
        localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(coupon));
      }
    },

    calculateTotals: function () {
      const items = this.getItems();
      const subtotal = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

      const threshold = window.BiteCraftData ? window.BiteCraftData.freeDeliveryThreshold : 499;
      let deliveryFee = subtotal > 0 ? (window.BiteCraftData ? window.BiteCraftData.deliveryFee : 40) : 0;
      if (subtotal >= threshold) {
        deliveryFee = 0;
      }

      let discount = 0;
      const coupon = this.getCoupon();

      if (coupon && subtotal >= (coupon.minOrder || 0)) {
        if (coupon.type === 'percent') {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else if (coupon.type === 'flat') {
          discount = Math.min(coupon.value, subtotal);
        } else if (coupon.type === 'delivery') {
          discount = deliveryFee;
          deliveryFee = 0;
        }
      }

      const total = Math.max(0, subtotal + deliveryFee - discount);

      return {
        subtotal,
        deliveryFee,
        discount,
        coupon,
        total,
        threshold
      };
    },

    renderDrawer: function () {
      const container = document.getElementById('cartDrawerItems');
      const footer = document.getElementById('cartDrawerFooter');
      if (!container) return;

      const items = this.getItems();
      const totals = this.calculateTotals();

      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-box">
            <div class="empty-icon">🛒</div>
            <h3 class="empty-title">Your Cart is Empty</h3>
            <p class="empty-desc">Looks like you haven't added any delicious bites yet. Check out our menu!</p>
            <a href="menu.html" class="btn btn-primary btn-sm">Explore Menu</a>
          </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
      }

      if (footer) footer.style.display = 'block';

      // 1. Free Delivery Progress Bar
      let freeDeliveryHtml = '';
      const threshold = totals.threshold || 499;
      const remaining = Math.max(0, threshold - totals.subtotal);
      const percent = Math.min(100, Math.round((totals.subtotal / threshold) * 100));

      if (remaining > 0) {
        freeDeliveryHtml = `
          <div class="free-delivery-box">
            <div class="free-delivery-header">
              <span>🚚 Add <strong>₹${remaining}</strong> more for <strong>FREE Delivery!</strong></span>
              <span class="free-delivery-pct">${percent}%</span>
            </div>
            <div class="free-delivery-track">
              <div class="free-delivery-fill" style="width:${percent}%;"></div>
            </div>
          </div>
        `;
      } else {
        freeDeliveryHtml = `
          <div class="free-delivery-box unlocked">
            <div class="free-delivery-header">
              <span>🎉 <strong>Congratulations!</strong> You qualify for <strong>FREE Delivery!</strong></span>
              <span class="free-delivery-pct">100%</span>
            </div>
            <div class="free-delivery-track">
              <div class="free-delivery-fill unlocked" style="width:100%;"></div>
            </div>
          </div>
        `;
      }

      // 2. Cart Items
      let itemsHtml = '';
      items.forEach(item => {
        const customsText = item.customizations && item.customizations.length > 0
          ? item.customizations.map(c => c.name).join(', ')
          : 'Standard prep';

        itemsHtml += `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='${item.fallbackImage}'" />
            <div class="cart-item-info">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-customs">${customsText}</div>
              <div class="cart-item-bottom">
                <span style="font-weight:700;font-size:14px;">₹${item.unitPrice * item.quantity}</span>
                <div class="quantity-stepper">
                  <button class="step-btn" onclick="BiteCraft.cart.updateQuantity('${item.itemKey}', -1)">-</button>
                  <span class="step-value">${item.quantity}</span>
                  <button class="step-btn" onclick="BiteCraft.cart.updateQuantity('${item.itemKey}', 1)">+</button>
                </div>
                <button class="remove-cart-item" title="Remove" onclick="BiteCraft.cart.removeItem('${item.itemKey}')">✕</button>
              </div>
            </div>
          </div>
        `;
      });

      // 3. Smart Upsells (complementary sides or drinks not yet in cart)
      const inCartIds = items.map(i => i.productId);
      const allProducts = window.BiteCraftData.getProducts();
      const upsellCandidates = allProducts.filter(p =>
        !inCartIds.includes(p.id) &&
        (p.category === 'Fries' || p.category === 'Beverages' || p.category === 'Snacks')
      ).slice(0, 2);

      let upsellHtml = '';
      if (upsellCandidates.length > 0) {
        upsellHtml = `
          <div class="cart-upsell-tray">
            <div class="cart-upsell-heading">⚡ Frequently Paired Add-Ons</div>
            <div class="cart-upsell-list">
              ${upsellCandidates.map(p => `
                <div class="cart-upsell-item">
                  <img src="${p.image}" alt="${p.name}" class="cart-upsell-thumb" onerror="this.src='${p.fallbackImage}'">
                  <div class="cart-upsell-details">
                    <span class="cart-upsell-name">${p.name}</span>
                    <span class="cart-upsell-price">₹${p.price}</span>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="BiteCraft.cart.addItem(window.BiteCraftData.getProducts().find(x=>x.id==='${p.id}'))">+ Add</button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Combine inside drawer
      container.innerHTML = freeDeliveryHtml + itemsHtml + upsellHtml;

      // 4. Available Coupons Tray
      const couponsListEl = document.getElementById('cartAvailableCouponsTray');
      if (couponsListEl) {
        const couponsMap = window.BiteCraftData.getCoupons ? window.BiteCraftData.getCoupons() : (window.BiteCraftData.coupons || {});
        let trayHtml = '<div class="available-coupons-tray"><div class="tray-title">🎟️ Available Offers</div><div class="coupon-chips-grid">';

        Object.values(couponsMap).forEach(cp => {
          const isApplied = totals.coupon && totals.coupon.code === cp.code;
          const meetsMin = totals.subtotal >= (cp.minOrder || 0);

          trayHtml += `
            <div class="coupon-chip ${isApplied ? 'applied' : ''} ${!meetsMin ? 'disabled' : ''}" onclick="BiteCraft.applyCouponCode('${cp.code}')">
              <div class="coupon-chip-top">
                <span class="chip-code">${cp.code}</span>
                <span class="chip-action">${isApplied ? 'Applied ✓' : 'Apply'}</span>
              </div>
              <div class="chip-label">${cp.label}</div>
            </div>
          `;
        });
        trayHtml += '</div></div>';
        couponsListEl.innerHTML = trayHtml;
      }

      // Update summary fields in footer
      const subtotalEl = document.getElementById('cartDrawerSubtotal');
      const deliveryEl = document.getElementById('cartDrawerDelivery');
      const discountRow = document.getElementById('cartDrawerDiscountRow');
      const discountEl = document.getElementById('cartDrawerDiscount');
      const totalEl = document.getElementById('cartDrawerTotal');

      if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal}`;
      if (deliveryEl) {
        deliveryEl.textContent = totals.deliveryFee === 0 ? 'FREE' : `₹${totals.deliveryFee}`;
        if (totals.deliveryFee === 0) deliveryEl.style.color = 'var(--color-accent-veg)';
        else deliveryEl.style.color = 'inherit';
      }

      if (discountRow && discountEl) {
        if (totals.discount > 0) {
          discountRow.style.display = 'flex';
          discountEl.textContent = `-₹${totals.discount}`;
        } else {
          discountRow.style.display = 'none';
        }
      }

      if (totalEl) totalEl.textContent = `₹${totals.total}`;
    }
  };

  /* ==========================================================================
     Product Customization Modal Engine
     ========================================================================== */
  const Customizer = {
    currentProduct: null,

    open: function (productId) {
      const products = window.BiteCraftData.getProducts();
      const product = products.find(p => p.id === productId);
      if (!product) return;

      this.currentProduct = product;
      const modal = document.getElementById('customModal');
      const body = document.getElementById('customModalBody');
      const title = document.getElementById('customModalTitle');

      if (!modal || !body) return;

      if (title) {
        title.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="diet-indicator ${product.vegetarian ? '' : 'non-veg'}"></span>
            <span>Customize: ${product.name}</span>
          </div>
        `;
      }

      let optionsHtml = '';

      if (product.customizations && product.customizations.length > 0) {
        product.customizations.forEach((group, gIdx) => {
          optionsHtml += `
            <div class="custom-group">
              <div class="custom-group-title">
                <span>${group.group}</span>
                ${group.required ? '<span class="custom-group-req">Required</span>' : '<span style="font-size:11px;color:var(--color-text-light);">Optional</span>'}
              </div>
          `;

          group.options.forEach((opt) => {
            const inputType = group.type === 'single' ? 'radio' : 'checkbox';
            const inputName = `group_${gIdx}`;
            const isChecked = opt.default ? 'checked' : '';
            const priceTag = opt.price > 0 ? `+₹${opt.price}` : 'Free';

            optionsHtml += `
              <label class="custom-option-label">
                <div class="custom-option-left">
                  <input type="${inputType}" name="${inputName}" value="${opt.name}" data-price="${opt.price}" ${isChecked} onchange="BiteCraft.customizer.updateLivePrice()" />
                  <span class="option-name-box">${opt.name}</span>
                </div>
                <span class="custom-price-tag">${priceTag}</span>
              </label>
            `;
          });

          optionsHtml += `</div>`;
        });
      } else {
        optionsHtml = `
          <p style="color:var(--color-text-muted);font-size:14px;margin-bottom:12px;">
            This item is prepared in our signature classic style with no extra customizations needed!
          </p>
        `;
      }

      body.innerHTML = optionsHtml;
      this.updateLivePrice();
      modal.classList.add('open');
    },

    close: function () {
      const modal = document.getElementById('customModal');
      if (modal) modal.classList.remove('open');
      this.currentProduct = null;
    },

    updateLivePrice: function () {
      if (!this.currentProduct) return;
      const modal = document.getElementById('customModal');
      if (!modal) return;

      let extra = 0;
      const checkedInputs = modal.querySelectorAll('input:checked');
      checkedInputs.forEach(inp => {
        extra += parseFloat(inp.getAttribute('data-price') || 0);
      });

      const total = this.currentProduct.price + extra;
      const btn = document.getElementById('customModalAddBtn');
      if (btn) {
        btn.textContent = `Add to Cart • ₹${total}`;
      }
    },

    confirmAdd: function () {
      if (!this.currentProduct) return;
      const modal = document.getElementById('customModal');
      const selectedCustoms = [];

      // Validate required single-select groups
      const product = this.currentProduct;
      if (product.customizations && product.customizations.length > 0) {
        for (let gIdx = 0; gIdx < product.customizations.length; gIdx++) {
          const group = product.customizations[gIdx];
          if (group.required && group.type === 'single') {
            const selected = modal.querySelector(`input[name="group_${gIdx}"]:checked`);
            if (!selected) {
              showToast(`Please select a ${group.group}`, 'error');
              return;
            }
          }
        }
      }

      const checkedInputs = modal.querySelectorAll('input:checked');
      checkedInputs.forEach(inp => {
        selectedCustoms.push({
          name: inp.value,
          price: parseFloat(inp.getAttribute('data-price') || 0)
        });
      });

      Cart.addItem(this.currentProduct, selectedCustoms, 1);
      this.close();
    }
  };

  /* ==========================================================================
     Favorites Manager
     ========================================================================== */
  const Favorites = {
    get: function () {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },
    has: function (productId) {
      return this.get().includes(productId);
    },
    toggle: function (productId) {
      let favorites = this.get();
      const product = window.BiteCraftData.getProducts().find(p => p.id === productId);
      if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        showToast('Removed from favorites', 'info');
      } else {
        favorites.push(productId);
        showToast(product ? `${product.name} saved to favorites` : 'Saved to favorites', 'success');
      }
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      this.syncButtons();
      this.renderHomeFavorites();
      // Trigger menu page render if available
      if (window.BiteCraftMenu && typeof window.BiteCraftMenu.renderProducts === 'function') {
        window.BiteCraftMenu.renderProducts();
      }
    },
    syncButtons: function () {
      document.querySelectorAll('[data-favorite-id]').forEach(btn => {
        const productId = btn.getAttribute('data-favorite-id');
        const active = this.has(productId);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.textContent = active ? '♥' : '♡';
      });
    },
    renderHomeFavorites: function () {
      const container = document.getElementById('favoritesPreviewGrid');
      const section = document.getElementById('favoritesPreviewSection');
      if (!container || !section) return;
      const favoriteIds = this.get();
      const products = window.BiteCraftData.getProducts().filter(p => favoriteIds.includes(p.id)).slice(0, 4);
      if (!products.length) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
      }
      section.style.display = 'block';
      container.innerHTML = products.map(product => renderCompactProductCard(product)).join('');
      this.syncButtons();
    }
  };

  function renderCompactProductCard(product) {
    const safeId = escapeHtml(product.id);
    return `
      <article class="product-card">
        <div class="product-thumb-wrap">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-thumb" onerror="this.src='${escapeHtml(product.fallbackImage)}'" loading="lazy" />
          <button class="favorite-btn" data-favorite-id="${safeId}" onclick="BiteCraft.favorites.toggle('${safeId}')" aria-label="Toggle favorite">♡</button>
        </div>
        <div class="product-body">
          <div class="product-meta-row"><span class="product-cat-name">${escapeHtml(product.category)}</span><span class="diet-indicator ${product.vegetarian ? '' : 'non-veg'}"></span></div>
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <p class="product-desc">${escapeHtml(product.description)}</p>
          <div class="product-footer"><div class="product-price-box"><span class="price-label">Price</span><span class="price-value">₹${product.price}</span></div><button class="btn btn-primary btn-sm" onclick="BiteCraft.cart.addItem(window.BiteCraftData.getProducts().find(p=>p.id==='${safeId}'))">Add +</button></div>
        </div>
      </article>`;
  }

  /* ==========================================================================
     Theme Toggle
     ========================================================================== */
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.setAttribute('data-theme', 'light');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    applyTheme(stored);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ==========================================================================
     Enhanced Quick View Modal (With Nutrition & Spice Level Meters)
     ========================================================================== */
  const QuickView = {
    open: function (productId) {
      const product = window.BiteCraftData.getProducts().find(p => p.id === productId);
      const modal = document.getElementById('quickViewModal');
      const body = document.getElementById('quickViewBody');
      if (!product || !modal || !body) return;

      const customCount = product.customizations ? product.customizations.reduce((sum, group) => sum + group.options.length, 0) : 0;

      // Nutrition defaults if not explicitly present
      const nutrition = product.nutrition || { calories: 380, protein: "12g", carbs: "48g", fat: "16g" };

      // Spice Meter
      const spice = product.spiceLevel != null ? product.spiceLevel : 1;
      let spiceBadge = '<span class="spice-meter-tag level-0">🌿 Non-Spicy</span>';
      if (spice === 1) spiceBadge = '<span class="spice-meter-tag level-1">🌶️ Mild Kick</span>';
      else if (spice === 2) spiceBadge = '<span class="spice-meter-tag level-2">🌶️🌶️ Medium Spicy</span>';
      else if (spice >= 3) spiceBadge = '<span class="spice-meter-tag level-3">🌶️🌶️🌶️ Fiery Hot 🔥</span>';

      // Allergens
      const allergens = product.allergens && product.allergens.length > 0
        ? product.allergens.map(a => `<span class="allergen-tag">⚠️ ${escapeHtml(a)}</span>`).join(' ')
        : '<span class="allergen-tag none">🌱 No common allergens</span>';

      body.innerHTML = `
        <div style="display:grid;grid-template-columns:240px minmax(0,1fr);gap:24px;" class="quick-view-grid">
          <div>
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" onerror="this.src='${escapeHtml(product.fallbackImage)}'" style="width:100%;height:230px;object-fit:cover;border-radius:var(--radius-lg);margin-bottom:12px;">
            <div style="text-align:center;">${spiceBadge}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px;">
              <span class="product-cat-name">${escapeHtml(product.category)}</span>
              <span class="diet-indicator ${product.vegetarian ? '' : 'non-veg'}"></span>
            </div>
            <h3 style="font-size:24px;line-height:1.2;margin-bottom:8px;">${escapeHtml(product.name)}</h3>
            <p style="color:var(--color-text-muted);font-size:14px;margin-bottom:16px;">${escapeHtml(product.description)}</p>

            <!-- Nutrition Breakdown -->
            <div class="nutrition-grid-box">
              <div class="nutrition-item">
                <span class="nutrition-val">${nutrition.calories}</span>
                <span class="nutrition-lbl">Calories</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-val">${nutrition.protein}</span>
                <span class="nutrition-lbl">Protein</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-val">${nutrition.carbs}</span>
                <span class="nutrition-lbl">Carbs</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-val">${nutrition.fat}</span>
                <span class="nutrition-lbl">Fat</span>
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <span style="font-size:11px;font-weight:700;color:var(--color-text-muted);display:block;margin-bottom:4px;">ALLERGEN INFO:</span>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">${allergens}</div>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
              <span class="hero-pill">★ ${product.rating || 4.7} rating</span>
              ${product.bestseller ? '<span class="hero-pill">Bestseller</span>' : ''}
              <span class="hero-pill">${customCount} options</span>
            </div>

            <div style="font-size:28px;font-weight:800;color:var(--color-primary);margin-bottom:18px;">₹${product.price}</div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-primary" onclick="BiteCraft.cart.addItem(window.BiteCraftData.getProducts().find(p=>p.id==='${escapeHtml(product.id)}')); BiteCraft.quickView.close();">Add to Cart</button>
              ${product.customizations && product.customizations.length ? `<button class="btn btn-secondary" onclick="BiteCraft.quickView.close(); BiteCraft.customizer.open('${escapeHtml(product.id)}')">Customize</button>` : ''}
              <button class="btn btn-secondary" onclick="BiteCraft.favorites.toggle('${escapeHtml(product.id)}')">Save Favorite</button>
            </div>
          </div>
        </div>`;
      modal.classList.add('open');
    },
    close: function () {
      const modal = document.getElementById('quickViewModal');
      if (modal) modal.classList.remove('open');
    }
  };

  /* ==========================================================================
     Drawer and Modal Toggles
     ========================================================================== */
  function openCartDrawer() {
    const drawer = document.getElementById('cartDrawerOverlay');
    if (drawer) {
      drawer.classList.add('open');
      Cart.renderDrawer();
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
  }

  /* ==========================================================================
     Promo Code Handlers
     ========================================================================== */
  function applyCouponCode(code) {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    const availableCoupons = window.BiteCraftData.getCoupons ? window.BiteCraftData.getCoupons() : (window.BiteCraftData.coupons || {});
    const coupon = availableCoupons[cleanCode];

    if (!coupon) {
      showToast(`Coupon "${cleanCode}" is invalid.`, 'error');
      return;
    }

    const totals = Cart.calculateTotals();
    if (totals.subtotal < coupon.minOrder) {
      showToast(`Order must be at least ₹${coupon.minOrder} to apply ${cleanCode}`, 'error');
      return;
    }

    coupon.code = cleanCode;
    Cart.setCoupon(coupon);
    showToast(`Coupon "${cleanCode}" applied! ${coupon.label}`, 'success');

    const input = document.getElementById('cartPromoInput');
    if (input) input.value = '';

    Cart.renderDrawer();
  }

  function applyCouponFromInput() {
    const input = document.getElementById('cartPromoInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    applyCouponCode(code);
  }

  /* ==========================================================================
     Order History Helpers
     ========================================================================== */
  function getOrders() {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveOrder(order) {
    try {
      const orders = getOrders();
      orders.unshift(order);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      return true;
    } catch (e) {
      console.error('Error saving order', e);
      return false;
    }
  }

  function updateOrder(orderId, updates) {
    try {
      const orders = getOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx > -1) {
        orders[idx] = Object.assign({}, orders[idx], updates);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      }
    } catch (e) {}
  }

  /* ==========================================================================
     Live Order Tracking Simulation
     ========================================================================== */
  const LiveTracker = {
    activeOrderId: null,
    timerInterval: null,
    secondsRemaining: 1500, // 25 mins

    open: function (orderId) {
      this.activeOrderId = orderId;
      const orders = getOrders();
      const order = orders.find(o => o.id === orderId);

      const modal = document.getElementById('orderTrackingModal');
      const body = document.getElementById('orderTrackingBody');
      if (!modal || !body) return;

      this.render(order);
      modal.classList.add('open');
      this.startTimer();
    },

    close: function () {
      const modal = document.getElementById('orderTrackingModal');
      if (modal) modal.classList.remove('open');
      if (this.timerInterval) clearInterval(this.timerInterval);
    },

    startTimer: function () {
      if (this.timerInterval) clearInterval(this.timerInterval);
      const timerEl = document.getElementById('liveTrackingTimer');
      this.secondsRemaining = 1500;

      this.timerInterval = setInterval(() => {
        if (this.secondsRemaining > 0) {
          this.secondsRemaining--;
          const m = Math.floor(this.secondsRemaining / 60);
          const s = this.secondsRemaining % 60;
          if (timerEl) {
            timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
          }
        }
      }, 1000);
    },

    advanceStage: function () {
      if (!this.activeOrderId) return;
      const orders = getOrders();
      const order = orders.find(o => o.id === this.activeOrderId);
      if (!order) return;

      let nextStep = (order.step || 1) + 1;
      if (nextStep > 4) nextStep = 4;

      let status = 'Order Received';
      if (nextStep === 2) status = 'Kitchen Preparing';
      if (nextStep === 3) status = 'Out with Rider';
      if (nextStep === 4) status = 'Delivered';

      order.step = nextStep;
      order.status = status;
      updateOrder(order.id, { step: nextStep, status: status });

      this.render(order);
      showToast(`Tracking status: ${status}`, 'info');
    },

    render: function (order) {
      const body = document.getElementById('orderTrackingBody');
      if (!body || !order) return;

      const step = order.step || 2; // Default to kitchen preparing
      const outlet = order.outlet || getSelectedOutlet();

      const stepsData = [
        { num: 1, title: 'Order Confirmed', desc: 'Received & routed to kitchen', icon: '📝' },
        { num: 2, title: 'Kitchen Preparing', desc: 'Fresh ingredients being grilled', icon: '🍳' },
        { num: 3, title: 'Out for Delivery', desc: `Rider en route from ${outlet.name}`, icon: '🛵' },
        { num: 4, title: 'Delivered', desc: 'Delivered hot & fresh to your door', icon: '🎉' }
      ];

      const stepsHtml = stepsData.map(s => {
        let stateClass = 'pending';
        if (s.num < step) stateClass = 'completed';
        else if (s.num === step) stateClass = 'active';

        return `
          <div class="tracking-step-item ${stateClass}">
            <div class="tracking-step-icon">${s.num < step ? '✓' : s.icon}</div>
            <div class="tracking-step-info">
              <div class="tracking-step-title">${s.title}</div>
              <div class="tracking-step-desc">${s.desc}</div>
            </div>
            ${s.num === step ? '<span class="tracking-step-pulse">LIVE</span>' : ''}
          </div>
        `;
      }).join('');

      body.innerHTML = `
        <div style="text-align:center;margin-bottom:20px;">
          <span class="section-tag">Live Order Simulation</span>
          <h3 style="font-size:24px;font-weight:800;margin-top:6px;">Tracking #${order.id}</h3>
          <p style="font-size:13px;color:var(--color-text-muted);">Delivery to: <strong>${escapeHtml(order.customerName)}</strong></p>
        </div>

        <div class="live-timer-card">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--color-text-muted);">Estimated Delivery Time</div>
          <div class="live-timer-digits" id="liveTrackingTimer">25:00</div>
          <div style="font-size:13px;color:var(--color-primary);font-weight:600;">Dispatching from ${escapeHtml(outlet.name)}</div>
        </div>

        <div class="tracking-timeline-wrap">
          ${stepsHtml}
        </div>

        <div style="background:var(--color-surface-alt);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:14px;margin-bottom:20px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:var(--color-text-muted);">Items:</span>
            <strong>${order.items.length} items (₹${order.totals.total})</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--color-text-muted);">Address:</span>
            <span>${escapeHtml(order.address)}</span>
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-secondary btn-sm" onclick="BiteCraft.liveTracker.advanceStage()">
            Fast-Forward Step ⏩
          </button>
          <a href="orders.html" class="btn btn-secondary btn-sm">
            All Past Orders 📋
          </a>
          <button class="btn btn-primary btn-sm" onclick="BiteCraft.liveTracker.close()">
            Close Tracker
          </button>
        </div>
      `;
    }
  };

  /* ==========================================================================
     Demo Checkout Engine
     ========================================================================== */
  const Checkout = {
    open: function () {
      const items = Cart.getItems();
      if (items.length === 0) {
        showToast('Your cart is empty! Add items first.', 'error');
        return;
      }
      closeCartDrawer();

      const modal = document.getElementById('checkoutModal');
      if (!modal) {
        window.location.href = 'cart.html';
        return;
      }

      this.renderSummary();
      modal.classList.add('open');
    },

    close: function () {
      const modal = document.getElementById('checkoutModal');
      if (modal) modal.classList.remove('open');
    },

    renderSummary: function () {
      const container = document.getElementById('checkoutOrderSummary');
      if (!container) return;

      const items = Cart.getItems();
      const totals = Cart.calculateTotals();
      const outlet = getSelectedOutlet();

      let itemsHtml = items.map(i => `
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <span>${i.quantity}x ${i.name}</span>
          <span style="font-weight:600;">₹${i.unitPrice * i.quantity}</span>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background:var(--color-surface-alt);padding:14px;border-radius:var(--radius-md);margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h4 style="font-size:13px;font-weight:700;">Order Summary (${items.length} items)</h4>
            <span class="hero-pill" style="font-size:11px;">📍 ${escapeHtml(outlet.name)}</span>
          </div>
          ${itemsHtml}
          <div style="border-top:1px dashed var(--color-border);margin-top:8px;padding-top:8px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-muted);">
              <span>Subtotal</span><span>₹${totals.subtotal}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-muted);">
              <span>Delivery Fee</span><span>${totals.deliveryFee === 0 ? 'FREE' : '₹' + totals.deliveryFee}</span>
            </div>
            ${totals.discount > 0 ? `
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-accent-veg);">
                <span>Discount (${totals.coupon.code})</span><span>-₹${totals.discount}</span>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:15px;margin-top:6px;padding-top:6px;border-top:1px solid var(--color-border);">
              <span>To Pay</span><span>₹${totals.total}</span>
            </div>
          </div>
        </div>
      `;
    },

    submitOrder: function (event) {
      if (event) event.preventDefault();

      const nameInput = document.getElementById('orderName');
      const phoneInput = document.getElementById('orderPhone');
      const emailInput = document.getElementById('orderEmail');
      const addressInput = document.getElementById('orderAddress');
      const notesInput = document.getElementById('orderNotes');

      let isValid = true;

      // Validation
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const address = addressInput ? addressInput.value.trim() : '';
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!name) {
        showToast('Please enter your full name', 'error');
        isValid = false;
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phone || !phoneRegex.test(phone.replace(/\D/g, '').slice(-10))) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        isValid = false;
      }

      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!email || !emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        isValid = false;
      }

      if (!address || address.length < 8) {
        showToast('Please provide a complete delivery address', 'error');
        isValid = false;
      }

      if (!isValid) return;

      const orderId = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
      const totals = Cart.calculateTotals();
      const items = Cart.getItems();
      const outlet = getSelectedOutlet();

      const now = new Date();
      const orderDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const orderTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const newOrder = {
        id: orderId,
        date: orderDate,
        time: orderTime,
        timestamp: Date.now(),
        customerName: name,
        phone: phone,
        email: email,
        address: address,
        notes: notes,
        items: items,
        totals: totals,
        outlet: outlet,
        status: 'Kitchen Preparing',
        step: 2
      };

      // Save order to history
      saveOrder(newOrder);

      // Close checkout
      this.close();

      // Clear Cart
      Cart.clearCart();

      // Open Live Order Tracking Simulation directly!
      LiveTracker.open(orderId);
      showToast(`Order #${orderId} placed successfully!`, 'success');
    }
  };

  /* ==========================================================================
     One-Click Reorder
     ========================================================================== */
  function reorder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.items || !order.items.length) {
      showToast('Could not find order items to reorder', 'error');
      return;
    }

    const currentItems = Cart.getItems();
    let addedCount = 0;

    order.items.forEach(item => {
      // Check if item already exists in cart (by itemKey)
      const existingIndex = currentItems.findIndex(i => i.itemKey === item.itemKey);
      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += item.quantity;
      } else {
        currentItems.push(Object.assign({}, item));
      }
      addedCount++;
    });

    Cart.saveItems(currentItems);
    showToast(`Reordered ${addedCount} items from #${order.id}!`, 'success');
    openCartDrawer();
  }

  /* ==========================================================================
     Homepage & Common UI Initialization
     ========================================================================== */
  function renderBestSellersGrid() {
    const container = document.getElementById('bestSellersGrid');
    if (!container) return;

    const products = window.BiteCraftData.getProducts();
    const bestSellers = products.filter(p => p.bestseller).slice(0, 8);

    container.innerHTML = bestSellers.map(product => {
      const safeId = escapeHtml(product.id);
      const safeName = escapeHtml(product.name);
      const safeImage = escapeHtml(product.image);
      const safeFallback = escapeHtml(product.fallbackImage);
      const safeCategory = escapeHtml(product.category);
      const safeDesc = escapeHtml(product.description);
      return `
      <div class="product-card">
        <div class="product-thumb-wrap">
          <img src="${safeImage}" alt="${safeName}" class="product-thumb" onerror="this.src='${safeFallback}'" loading="lazy" />
          <button class="favorite-btn" data-favorite-id="${safeId}" onclick="BiteCraft.favorites.toggle('${safeId}')" aria-label="Toggle favorite">♡</button>
          <div class="product-badge-wrap">
            <span class="badge-bestseller">★ Bestseller</span>
          </div>
          <div class="product-rating-pill">
            ★ ${product.rating || 4.8}
          </div>
        </div>
        <div class="product-body">
          <div class="product-meta-row">
            <span class="product-cat-name">${safeCategory}</span>
            <span class="diet-indicator ${product.vegetarian ? '' : 'non-veg'}" title="${product.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
          </div>
          <h3 class="product-title">${safeName}</h3>
          <p class="product-desc">${safeDesc}</p>
          <div class="product-footer">
            <div class="product-price-box">
              <span class="price-label">Price</span>
              <span class="price-value">₹${product.price}</span>
            </div>
            <div class="product-btn-group">
              <button class="btn btn-secondary btn-sm" onclick="BiteCraft.quickView.open('${safeId}')">Quick View</button>
              ${product.customizations && product.customizations.length > 0 ? `
                <button class="btn btn-secondary btn-sm" onclick="BiteCraft.customizer.open('${safeId}')">Customize</button>
              ` : ''}
              <button class="btn btn-primary btn-sm" onclick="BiteCraft.cart.addItem(window.BiteCraftData.getProducts().find(p=>p.id==='${safeId}'))">Add +</button>
            </div>
          </div>
        </div>
      </div>
    `}).join('');
  }

  function initHeaderAndNav() {
    // Scroll effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 20) header.classList.add('header-scrolled');
        else header.classList.remove('header-scrolled');
      }
    });

    // Mobile menu toggle
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
    }

    // Cart trigger clicks
    document.querySelectorAll('.cart-btn-trigger').forEach(btn => {
      btn.addEventListener('click', openCartDrawer);
    });

    // Theme toggle clicks
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Outlet selector changes
    document.querySelectorAll('.outlet-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        setSelectedOutlet(e.target.value);
      });
    });

    // Store status badge click
    document.querySelectorAll('.store-status-badge').forEach(badge => {
      badge.addEventListener('click', toggleStoreOverride);
    });

    syncOutletUI();
    syncStoreStatusUI();
  }

  function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    const input = document.getElementById('newsletterEmail');
    const status = document.getElementById('newsletterStatus');
    if (!form || !input || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

      if (!regex.test(val)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'newsletter-status error';
        return;
      }

      status.textContent = 'Thank you for subscribing! Check your inbox soon (Demo simulation).';
      status.className = 'newsletter-status success';
      input.value = '';
      showToast('Subscribed successfully!', 'success');
    });
  }

  // Inject Common Global Modals (Quick View, Cart Drawer, Customizer, Checkout Modal, Live Order Tracking)
  function injectCommonModals() {
    if (document.getElementById('cartDrawerOverlay')) return; // Already exists

    const modalsHtml = `
      <!-- Quick View Modal with Nutrition & Spice Meters -->
      <div class="modal-overlay" id="quickViewModal" onclick="if(event.target===this) BiteCraft.quickView.close()">
        <div class="modal-card" style="max-width:760px;">
          <div class="modal-header">
            <h3 class="modal-title">Product Quick View</h3>
            <button class="modal-close-btn" onclick="BiteCraft.quickView.close()">✕</button>
          </div>
          <div class="modal-body" id="quickViewBody"></div>
        </div>
      </div>

      <!-- Cart Drawer with Free Delivery Progress Bar & Available Coupons Tray -->
      <div class="cart-drawer-overlay" id="cartDrawerOverlay" onclick="if(event.target===this) BiteCraft.closeCartDrawer()">
        <div class="cart-drawer">
          <div class="cart-drawer-header">
            <h3 style="font-size:18px;font-weight:700;">Your Cart</h3>
            <button class="modal-close-btn" onclick="BiteCraft.closeCartDrawer()">✕</button>
          </div>
          <div class="cart-drawer-body" id="cartDrawerItems">
            <!-- Dynamic Cart Items + Free Delivery Bar + Upsells -->
          </div>
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <!-- Available Coupons Tray -->
            <div id="cartAvailableCouponsTray"></div>

            <div class="cart-promo-box">
              <input type="text" id="cartPromoInput" class="cart-promo-input" placeholder="Coupon Code (e.g. BITE10)" />
              <button class="btn btn-secondary btn-sm" onclick="BiteCraft.applyCoupon()">Apply</button>
            </div>
            <div class="cart-summary-row">
              <span>Item Subtotal</span>
              <span id="cartDrawerSubtotal">₹0</span>
            </div>
            <div class="cart-summary-row">
              <span>Delivery Fee</span>
              <span id="cartDrawerDelivery">₹40</span>
            </div>
            <div class="cart-summary-row" id="cartDrawerDiscountRow" style="display:none;color:var(--color-accent-veg);">
              <span>Discount</span>
              <span id="cartDrawerDiscount">-₹0</span>
            </div>
            <div class="cart-summary-row total-row">
              <span>Total Amount</span>
              <span id="cartDrawerTotal">₹0</span>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:14px;" onclick="BiteCraft.checkout.open()">
              Proceed to Demo Checkout →
            </button>
          </div>
        </div>
      </div>

      <!-- Customization Modal -->
      <div class="modal-overlay" id="customModal" onclick="if(event.target===this) BiteCraft.customizer.close()">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title" id="customModalTitle">Customize Item</h3>
            <button class="modal-close-btn" onclick="BiteCraft.customizer.close()">✕</button>
          </div>
          <div class="modal-body" id="customModalBody">
            <!-- Dynamic Customization Options -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="BiteCraft.customizer.close()">Cancel</button>
            <button class="btn btn-primary" id="customModalAddBtn" onclick="BiteCraft.customizer.confirmAdd()">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Checkout Modal -->
      <div class="modal-overlay" id="checkoutModal" onclick="if(event.target===this) BiteCraft.checkout.close()">
        <div class="modal-card" style="max-width:580px;">
          <div class="modal-header">
            <h3 class="modal-title">Demo Fast-Food Checkout</h3>
            <button class="modal-close-btn" onclick="BiteCraft.checkout.close()">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size:12px;background:var(--color-primary-light);color:var(--color-primary);padding:8px 12px;border-radius:var(--radius-md);margin-bottom:16px;">
              ℹ️ <strong>Demo Simulation:</strong> No real payment is processed, and no food will actually be delivered.
            </p>
            <div id="checkoutOrderSummary"></div>
            <form id="checkoutForm" onsubmit="BiteCraft.checkout.submitOrder(event)">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" id="orderName" class="form-input" placeholder="e.g. Rahul Sharma" required />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" id="orderPhone" class="form-input" placeholder="10-digit Mobile" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" id="orderEmail" class="form-input" placeholder="name@example.com" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Delivery Address *</label>
                <textarea id="orderAddress" class="form-textarea" rows="2" placeholder="House / Flat No, Street, Landmark" required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Cooking / Delivery Instructions (Optional)</label>
                <input type="text" id="orderNotes" class="form-input" placeholder="e.g. Extra napkins, ring the doorbell" />
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px;">
                Place Demo Order (Pay on Delivery Simulation)
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Live Order Tracking Simulation Modal -->
      <div class="modal-overlay" id="orderTrackingModal" onclick="if(event.target===this) BiteCraft.liveTracker.close()">
        <div class="modal-card" style="max-width:540px;">
          <div class="modal-header">
            <h3 class="modal-title">Live Order Tracking</h3>
            <button class="modal-close-btn" onclick="BiteCraft.liveTracker.close()">✕</button>
          </div>
          <div class="modal-body" id="orderTrackingBody">
            <!-- Dynamic Tracker Content -->
          </div>
        </div>
      </div>

      <!-- Order Confirmation Modal -->
      <div class="modal-overlay" id="orderConfirmationModal">
        <div class="modal-card" style="max-width:480px;">
          <div class="modal-body" id="orderConfirmationBody">
            <!-- Dynamic receipt -->
          </div>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalsHtml;
    document.body.appendChild(div);

    // Add Escape key handler for all modals
    document.addEventListener('keydown', handleModalEscape);
  }

  function handleModalEscape(e) {
    if (e.key !== 'Escape') return;
    // Close the topmost open modal
    const openModals = document.querySelectorAll('.modal-overlay.open, .cart-drawer-overlay.open');
    if (openModals.length > 0) {
      const topModal = openModals[openModals.length - 1];
      if (topModal.id === 'cartDrawerOverlay') {
        closeCartDrawer();
      } else if (topModal.id === 'quickViewModal') {
        QuickView.close();
      } else if (topModal.id === 'customModal') {
        Customizer.close();
      } else if (topModal.id === 'checkoutModal') {
        Checkout.close();
      } else if (topModal.id === 'orderTrackingModal') {
        LiveTracker.close();
      } else if (topModal.id === 'orderConfirmationModal') {
        topModal.classList.remove('open');
      }
    }
  }

  // Public Interface
  window.BiteCraft = {
    showToast,
    escapeHtml,
    cart: Cart,
    favorites: Favorites,
    customizer: Customizer,
    quickView: QuickView,
    checkout: Checkout,
    liveTracker: LiveTracker,
    openCartDrawer,
    closeCartDrawer,
    toggleTheme,
    applyCoupon: applyCouponFromInput,
    applyCouponCode,
    renderBestSellers: renderBestSellersGrid,
    getSelectedOutlet,
    setSelectedOutlet,
    isStoreOpen,
    toggleStoreOverride,
    getOrders,
    saveOrder,
    reorder
  };

  // Run on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    injectCommonModals();
    initHeaderAndNav();
    initNewsletter();
    Cart.updateBadge();
    renderBestSellersGrid();
    Favorites.syncButtons();
    Favorites.renderHomeFavorites();
  });

})();
