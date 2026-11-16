/**
 * ============================================================================
 * GLAMORA — WHATSAPP ORDERING & INQUIRY ENGINE
 * Official WhatsApp Number: +92 318 3085519
 * STRICT RULE: ZERO PRICES OR TOTALS GENERATED
 * ============================================================================
 */

(function (window) {
  'use strict';

  const WHATSAPP_PHONE = '923183085519'; // +92 318 3085519 formatted for wa.me

  const GlamoraWhatsApp = {
    /**
     * Format full catalog order into WhatsApp message string
     */
    formatOrderMessage(customer, cartItems, generalNotes = '', isGift = false) {
      let lines = [];
      lines.push('✨ *GLAMORA — NEW ORDER REQUEST* ✨');
      lines.push('----------------------------------------');
      lines.push('*Customer Information:*');
      lines.push(`• *Name:* ${customer.name || 'Not provided'}`);
      lines.push(`• *WhatsApp:* ${customer.phone || 'Not provided'}`);
      lines.push(`• *City:* ${customer.city || 'Not specified'}`);
      if (customer.address) {
        lines.push(`• *Delivery Address:* ${customer.address}`);
      }
      if (customer.deliveryInstructions) {
        lines.push(`• *Delivery Instructions:* ${customer.deliveryInstructions}`);
      }

      lines.push('----------------------------------------');
      lines.push('*ORDER DETAILS:*');

      if (!cartItems || cartItems.length === 0) {
        lines.push('No products specified.');
      } else {
        cartItems.forEach((item, idx) => {
          lines.push(`\n*${idx + 1}. ${item.name}*`);
          lines.push(`   • Brand: ${item.brand || 'Authentic Brand'}`);
          lines.push(`   • Quantity: ${item.quantity || 1}`);

          if (item.selectedColor) {
            lines.push(`   • Color: ${item.selectedColor}`);
          }
          if (item.selectedShade) {
            lines.push(`   • Shade: ${item.selectedShade}`);
          }
          if (item.selectedSize) {
            lines.push(`   • Size: ${item.selectedSize}`);
          }
          if (item.selectedVariant) {
            lines.push(`   • Variant: ${item.selectedVariant}`);
          }
          if (item.notes && item.notes.trim()) {
            lines.push(`   • Special Notes: ${item.notes.trim()}`);
          }
        });
      }

      lines.push('\n----------------------------------------');
      if (isGift) {
        lines.push('🎁 *Gift Wrapping Requested:* Yes, please pack as a gift.');
      }
      if (generalNotes && generalNotes.trim()) {
        lines.push(`*Additional Order Instructions:*\n${generalNotes.trim()}`);
      }

      lines.push('----------------------------------------');
      lines.push('Please confirm product availability and provide the final order details.');
      lines.push('\nThank you for choosing *GLAMORA*!');

      return lines.join('\n');
    },

    /**
     * Build wa.me URL
     */
    buildWhatsAppUrl(messageText) {
      const encoded = encodeURIComponent(messageText);
      return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    },

    /**
     * Quick Single-Product WhatsApp Inquiry URL
     */
    buildProductInquiryUrl(product, selectedOptions = {}) {
      let lines = [];
      lines.push('✨ *GLAMORA — PRODUCT INQUIRY & ORDER* ✨');
      lines.push('----------------------------------------');
      lines.push(`*Product:* ${product.name}`);
      lines.push(`*Brand:* ${product.brand}`);
      lines.push(`*Category:* ${product.category}`);

      if (selectedOptions.shade) {
        lines.push(`*Requested Shade:* ${selectedOptions.shade}`);
      }
      if (selectedOptions.color) {
        lines.push(`*Requested Color:* ${selectedOptions.color}`);
      }
      if (selectedOptions.size) {
        lines.push(`*Requested Size:* ${selectedOptions.size}`);
      }
      if (selectedOptions.quantity) {
        lines.push(`*Quantity:* ${selectedOptions.quantity}`);
      }
      if (selectedOptions.notes) {
        lines.push(`*Customer Note:* ${selectedOptions.notes}`);
      }

      lines.push('----------------------------------------');
      lines.push('Hello Glamora team, I would like to check availability and order this product. Please share details!');

      return this.buildWhatsAppUrl(lines.join('\n'));
    },

    /**
     * Copy text to clipboard safely
     */
    async copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return Promise.resolve();
        } catch (err) {
          document.body.removeChild(textArea);
          return Promise.reject(err);
        }
      }
    }
  };

  window.GlamoraWhatsApp = GlamoraWhatsApp;
})(window);
