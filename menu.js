/**
 * BiteCraft Menu Page
 * Search, category filters, vegetarian filter, sorting, and product rendering.
 */
(function () {
  'use strict';

  const state = {
    search: '',
    category: 'All',
    vegetarianOnly: false,
    favoritesOnly: false,
    maxPrice: 0,
    sort: 'default'
  };

  function getQueryCategory() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'All';
  }

  function renderCategoryPills() {
    const wrap = document.getElementById('categoryPills');
    if (!wrap || !window.BiteCraftData) return;

    wrap.innerHTML = window.BiteCraftData.categories.map(cat => `
      <button class="cat-pill ${state.category === cat.id ? 'active' : ''}" data-category="${cat.id}" type="button">
        <span>${categoryEmoji(cat.id)}</span>${cat.name}
      </button>
    `).join('');

    wrap.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.category;
        const select = document.getElementById('categoryFilter');
        if (select) select.value = state.category;
        renderCategoryPills();
        renderProducts();
      });
    });
  }

  function categoryEmoji(category) {
    const map = {
      All: '🍽️', Sandwiches: '🥪', Burgers: '🍔', Fries: '🍟', Pizza: '🍕', Wraps: '🌯',
      Pasta: '🍝', Momos: '🥟', Snacks: '🧄', Beverages: '🥤', Desserts: '🍫'
    };
    return map[category] || '🍴';
  }

  function getFilteredProducts() {
    let products = window.BiteCraftData.getProducts().filter(p => p.available !== false);

    if (state.category !== 'All') {
      products = products.filter(p => p.category === state.category);
    }

    if (state.vegetarianOnly) {
      products = products.filter(p => p.vegetarian === true);
    }

    if (state.favoritesOnly && window.BiteCraft && window.BiteCraft.favorites) {
      const favoriteIds = window.BiteCraft.favorites.get();
      products = products.filter(p => favoriteIds.includes(p.id));
    }

    if (state.maxPrice > 0) {
      products = products.filter(p => p.price <= state.maxPrice);
    }

    if (state.search) {
      const term = state.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    if (state.sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (state.sort === 'name-asc') products.sort((a, b) => a.name.localeCompare(b.name));

    return products;
  }

  function productCard(product) {
    const hasCustom = product.customizations && product.customizations.length > 0;
    return `
      <article class="product-card">
        <div class="product-thumb-wrap">
          <img src="${product.image}" alt="${product.name}" class="product-thumb" onerror="this.src='${product.fallbackImage}'" loading="lazy" />
          <button class="favorite-btn" data-favorite-id="${product.id}" onclick="BiteCraft.favorites.toggle('${product.id}')" aria-label="Toggle favorite">♡</button>
          <div class="product-badge-wrap">
            ${product.bestseller ? '<span class="badge-bestseller">★ Bestseller</span>' : ''}
          </div>
          <div class="product-rating-pill">★ ${product.rating || '4.7'}</div>
        </div>
        <div class="product-body">
          <div class="product-meta-row">
            <span class="product-cat-name">${product.category}</span>
            <span class="diet-indicator ${product.vegetarian ? '' : 'non-veg'}" title="${product.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-footer">
            <div class="product-price-box"><span class="price-label">Demo Price</span><span class="price-value">₹${product.price}</span></div>
            <div class="product-btn-group">
              <button class="btn btn-secondary btn-sm" type="button" onclick="BiteCraft.quickView.open('${product.id}')">Quick View</button>
              ${hasCustom ? `<button class="btn btn-secondary btn-sm" type="button" onclick="BiteCraft.customizer.open('${product.id}')">Customize</button>` : ''}
              <button class="btn btn-primary btn-sm" type="button" onclick="BiteCraft.cart.addItem(window.BiteCraftData.getProducts().find(p=>p.id==='${product.id}'))">Add +</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts() {
    const grid = document.getElementById('productGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('resultCount');
    if (!grid) return;

    const products = getFilteredProducts();
    grid.innerHTML = products.map(productCard).join('');
    if (empty) empty.style.display = products.length ? 'none' : 'block';
    if (count) count.textContent = `${products.length} item${products.length === 1 ? '' : 's'} found`;
    if (window.BiteCraft && window.BiteCraft.favorites) window.BiteCraft.favorites.syncButtons();
  }

  function bindControls() {
    const search = document.getElementById('searchInput');
    const category = document.getElementById('categoryFilter');
    const veg = document.getElementById('vegFilter');
    const favorites = document.getElementById('favoritesFilter');
    const price = document.getElementById('priceRange');
    const priceLabel = document.getElementById('priceRangeValue');
    const sort = document.getElementById('sortSelect');

    if (search) search.addEventListener('input', () => { state.search = search.value.trim(); renderProducts(); });
    if (category) category.addEventListener('change', () => { state.category = category.value; renderCategoryPills(); renderProducts(); });
    if (veg) veg.addEventListener('change', () => { state.vegetarianOnly = veg.checked; renderProducts(); });
    if (favorites) favorites.addEventListener('change', () => { state.favoritesOnly = favorites.checked; renderProducts(); });
    if (price) price.addEventListener('input', () => {
      state.maxPrice = Number(price.value);
      if (priceLabel) priceLabel.textContent = state.maxPrice > 0 ? `Up to ₹${state.maxPrice}` : 'Any price';
      renderProducts();
    });
    if (sort) sort.addEventListener('change', () => { state.sort = sort.value; renderProducts(); });
  }

  function initMenu() {
    state.category = getQueryCategory();
    const category = document.getElementById('categoryFilter');
    if (category) category.value = state.category;
    bindControls();
    renderCategoryPills();
    renderProducts();
  }

  window.BiteCraftMenu = { init: initMenu, renderProducts };
  document.addEventListener('DOMContentLoaded', initMenu);
})();