/**
 * ============================================================================
 * GLAMORA — CHECKOUT & CART UI ENGINE
 * Form validation, dynamic WhatsApp order drafting, copy to clipboard,
 * Pakistan delivery details, and order confirmation workflow.
 * STRICT ENFORCEMENT: ZERO PRICES OR PAYMENT GATEWAYS.
 * ============================================================================
 */

(function (window) {
  'use strict';

  class CheckoutManager {
    constructor() {
      this.initCartPage();
      this.initCheckoutPage();
    }

    /**
     * CART PAGE INITIALIZATION (cart.html)
     */
    initCartPage() {
      const cartContainer = document.getElementById('cart-items-container');
      if (!cartContainer) return;

      const renderCart = () => {
        const items = window.GlamoraCart.getItems();
        const emptyState = document.getElementById('cart-empty-view');
        const filledState = document.getElementById('cart-filled-view');
        const itemCountLabel = document.getElementById('cart-total-items-count');

        if (itemCountLabel) {
          itemCountLabel.textContent = window.GlamoraCart.getTotalCount();
        }

        if (items.length === 0) {
          if (emptyState) emptyState.style.display = 'block';
          if (filledState) filledState.style.display = 'none';
          return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (filledState) filledState.style.display = 'grid';

        // Render Items list (NO PRICES)
        cartContainer.innerHTML = items.map(item => {
          let variantTags = [];
          if (item.selectedShade) variantTags.push(`<span>Shade: <strong>${item.selectedShade}</strong></span>`);
          if (item.selectedColor) variantTags.push(`<span>Color: <strong>${item.selectedColor}</strong></span>`);
          if (item.selectedSize) variantTags.push(`<span>Size: <strong>${item.selectedSize}</strong></span>`);
          if (item.selectedVariant) variantTags.push(`<span>Variant: <strong>${item.selectedVariant}</strong></span>`);

          return `
            <div class="cart-item-row" data-cart-id="${item.cartItemId}">
              <div class="cart-item-thumb">
                <img src="${item.primaryImage}" alt="${item.name}" onerror="this.onerror=null; this.src='assets/products/placeholder.svg';">
              </div>
              <div class="cart-item-details">
                <div class="cart-item-brand">${item.brand}</div>
                <h4 class="cart-item-title"><a href="product.html?id=${encodeURIComponent(item.id)}">${item.name}</a></h4>
                <div class="cart-item-variant">${variantTags.join(' &bull; ') || '<span class="text-muted">Standard Authentic Edition</span>'}</div>
                ${item.notes ? `<div class="cart-item-notes"><i class="fas fa-sticky-note"></i> Note: ${item.notes}</div>` : ''}
              </div>
              <div class="cart-item-controls">
                <div class="quantity-control" style="height: 40px;">
                  <button type="button" class="btn-qty btn-cart-minus" data-id="${item.cartItemId}"><i class="fas fa-minus" style="font-size: 0.75rem;"></i></button>
                  <input type="text" class="qty-display-input" value="${item.quantity}" readonly style="width: 32px; font-size: 0.85rem;">
                  <button type="button" class="btn-qty btn-cart-plus" data-id="${item.cartItemId}"><i class="fas fa-plus" style="font-size: 0.75rem;"></i></button>
                </div>
                <button type="button" class="btn-remove-item" data-id="${item.cartItemId}" title="Remove item">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');

        // Attach listeners
        cartContainer.querySelectorAll('.btn-cart-minus').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = items.find(i => i.cartItemId === id);
            if (item) window.GlamoraCart.updateQuantity(id, item.quantity - 1);
          });
        });

        cartContainer.querySelectorAll('.btn-cart-plus').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = items.find(i => i.cartItemId === id);
            if (item) window.GlamoraCart.updateQuantity(id, item.quantity + 1);
          });
        });

        cartContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            window.GlamoraCart.removeItem(id);
          });
        });
      };

      // Initial render & subscribe to updates
      renderCart();
      window.addEventListener('glamora:cartUpdated', renderCart);

      // Clear cart button
      document.getElementById('btn-clear-entire-cart')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your shopping bag?')) {
          window.GlamoraCart.clearCart();
        }
      });

      // Preferences (Gift & Instructions)
      const giftCheckbox = document.getElementById('cart-gift-wrap-toggle');
      const orderNotesInput = document.getElementById('cart-general-notes');

      if (giftCheckbox) {
        giftCheckbox.checked = window.GlamoraCart.prefs.isGift || false;
        giftCheckbox.addEventListener('change', () => {
          window.GlamoraCart.savePrefs({ isGift: giftCheckbox.checked });
        });
      }

      if (orderNotesInput) {
        orderNotesInput.value = window.GlamoraCart.prefs.generalNotes || '';
        orderNotesInput.addEventListener('input', () => {
          window.GlamoraCart.savePrefs({ generalNotes: orderNotesInput.value });
        });
      }
    }

    /**
     * CHECKOUT PAGE INITIALIZATION (checkout.html)
     */
    initCheckoutPage() {
      const checkoutForm = document.getElementById('checkout-order-form');
      if (!checkoutForm) return;

      const items = window.GlamoraCart.getItems();
      if (items.length === 0) {
        // Redirect to cart or show empty notification
        const formWrap = document.getElementById('checkout-main-wrap');
        if (formWrap) {
          formWrap.innerHTML = `
            <div class="cart-empty-state">
              <div class="cart-empty-icon"><i class="fas fa-shopping-bag"></i></div>
              <h2>Your Shopping Bag is Empty</h2>
              <p>Please select your beauty essentials before proceeding to WhatsApp checkout.</p>
              <a href="shop.html" class="btn btn-primary btn-lg" style="margin-top: 20px;">Explore Beauty Catalog</a>
            </div>
          `;
        }
        return;
      }

      // Live Order Preview generator
      const previewBox = document.getElementById('whatsapp-preview-content');
      const copyBtn = document.getElementById('btn-copy-order-text');
      const sendWaBtn = document.getElementById('btn-send-whatsapp-order');

      const updatePreview = () => {
        const customer = {
          name: document.getElementById('cust-name')?.value.trim() || '[Your Name]',
          phone: document.getElementById('cust-phone')?.value.trim() || '[Your WhatsApp Number]',
          city: document.getElementById('cust-city')?.value.trim() || '[Your City]',
          address: document.getElementById('cust-address')?.value.trim() || '',
          deliveryInstructions: document.getElementById('cust-instructions')?.value.trim() || ''
        };

        const notes = document.getElementById('cust-notes')?.value.trim() || window.GlamoraCart.prefs.generalNotes || '';
        const isGift = document.getElementById('checkout-gift-toggle')?.checked || window.GlamoraCart.prefs.isGift || false;

        const messageText = window.GlamoraWhatsApp.formatOrderMessage(customer, items, notes, isGift);
        if (previewBox) {
          previewBox.textContent = messageText;
        }
        return { customer, notes, isGift, messageText };
      };

      // Bind input changes to update preview in real-time
      checkoutForm.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
      });

      // Initial preview render
      updatePreview();

      // Copy Order Text Button
      copyBtn?.addEventListener('click', async () => {
        const { messageText } = updatePreview();
        try {
          await window.GlamoraWhatsApp.copyToClipboard(messageText);
          if (window.GlamoraApp) window.GlamoraApp.showToast('Order details copied to clipboard!', 'success');
        } catch (e) {
          alert('Could not copy automatically. You can copy the text manually from the preview box.');
        }
      });

      // Form Submission -> Send on WhatsApp
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('cust-name');
        const phoneInput = document.getElementById('cust-phone');
        const cityInput = document.getElementById('cust-city');

        if (!nameInput.value.trim()) {
          alert('Please enter your full name.');
          nameInput.focus();
          return;
        }

        if (!phoneInput.value.trim()) {
          alert('Please enter your WhatsApp contact number.');
          phoneInput.focus();
          return;
        }

        if (!cityInput.value.trim()) {
          alert('Please select or specify your delivery city in Pakistan.');
          cityInput.focus();
          return;
        }

        const { messageText } = updatePreview();
        const waUrl = window.GlamoraWhatsApp.buildWhatsAppUrl(messageText);

        // Open WhatsApp in new tab / window
        window.open(waUrl, '_blank');

        // Show confirmation view without clearing cart immediately (preserves user order if WA cancelled)
        const confirmationSection = document.getElementById('checkout-confirmation-view');
        const formSection = document.getElementById('checkout-form-view');

        if (confirmationSection && formSection) {
          formSection.style.display = 'none';
          confirmationSection.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      // Final Clear Cart option after successful submission
      document.getElementById('btn-order-complete-clear')?.addEventListener('click', () => {
        window.GlamoraCart.clearCart();
        window.location.href = 'index.html';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.GlamoraCheckout = new CheckoutManager();
  });
})(window);
