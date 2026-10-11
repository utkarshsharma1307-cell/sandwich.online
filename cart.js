/**
 * BiteCraft Cart Page
 * Renders full cart page with Free Delivery Progress Bar, Available Coupons Tray,
 * Smart Upsells, and delegates core cart logic to main.js.
 */
(function () {
  'use strict';

  function renderCartPage() {
    const root = document.getElementById('cartPageRoot');
    if (!root || !window.BiteCraft) return;

    const items = BiteCraft.cart.getItems();
    const totals = BiteCraft.cart.calculateTotals();
    const outlet = BiteCraft.getSelectedOutlet ? BiteCraft.getSelectedOutlet() : { name: 'Metro Downtown Hub', eta: '20-30 mins' };

    if (items.length === 0) {
      root.innerHTML = `
        <div class="empty-box" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:60px 20px;">
          <div class="empty-icon">🛒</div>
          <h2 class="empty-title">Your cart is empty</h2>
          <p class="empty-desc">Add delicious grilled sandwiches, burgers, loaded fries, and beverages from our menu!</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;">
            <a href="menu.html" class="btn btn-primary">Browse Full Menu</a>
            <a href="combo.html" class="btn btn-secondary">Build a Value Box 🍱</a>
          </div>
        </div>`;
      return;
    }

    // 1. Free Delivery Progress Bar
    const threshold = totals.threshold || 499;
    const remaining = Math.max(0, threshold - totals.subtotal);
    const percent = Math.min(100, Math.round((totals.subtotal / threshold) * 100));

    let freeDeliveryHtml = '';
    if (remaining > 0) {
      freeDeliveryHtml = `
        <div class="free-delivery-box" style="margin-bottom:20px;">
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
        <div class="free-delivery-box unlocked" style="margin-bottom:20px;">
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

    // 2. Items HTML
    const itemsHtml = items.map(item => {
      const customs = item.customizations && item.customizations.length
        ? item.customizations.map(c => c.name).join(', ')
        : 'Standard prep';

      return `
        <div class="cart-item" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:16px;margin-bottom:14px;">
          <img class="cart-item-thumb" src="${item.image}" alt="${item.name}" onerror="this.src='${item.fallbackImage}'">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-customs">${customs}</div>
            <div class="cart-item-bottom">
              <strong>₹${item.unitPrice * item.quantity}</strong>
              <div class="quantity-stepper">
                <button class="step-btn" onclick="BiteCraft.cart.updateQuantity('${item.itemKey}', -1); BiteCraftCartPage.render();">-</button>
                <span class="step-value">${item.quantity}</span>
                <button class="step-btn" onclick="BiteCraft.cart.updateQuantity('${item.itemKey}', 1); BiteCraftCartPage.render();">+</button>
              </div>
              <button class="remove-cart-item" onclick="BiteCraft.cart.removeItem('${item.itemKey}'); BiteCraftCartPage.render();">Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');

    // 3. Smart Upsell Items
    const inCartIds = items.map(i => i.productId);
    const allProducts = window.BiteCraftData ? window.BiteCraftData.getProducts() : [];
    const upsellItems = allProducts.filter(p => !inCartIds.includes(p.id) && (p.category === 'Fries' || p.category === 'Beverages')).slice(0, 3);

    let upsellHtml = '';
    if (upsellItems.length > 0) {
      upsellHtml = `
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:20px;margin-top:24px;">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">⚡ Frequently Paired Bites</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;">
            ${upsellItems.map(p => `
              <div style="display:flex;align-items:center;gap:12px;background:var(--color-surface-alt);padding:10px;border-radius:var(--radius-md);">
                <img src="${p.image}" alt="${p.name}" style="width:48px;height:48px;border-radius:var(--radius-sm);object-fit:cover;" onerror="this.src='${p.fallbackImage}'">
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                  <div style="font-size:12px;color:var(--color-primary);font-weight:700;">₹${p.price}</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="BiteCraft.cart.addItem(window.BiteCraftData.getProducts().find(x=>x.id==='${p.id}')); BiteCraftCartPage.render();">+ Add</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Available Coupons Tray
    const couponsMap = window.BiteCraftData.getCoupons ? window.BiteCraftData.getCoupons() : (window.BiteCraftData.coupons || {});
    let couponsTrayHtml = '<div style="margin-top:16px;"><span style="font-size:12px;font-weight:700;color:var(--color-text-muted);display:block;margin-bottom:8px;">AVAILABLE OFFERS:</span><div style="display:grid;gap:8px;">';

    Object.values(couponsMap).forEach(cp => {
      const isApplied = totals.coupon && totals.coupon.code === cp.code;
      couponsTrayHtml += `
        <div class="coupon-chip ${isApplied ? 'applied' : ''}" onclick="BiteCraftCartPage.applyCode('${cp.code}')" style="cursor:pointer;">
          <div class="coupon-chip-top">
            <span class="chip-code">${cp.code}</span>
            <span class="chip-action">${isApplied ? 'Applied ✓' : 'Apply'}</span>
          </div>
          <div class="chip-label">${cp.label}</div>
        </div>
      `;
    });
    couponsTrayHtml += '</div></div>';

    root.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:28px;align-items:start;" class="cart-page-grid">
        <div>
          ${freeDeliveryHtml}
          ${itemsHtml}
          <div style="display:flex;gap:12px;margin-top:16px;">
            <button class="btn btn-secondary btn-sm" onclick="BiteCraft.cart.clearCart(); BiteCraftCartPage.render();">Clear Cart</button>
            <a href="menu.html" class="btn btn-secondary btn-sm">+ Add More Items</a>
          </div>
          ${upsellHtml}
        </div>

        <aside style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:24px;position:sticky;top:100px;box-shadow:var(--shadow-sm);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <h3 style="font-size:20px;font-weight:800;">Order Summary</h3>
            <span class="hero-pill" style="font-size:11px;">📍 ${outlet.name}</span>
          </div>

          <div class="cart-promo-box">
            <input id="cartPagePromo" class="cart-promo-input" placeholder="Coupon Code (e.g. BITE10)">
            <button class="btn btn-secondary btn-sm" onclick="BiteCraftCartPage.applyPromo()">Apply</button>
          </div>

          ${couponsTrayHtml}

          <div style="margin-top:20px;border-top:1px solid var(--color-border);padding-top:14px;">
            <div class="cart-summary-row"><span>Subtotal</span><span>₹${totals.subtotal}</span></div>
            <div class="cart-summary-row">
              <span>Delivery Fee</span>
              <span>${totals.deliveryFee === 0 ? '<strong style="color:var(--color-accent-veg);">FREE</strong>' : '₹' + totals.deliveryFee}</span>
            </div>
            ${totals.discount ? `<div class="cart-summary-row" style="color:var(--color-accent-veg);"><span>Discount (${totals.coupon.code})</span><span>-₹${totals.discount}</span></div>` : ''}
            <div class="cart-summary-row total-row"><span>Total Amount</span><span>₹${totals.total}</span></div>
          </div>

          <button class="btn btn-primary" style="width:100%;margin-top:18px;" onclick="BiteCraft.checkout.open()">
            Proceed to Demo Checkout ➔
          </button>
          <a class="btn btn-secondary" style="width:100%;margin-top:10px;" href="menu.html">Continue Shopping</a>
          <p style="font-size:12px;color:var(--color-text-muted);margin-top:14px;text-align:center;">
            Estimated delivery: <strong>${outlet.eta}</strong>. Demo simulation only.
          </p>
        </aside>
      </div>`;
  }

  function applyPromo() {
    const pageInput = document.getElementById('cartPagePromo');
    if (!pageInput) return;
    const code = pageInput.value.trim().toUpperCase();
    if (window.BiteCraft) {
      window.BiteCraft.applyCouponCode(code);
      renderCartPage();
    }
  }

  function applyCode(code) {
    if (window.BiteCraft) {
      window.BiteCraft.applyCouponCode(code);
      renderCartPage();
    }
  }

  window.BiteCraftCartPage = { render: renderCartPage, applyPromo, applyCode };
  document.addEventListener('DOMContentLoaded', renderCartPage);
})();