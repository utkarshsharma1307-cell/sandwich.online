/**
 * BiteCraft Local Admin Dashboard & Analytics Engine
 * Multi-tab control center: Products CRUD, Coupon Management,
 * HTML5 Canvas Sales Analytics, and JSON Export/Import.
 */
(function () {
  'use strict';

  const state = {
    search: '',
    category: 'All',
    editId: null,
    activeTab: 'products'
  };

  function products() {
    return window.BiteCraftData ? window.BiteCraftData.getProducts() : [];
  }

  function getCoupons() {
    return window.BiteCraftData ? window.BiteCraftData.getCoupons() : {};
  }

  /* ==========================================================================
     Tab Switching
     ========================================================================== */
  function switchTab(tabName) {
    state.activeTab = tabName;

    // Toggle button active states
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tabBtn${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Toggle content panes
    document.querySelectorAll('.admin-tab-content').forEach(pane => {
      pane.style.display = 'none';
      pane.classList.remove('active');
    });

    const activePane = document.getElementById(`tabContent${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (activePane) {
      activePane.style.display = 'block';
      activePane.classList.add('active');
    }

    if (tabName === 'analytics') {
      renderAnalytics();
    } else if (tabName === 'coupons') {
      renderCoupons();
    } else if (tabName === 'products') {
      renderAll();
    }
  }

  /* ==========================================================================
     Tab 1: Product Management
     ========================================================================== */
  function categoryCounts(list) {
    return list.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }

  function renderStats() {
    const list = products();
    const counts = categoryCounts(list);
    const stats = document.getElementById('adminStats');
    if (!stats) return;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    stats.innerHTML = `
      <div class="why-card"><div class="why-icon-box">🍽️</div><h3 class="why-title">${list.length}</h3><p class="why-desc">Total products</p></div>
      <div class="why-card"><div class="why-icon-box">✅</div><h3 class="why-title">${list.filter(p => p.available !== false).length}</h3><p class="why-desc">Available items</p></div>
      <div class="why-card"><div class="why-icon-box">🥬</div><h3 class="why-title">${list.filter(p => p.vegetarian).length}</h3><p class="why-desc">Vegetarian items</p></div>
      <div class="why-card"><div class="why-icon-box">⭐</div><h3 class="why-title">${list.filter(p => p.bestseller).length}</h3><p class="why-desc">Bestsellers</p></div>
      <div style="grid-column:1/-1;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:18px;"><strong>Category counts:</strong> ${top.map(([k,v]) => `${k}: ${v}`).join(' • ')}</div>`;
  }

  function filteredProducts() {
    let list = products();
    if (state.category !== 'All') list = list.filter(p => p.category === state.category);
    if (state.search) {
      const s = state.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    return list;
  }

  function renderList() {
    const root = document.getElementById('adminProductList');
    if (!root) return;
    const list = filteredProducts();
    if (!list.length) {
      root.innerHTML = '<div class="empty-box"><div class="empty-icon">🔎</div><h3 class="empty-title">No products found</h3></div>';
      return;
    }
    root.innerHTML = list.map(p => {
      const safeName = escapeHtml(p.name);
      const safeImage = escapeHtml(p.image);
      const safeFallback = escapeHtml(p.fallbackImage);
      const safeCategory = escapeHtml(p.category);
      const safeId = escapeHtml(p.id);
      const calories = p.nutrition ? p.nutrition.calories : '380';
      return `
      <div style="display:grid;grid-template-columns:70px minmax(0,1fr) auto;gap:14px;align-items:center;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:12px;margin-bottom:12px;">
        <img src="${safeImage}" alt="${safeName}" onerror="this.src='${safeFallback}'" style="width:70px;height:70px;border-radius:var(--radius-md);object-fit:cover;">
        <div>
          <strong>${safeName}</strong>
          <p style="font-size:12px;color:var(--color-text-muted);">
            ${safeCategory} • ₹${p.price} • ${p.vegetarian ? 'Veg 🥬' : 'Non-veg 🍗'} • ${p.available === false ? 'Hidden' : 'Active'} • Calories: ${calories} kcal
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="BiteCraftAdmin.edit('${safeId}')">Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="BiteCraftAdmin.toggle('${safeId}')">${p.available === false ? 'Make Available' : 'Hide'}</button>
          <button class="btn btn-primary btn-sm" onclick="BiteCraftAdmin.remove('${safeId}')">Delete</button>
        </div>
      </div>`}).join('');
  }

  function syncCategoryOptions() {
    const select = document.getElementById('adminFilterCategory');
    if (!select || !window.BiteCraftData) return;
    select.innerHTML = window.BiteCraftData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  function clearForm() {
    state.editId = null;
    document.getElementById('productForm').reset();
    document.getElementById('adminFormTitle').textContent = 'Add Demo Product';
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
    document.getElementById('productId').value = '';
  }

  function saveProduct(e) {
    e.preventDefault();
    const list = products();
    const id = document.getElementById('productId').value || `prod-local-${Date.now()}`;
    const cals = Number(document.getElementById('productCalories').value) || 380;
    const spice = Number(document.getElementById('productSpice').value) || 1;

    const data = {
      id,
      name: document.getElementById('productName').value.trim(),
      category: document.getElementById('productCategory').value,
      price: Math.max(1, Number(document.getElementById('productPrice').value)),
      description: document.getElementById('productDescription').value.trim(),
      vegetarian: document.getElementById('productVeg').checked,
      bestseller: document.getElementById('productBest').checked,
      available: document.getElementById('productAvailable').checked,
      image: document.getElementById('productImage').value.trim() || 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
      fallbackImage: window.BiteCraftData.initialProducts[0].fallbackImage,
      rating: 4.8,
      spiceLevel: spice,
      nutrition: { calories: cals, protein: "14g", carbs: "48g", fat: "16g" },
      allergens: ["Gluten"],
      customizations: []
    };

    if (!data.name || !data.category || !data.description) {
      if (window.BiteCraft) window.BiteCraft.showToast('Please complete product name, category and description.', 'error');
      return;
    }

    const idx = list.findIndex(p => p.id === id);
    if (idx > -1) list[idx] = Object.assign({}, list[idx], data);
    else list.unshift(data);

    window.BiteCraftData.saveProducts(list);
    if (window.BiteCraft) window.BiteCraft.showToast(idx > -1 ? 'Product updated locally' : 'Product added locally', 'success');
    clearForm();
    renderAll();
  }

  function edit(id) {
    const p = products().find(x => x.id === id);
    if (!p) return;
    state.editId = id;
    document.getElementById('adminFormTitle').textContent = 'Edit Demo Product';
    document.getElementById('productSubmitBtn').textContent = 'Update Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productDescription').value = p.description;
    document.getElementById('productImage').value = p.image || '';
    document.getElementById('productCalories').value = p.nutrition ? p.nutrition.calories : 380;
    document.getElementById('productSpice').value = p.spiceLevel != null ? p.spiceLevel : 1;
    document.getElementById('productVeg').checked = !!p.vegetarian;
    document.getElementById('productBest').checked = !!p.bestseller;
    document.getElementById('productAvailable').checked = p.available !== false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function remove(id) {
    if (!confirm('Delete this local demo product?')) return;
    const list = products().filter(p => p.id !== id);
    window.BiteCraftData.saveProducts(list);
    if (window.BiteCraft) window.BiteCraft.showToast('Product deleted locally', 'success');
    renderAll();
  }

  function toggle(id) {
    const list = products();
    const p = list.find(x => x.id === id);
    if (!p) return;
    p.available = p.available === false ? true : false;
    window.BiteCraftData.saveProducts(list);
    renderAll();
  }

  function resetDefaults() {
    if (!confirm('Reset all local product changes to the default demo menu?')) return;
    window.BiteCraftData.resetProducts();
    if (window.BiteCraft) window.BiteCraft.showToast('Default menu restored', 'success');
    renderAll();
  }

  /* ==========================================================================
     Tab 2: Coupon Management
     ========================================================================== */
  function renderCoupons() {
    const container = document.getElementById('adminCouponsList');
    if (!container) return;

    const couponsMap = getCoupons();
    const list = Object.values(couponsMap);

    if (list.length === 0) {
      container.innerHTML = '<div class="empty-box"><div class="empty-icon">🎟️</div><h3 class="empty-title">No coupons created</h3></div>';
      return;
    }

    container.innerHTML = list.map(c => `
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:16px;font-weight:800;color:var(--color-primary);background:var(--color-primary-light);padding:2px 8px;border-radius:var(--radius-sm);">${c.code}</span>
            <span class="hero-pill" style="font-size:11px;">Min: ₹${c.minOrder || 0}</span>
          </div>
          <div style="font-size:13px;color:var(--color-text-muted);margin-top:4px;">${c.label}</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="BiteCraftAdmin.deleteCoupon('${c.code}')">Delete</button>
      </div>
    `).join('');
  }

  function saveCoupon(e) {
    e.preventDefault();
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const type = document.getElementById('couponType').value;
    const value = Number(document.getElementById('couponValue').value);
    const minOrder = Number(document.getElementById('couponMinOrder').value) || 0;
    const label = document.getElementById('couponLabel').value.trim();

    if (!code || !label || !value) {
      if (window.BiteCraft) window.BiteCraft.showToast('Please fill all coupon fields', 'error');
      return;
    }

    const couponsMap = getCoupons();
    couponsMap[code] = {
      code,
      type,
      value,
      minOrder,
      label
    };

    window.BiteCraftData.saveCoupons(couponsMap);
    if (window.BiteCraft) window.BiteCraft.showToast(`Coupon "${code}" saved!`, 'success');
    document.getElementById('couponForm').reset();
    renderCoupons();
  }

  function deleteCoupon(code) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const couponsMap = getCoupons();
    delete couponsMap[code];
    window.BiteCraftData.saveCoupons(couponsMap);
    if (window.BiteCraft) window.BiteCraft.showToast(`Coupon "${code}" deleted`, 'info');
    renderCoupons();
  }

  /* ==========================================================================
     Tab 3: Sales Analytics Simulation (Canvas Charts)
     ========================================================================== */
  function renderAnalytics() {
    const orders = window.BiteCraft ? window.BiteCraft.getOrders() : [];
    const prods = products();

    // Calculate or simulate realistic demo metrics
    const orderCount = orders.length > 0 ? orders.length : 24;
    const totalRev = orders.length > 0
      ? orders.reduce((sum, o) => sum + (o.totals.total || 0), 0)
      : 8420;
    const avgOrderVal = Math.round(totalRev / orderCount);

    // KPI Cards
    const kpiEl = document.getElementById('analyticsKpis');
    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="why-card">
          <div class="why-icon-box">💰</div>
          <h3 class="why-title">₹${totalRev.toLocaleString('en-IN')}</h3>
          <p class="why-desc">Demo Sales Revenue</p>
        </div>
        <div class="why-card">
          <div class="why-icon-box">📦</div>
          <h3 class="why-title">${orderCount} Orders</h3>
          <p class="why-desc">Completed Orders</p>
        </div>
        <div class="why-card">
          <div class="why-icon-box">📈</div>
          <h3 class="why-title">₹${avgOrderVal}</h3>
          <p class="why-desc">Avg Order Value</p>
        </div>
        <div class="why-card">
          <div class="why-icon-box">🥪</div>
          <h3 class="why-title">Sandwiches</h3>
          <p class="why-desc">Top Craved Category</p>
        </div>
      `;
    }

    // Chart 1: Category Revenue Bar Chart
    drawCategoryChart();

    // Chart 2: Top Selling Items Horizontal Bar Chart
    drawBestsellerChart();

    // Recent Transactions Table
    renderRecentOrdersTable(orders);
  }

  function drawCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const categories = ['Sandwiches', 'Burgers', 'Fries', 'Pizza', 'Beverages'];
    const values = [3450, 2180, 1540, 1890, 1120];
    const maxVal = 4000;

    const barWidth = 48;
    const gap = 36;
    const startX = 40;
    const chartHeight = h - 60;

    categories.forEach((cat, idx) => {
      const val = values[idx];
      const barH = (val / maxVal) * chartHeight;
      const x = startX + idx * (barWidth + gap);
      const y = h - 35 - barH;

      // Bar fill with gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, '#ea580c');
      grad.addColorStop(1, '#f97316');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]) : ctx.fillRect(x, y, barWidth, barH);
      ctx.fill();

      // Value label on top
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`₹${val}`, x + barWidth / 2, y - 6);

      // Category label at bottom
      ctx.fillStyle = '#78716c';
      ctx.font = '10px sans-serif';
      ctx.fillText(cat.substring(0, 7), x + barWidth / 2, h - 15);
    });
  }

  function drawBestsellerChart() {
    const canvas = document.getElementById('bestsellerChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const items = [
      { name: 'Cheese Grilled', qty: 42 },
      { name: 'Peri-Peri Fries', qty: 38 },
      { name: 'Aloo Tikki Burger', qty: 31 },
      { name: 'Cold Coffee', qty: 29 },
      { name: 'Paneer Tikka Sand', qty: 24 }
    ];

    const maxQty = 50;
    const rowH = 34;
    const startY = 24;

    items.forEach((item, idx) => {
      const y = startY + idx * (rowH + 12);
      const maxBarW = w - 180;
      const barW = (item.qty / maxQty) * maxBarW;

      // Name label
      ctx.fillStyle = '#1c1917';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, 12, y + 14);

      // Bar background track
      ctx.fillStyle = '#f5f2eb';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(120, y, maxBarW, 18, 9) : ctx.fillRect(120, y, maxBarW, 18);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(120, y, barW, 18, 9) : ctx.fillRect(120, y, barW, 18);
      ctx.fill();

      // Qty label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'right';
      if (barW > 24) {
        ctx.fillText(`${item.qty}`, 120 + barW - 6, y + 13);
      } else {
        ctx.fillStyle = '#1c1917';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.qty}`, 120 + barW + 6, y + 13);
      }
    });
  }

  function renderRecentOrdersTable(orders) {
    const root = document.getElementById('analyticsRecentOrdersTable');
    if (!root) return;

    if (!orders || orders.length === 0) {
      root.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">No orders recorded yet. Place an order or generate a sample in "My Orders".</p>';
      return;
    }

    const rows = orders.slice(0, 5).map(o => `
      <tr style="border-bottom:1px solid var(--color-border);font-size:13px;">
        <td style="padding:10px 8px;"><strong>#${o.id}</strong></td>
        <td style="padding:10px 8px;">${o.date} ${o.time}</td>
        <td style="padding:10px 8px;">${BiteCraft.escapeHtml(o.customerName)}</td>
        <td style="padding:10px 8px;">${o.items.length} items</td>
        <td style="padding:10px 8px;font-weight:700;color:var(--color-primary);">₹${o.totals.total}</td>
        <td style="padding:10px 8px;"><span class="hero-pill" style="font-size:10px;">${o.status || 'Delivered'}</span></td>
      </tr>
    `).join('');

    root.innerHTML = `
      <table style="width:100%;border-collapse:collapse;text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid var(--color-border);font-size:12px;color:var(--color-text-muted);">
            <th style="padding:8px;">Order ID</th>
            <th style="padding:8px;">Date/Time</th>
            <th style="padding:8px;">Customer</th>
            <th style="padding:8px;">Items</th>
            <th style="padding:8px;">Total</th>
            <th style="padding:8px;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  /* ==========================================================================
     Tab 4: JSON Export & Import
     ========================================================================== */
  function exportMenuJson() {
    const currentProducts = products();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bitecraft-menu-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (window.BiteCraft) window.BiteCraft.showToast('Menu JSON exported successfully! 💾', 'success');
  }

  function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("JSON must be a non-empty array of products.");
        }

        // Validate basic product keys
        const first = parsed[0];
        if (!first.name || !first.price || !first.category) {
          throw new Error("Invalid product structure: missing name, price or category.");
        }

        window.BiteCraftData.saveProducts(parsed);
        if (window.BiteCraft) window.BiteCraft.showToast(`Imported ${parsed.length} products successfully! 🚀`, 'success');

        // Reset input and switch to products tab
        event.target.value = '';
        switchTab('products');
      } catch (err) {
        alert("Failed to import JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function bind() {
    const form = document.getElementById('productForm');
    if (form) form.addEventListener('submit', saveProduct);

    const search = document.getElementById('adminSearch');
    if (search) search.addEventListener('input', () => { state.search = search.value.trim(); renderList(); });

    const filter = document.getElementById('adminFilterCategory');
    if (filter) filter.addEventListener('change', () => { state.category = filter.value; renderList(); });
  }

  function renderAll() {
    renderStats();
    renderList();
  }

  function init() {
    syncCategoryOptions();
    bind();
    renderAll();
  }

  window.BiteCraftAdmin = {
    init,
    render: renderAll,
    edit,
    remove,
    toggle,
    resetDefaults,
    clearForm,
    switchTab,
    saveCoupon,
    deleteCoupon,
    exportMenuJson,
    handleImportFile
  };

  document.addEventListener('DOMContentLoaded', init);
})();
