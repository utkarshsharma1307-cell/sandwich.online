/**
 * BiteCraft Combo Meal Builder Engine
 * "Build Your Box" - Pick 1 Main + 1 Side + 1 Drink at 15% bundled discount
 */

(function () {
  'use strict';

  const selectedCombo = {
    main: null,
    side: null,
    drink: null
  };

  function getProducts() {
    return window.BiteCraftData ? window.BiteCraftData.getProducts() : [];
  }

  function renderCategoryOptions(containerId, filterFn, selectedKey) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = getProducts().filter(filterFn);

    container.innerHTML = products.map(p => {
      const isSelected = selectedCombo[selectedKey] && selectedCombo[selectedKey].id === p.id;
      return `
        <div class="combo-card-option ${isSelected ? 'selected' : ''}" onclick="BiteCraftCombo.selectItem('${selectedKey}', '${p.id}')">
          <img src="${p.image}" alt="${p.name}" class="combo-card-thumb" onerror="this.src='${p.fallbackImage}'">
          <div class="combo-card-body">
            <div class="combo-card-meta">
              <span class="diet-indicator ${p.vegetarian ? '' : 'non-veg'}"></span>
              <span class="combo-card-price">₹${p.price}</span>
            </div>
            <h4 class="combo-card-name">${p.name}</h4>
            <div class="combo-select-indicator">${isSelected ? '✓ Selected' : '+ Pick Item'}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function selectItem(key, productId) {
    const product = getProducts().find(p => p.id === productId);
    if (!product) return;

    if (selectedCombo[key] && selectedCombo[key].id === productId) {
      selectedCombo[key] = null; // deselect
    } else {
      selectedCombo[key] = product;
    }

    renderAllSteps();
    updateSummary();
  }

  function renderSlot(slotId, item, emptyText) {
    const el = document.getElementById(slotId);
    if (!el) return;

    const content = el.querySelector('.slot-content');
    if (!content) return;

    if (item) {
      content.innerHTML = `
        <div class="slot-filled">
          <img src="${item.image}" alt="${item.name}" class="slot-thumb" onerror="this.src='${item.fallbackImage}'">
          <div class="slot-details">
            <div class="slot-name">${item.name}</div>
            <div class="slot-price">₹${item.price}</div>
          </div>
          <button class="slot-remove-btn" onclick="BiteCraftCombo.clearSlot('${item.id}')" title="Remove">✕</button>
        </div>
      `;
    } else {
      content.innerHTML = `<span class="slot-empty-text">${emptyText}</span>`;
    }
  }

  function clearSlot(productId) {
    if (selectedCombo.main && selectedCombo.main.id === productId) selectedCombo.main = null;
    if (selectedCombo.side && selectedCombo.side.id === productId) selectedCombo.side = null;
    if (selectedCombo.drink && selectedCombo.drink.id === productId) selectedCombo.drink = null;

    renderAllSteps();
    updateSummary();
  }

  function updateSummary() {
    renderSlot('slotMain', selectedCombo.main, 'Select a Sandwich or Burger');
    renderSlot('slotSide', selectedCombo.side, 'Select Fries or Snack');
    renderSlot('slotDrink', selectedCombo.drink, 'Select a Beverage');

    const sum = (selectedCombo.main ? selectedCombo.main.price : 0) +
                (selectedCombo.side ? selectedCombo.side.price : 0) +
                (selectedCombo.drink ? selectedCombo.drink.price : 0);

    const origEl = document.getElementById('comboOriginalTotal');
    const discRow = document.getElementById('comboDiscountRow');
    const discEl = document.getElementById('comboDiscountAmount');
    const finalEl = document.getElementById('comboFinalTotal');
    const addBtn = document.getElementById('comboAddBtn');

    if (origEl) origEl.textContent = `₹${sum}`;

    const isComplete = selectedCombo.main && selectedCombo.side && selectedCombo.drink;

    if (isComplete) {
      const discount = Math.round(sum * 0.15); // 15% combo bundle discount
      const finalPrice = Math.max(0, sum - discount);

      if (discRow) discRow.style.display = 'flex';
      if (discEl) discEl.textContent = `-₹${discount} (15% OFF)`;
      if (finalEl) finalEl.textContent = `₹${finalPrice}`;

      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = `Add Box to Cart • ₹${finalPrice} 🛒`;
      }
    } else {
      if (discRow) discRow.style.display = 'none';
      if (finalEl) finalEl.textContent = `₹${sum}`;

      if (addBtn) {
        addBtn.disabled = true;
        const count = [selectedCombo.main, selectedCombo.side, selectedCombo.drink].filter(Boolean).length;
        addBtn.textContent = `Pick ${3 - count} more item${3 - count === 1 ? '' : 's'} ➔`;
      }
    }
  }

  function addComboToCart() {
    if (!selectedCombo.main || !selectedCombo.side || !selectedCombo.drink) {
      if (window.BiteCraft) window.BiteCraft.showToast('Please select all 3 items to complete your Box!', 'error');
      return;
    }

    const sum = selectedCombo.main.price + selectedCombo.side.price + selectedCombo.drink.price;
    const discount = Math.round(sum * 0.15);
    const finalPrice = Math.max(0, sum - discount);

    const comboProduct = {
      id: `combo-box-${Date.now()}`,
      name: `🍱 BiteCraft Custom Value Box`,
      category: 'Combos',
      price: finalPrice,
      image: selectedCombo.main.image,
      fallbackImage: selectedCombo.main.fallbackImage,
      vegetarian: selectedCombo.main.vegetarian && selectedCombo.side.vegetarian && selectedCombo.drink.vegetarian,
      description: `Includes: 1x ${selectedCombo.main.name}, 1x ${selectedCombo.side.name}, 1x ${selectedCombo.drink.name} (15% Bundle Discount applied!)`
    };

    const customs = [
      { name: `Main: ${selectedCombo.main.name}`, price: 0 },
      { name: `Side: ${selectedCombo.side.name}`, price: 0 },
      { name: `Drink: ${selectedCombo.drink.name}`, price: 0 }
    ];

    if (window.BiteCraft && window.BiteCraft.cart) {
      window.BiteCraft.cart.addItem(comboProduct, customs, 1);
      window.BiteCraft.showToast('Custom Box added with 15% discount! 🍱', 'success');
      window.BiteCraft.openCartDrawer();
      resetBox();
    }
  }

  function resetBox() {
    selectedCombo.main = null;
    selectedCombo.side = null;
    selectedCombo.drink = null;
    renderAllSteps();
    updateSummary();
  }

  function renderAllSteps() {
    // 1. Mains (Sandwiches & Burgers)
    renderCategoryOptions(
      'comboMainsGrid',
      p => p.category === 'Sandwiches' || p.category === 'Burgers',
      'main'
    );

    // 2. Sides (Fries & Snacks)
    renderCategoryOptions(
      'comboSidesGrid',
      p => p.category === 'Fries' || p.category === 'Snacks' || p.category === 'Momos',
      'side'
    );

    // 3. Drinks (Beverages)
    renderCategoryOptions(
      'comboDrinksGrid',
      p => p.category === 'Beverages',
      'drink'
    );
  }

  function init() {
    renderAllSteps();
    updateSummary();
  }

  window.BiteCraftCombo = {
    init,
    selectItem,
    clearSlot,
    resetBox,
    addComboToCart
  };

  document.addEventListener('DOMContentLoaded', init);
})();
