/**
 * BiteCraft Order History & Reorder Engine
 * Renders past demo orders from localStorage, triggers live tracking simulation,
 * and enables one-click reordering.
 */

(function () {
  'use strict';

  function renderOrdersList() {
    const root = document.getElementById('ordersListRoot');
    if (!root || !window.BiteCraft) return;

    const orders = window.BiteCraft.getOrders();

    if (!orders || orders.length === 0) {
      root.innerHTML = `
        <div class="empty-box" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:60px 20px;">
          <div class="empty-icon">📋</div>
          <h2 class="empty-title">No orders placed yet</h2>
          <p class="empty-desc">Your past demo orders will appear here once you place an order or test a sample order.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;">
            <a href="menu.html" class="btn btn-primary">Browse Menu & Order</a>
            <button class="btn btn-secondary" onclick="BiteCraftOrders.addSampleOrder()">+ Create Demo Sample Order</button>
          </div>
        </div>
      `;
      return;
    }

    const html = orders.map(order => {
      const outletName = order.outlet ? escapeHtml(order.outlet.name) : 'Metro Downtown Hub';
      const status = order.status || 'Kitchen Preparing';
      let statusClass = 'status-prep';
      if (status === 'Delivered') statusClass = 'status-delivered';
      else if (status === 'Out with Rider') statusClass = 'status-rider';
      const safeOrderId = escapeHtml(order.id);

      const itemsHtml = order.items.map(i => {
        const customs = i.customizations && i.customizations.length
          ? i.customizations.map(c => escapeHtml(c.name)).join(', ')
          : 'Standard prep';

        const safeName = escapeHtml(i.name);
        const safeImage = escapeHtml(i.image);
        const safeFallback = escapeHtml(i.fallbackImage);

        return `
          <div class="order-item-row">
            <img src="${safeImage}" alt="${safeName}" class="order-item-thumb" onerror="this.src='${safeFallback}'">
            <div class="order-item-info">
              <div class="order-item-title">${i.quantity}x ${safeName}</div>
              <div class="order-item-sub">${customs}</div>
            </div>
            <div class="order-item-price">₹${i.unitPrice * i.quantity}</div>
          </div>
        `;
      }).join('');

      return `
        <article class="order-history-card">
          <div class="order-card-header">
            <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                <h3 class="order-card-id">#${safeOrderId}</h3>
                <span class="order-status-pill ${statusClass}">${escapeHtml(status)}</span>
              </div>
              <p class="order-card-date">Placed on ${escapeHtml(order.date)} at ${escapeHtml(order.time)} • 📍 ${outletName}</p>
            </div>
            <div class="order-card-actions">
              <button class="btn btn-secondary btn-sm" onclick="BiteCraft.liveTracker.open('${safeOrderId}')">
                Track Live 🛵
              </button>
              <button class="btn btn-primary btn-sm" onclick="BiteCraft.reorder('${safeOrderId}')">
                Reorder 🔁
              </button>
            </div>
          </div>

          <div class="order-card-body">
            ${itemsHtml}
          </div>

          <div class="order-card-footer">
            <div style="font-size:13px;color:var(--color-text-muted);">
              Delivery to: <strong>${BiteCraft.escapeHtml(order.customerName)}</strong> (${BiteCraft.escapeHtml(order.address)})
            </div>
            <div class="order-card-total">
              <span style="font-size:12px;color:var(--color-text-muted);font-weight:500;">Total Paid:</span>
              <span style="font-size:18px;font-weight:800;color:var(--color-primary);">₹${order.totals.total}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    root.innerHTML = html;
  }

  function addSampleOrder() {
    const products = window.BiteCraftData ? window.BiteCraftData.getProducts() : [];
    const sampleItems = [
      products.find(p => p.id === 'prod-1') || products[0],
      products.find(p => p.id === 'prod-9') || products[1],
      products.find(p => p.id === 'prod-18') || products[2]
    ].filter(Boolean).map(p => ({
      itemKey: `${p.id}__default`,
      productId: p.id,
      name: p.name,
      category: p.category,
      basePrice: p.price,
      unitPrice: p.price,
      image: p.image,
      fallbackImage: p.fallbackImage,
      vegetarian: p.vegetarian,
      customizations: [],
      quantity: 1
    }));

    const now = new Date();
    const orderId = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
    const subtotal = sampleItems.reduce((acc, i) => acc + i.unitPrice, 0);

    const sampleOrder = {
      id: orderId,
      date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      customerName: 'Demo Foodie',
      phone: '9876543210',
      email: 'demo@bitecraft.example',
      address: 'Flat 402, Sunshine Apartments, Indiranagar',
      notes: 'Please ring the bell',
      items: sampleItems,
      totals: {
        subtotal: subtotal,
        deliveryFee: 0,
        discount: 0,
        total: subtotal
      },
      outlet: window.BiteCraft.getSelectedOutlet ? window.BiteCraft.getSelectedOutlet() : { name: 'Metro Downtown Hub' },
      status: 'Kitchen Preparing',
      step: 2
    };

    window.BiteCraft.saveOrder(sampleOrder);
    if (window.BiteCraft.showToast) window.BiteCraft.showToast(`Sample Order #${orderId} generated!`, 'success');
    renderOrdersList();
  }

  function clearHistory() {
    if (!confirm('Clear all demo order history?')) return;
    localStorage.removeItem('bitecraft_orders');
    if (window.BiteCraft.showToast) window.BiteCraft.showToast('Order history cleared.', 'info');
    renderOrdersList();
  }

  window.BiteCraftOrders = {
    render: renderOrdersList,
    addSampleOrder,
    clearHistory
  };

  document.addEventListener('DOMContentLoaded', renderOrdersList);
})();
