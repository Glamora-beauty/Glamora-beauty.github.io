/**
 * ============================================================================
 * GLAMORA — SHOPPING CART MANAGER
 * LocalStorage-backed cart management with zero price calculations.
 * Supports shades, colors, variants, individual product notes, and gift toggle.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'glamora_cart_items';
  const PREFS_KEY = 'glamora_order_prefs';

  class CartManager {
    constructor() {
      this.items = this.loadFromStorage();
      this.prefs = this.loadPrefs();
      this.initListeners();
      this.syncBadge();
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Error loading cart from storage:', e);
        return [];
      }
    }

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
        this.syncBadge();
        window.dispatchEvent(new CustomEvent('glamora:cartUpdated', { detail: { count: this.getTotalCount(), items: this.items } }));
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    }

    loadPrefs() {
      try {
        const raw = localStorage.getItem(PREFS_KEY);
        return raw ? JSON.parse(raw) : { isGift: false, generalNotes: '' };
      } catch (e) {
        return { isGift: false, generalNotes: '' };
      }
    }

    savePrefs(prefs) {
      this.prefs = { ...this.prefs, ...prefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    }

    /**
     * Generate unique cart item id based on product id and selected variant configurations
     */
    generateCartItemId(productId, options = {}) {
      const parts = [
        productId,
        options.selectedColor || '',
        options.selectedShade || '',
        options.selectedSize || '',
        options.selectedVariant || ''
      ];
      return parts.join('_').replace(/[^a-zA-Z0-9_-]/g, '-');
    }

    /**
     * Add product to cart
     */
    addItem(product, quantity = 1, options = {}) {
      const cartItemId = this.generateCartItemId(product.id, options);
      const existingIndex = this.items.findIndex(item => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        this.items[existingIndex].quantity += Number(quantity);
        if (options.notes) {
          this.items[existingIndex].notes = options.notes;
        }
      } else {
        this.items.push({
          cartItemId: cartItemId,
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          primaryImage: product.primaryImage || 'assets/products/placeholder.svg',
          quantity: Math.max(1, Number(quantity)),
          selectedColor: options.selectedColor || null,
          selectedShade: options.selectedShade || null,
          selectedSize: options.selectedSize || null,
          selectedVariant: options.selectedVariant || null,
          notes: options.notes || ''
        });
      }

      this.saveToStorage();
      if (window.GlamoraApp && typeof window.GlamoraApp.showToast === 'function') {
        window.GlamoraApp.showToast(`Added "${product.name}" to cart.`, 'success');
      }
      return true;
    }

    /**
     * Remove item by unique cartItemId
     */
    removeItem(cartItemId) {
      const prevLength = this.items.length;
      this.items = this.items.filter(item => item.cartItemId !== cartItemId);
      if (this.items.length !== prevLength) {
        this.saveToStorage();
        if (window.GlamoraApp && typeof window.GlamoraApp.showToast === 'function') {
          window.GlamoraApp.showToast('Item removed from cart.');
        }
      }
    }

    /**
     * Update item quantity
     */
    updateQuantity(cartItemId, newQty) {
      const item = this.items.find(i => i.cartItemId === cartItemId);
      if (!item) return;

      const qty = parseInt(newQty, 10);
      if (qty <= 0) {
        this.removeItem(cartItemId);
      } else {
        item.quantity = qty;
        this.saveToStorage();
      }
    }

    /**
     * Update customer note on item
     */
    updateItemNotes(cartItemId, notes) {
      const item = this.items.find(i => i.cartItemId === cartItemId);
      if (item) {
        item.notes = notes;
        this.saveToStorage();
      }
    }

    /**
     * Clear entire cart
     */
    clearCart() {
      this.items = [];
      this.saveToStorage();
    }

    /**
     * Get all cart items
     */
    getItems() {
      return this.items;
    }

    /**
     * Get total quantity of items
     */
    getTotalCount() {
      return this.items.reduce((total, item) => total + (item.quantity || 1), 0);
    }

    /**
     * Sync badge counters in header and mobile navigation
     */
    syncBadge() {
      const count = this.getTotalCount();
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
          badge.classList.add('has-items');
        } else {
          badge.classList.remove('has-items');
        }
      });
    }

    initListeners() {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.items = this.loadFromStorage();
          this.syncBadge();
          window.dispatchEvent(new CustomEvent('glamora:cartUpdated', { detail: { count: this.getTotalCount(), items: this.items } }));
        }
      });
    }
  }

  window.GlamoraCart = new CartManager();
})(window);
