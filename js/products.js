/**
 * ============================================================================
 * GLAMORA — PRODUCTS & CATALOG ENGINE
 * Catalog data loader, product card generator, product details page renderer.
 * STRICT ENFORCEMENT: NEVER DISPLAY PRODUCT PRICES OR FAKE BADGES.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const GlamoraProducts = {
    productsCache: null,
    categoriesCache: null,
    brandsCache: null,

    /**
     * Load all products data
     */
    async getAll() {
      if (this.productsCache) return this.productsCache;
      try {
        const res = await fetch('data/products.json');
        if (!res.ok) throw new Error('Failed to load products');
        this.productsCache = await res.json();
        return this.productsCache;
      } catch (err) {
        console.error('Error loading products.json:', err);
        return [];
      }
    },

    /**
     * Load all categories data
     */
    async getCategories() {
      if (this.categoriesCache) return this.categoriesCache;
      try {
        const res = await fetch('data/categories.json');
        if (!res.ok) throw new Error('Failed to load categories');
        this.categoriesCache = await res.json();
        return this.categoriesCache;
      } catch (err) {
        console.error('Error loading categories.json:', err);
        return [];
      }
    },

    /**
     * Load all brands data
     */
    async getBrands() {
      if (this.brandsCache) return this.brandsCache;
      try {
        const res = await fetch('data/brands.json');
        if (!res.ok) throw new Error('Failed to load brands');
        this.brandsCache = await res.json();
        return this.brandsCache;
      } catch (err) {
        console.error('Error loading brands.json:', err);
        return [];
      }
    },

    /**
     * Get single product by ID
     */
    async getById(id) {
      const all = await this.getAll();
      return all.find(p => p.id === id) || null;
    },

    /**
     * Get trending products
     */
    async getTrending(limit = 8) {
      const all = await this.getAll();
      const filtered = all.filter(p => p.trending);
      return limit ? filtered.slice(0, limit) : filtered;
    },

    /**
     * Get new arrival products
     */
    async getNewArrivals(limit = 8) {
      const all = await this.getAll();
      const filtered = all.filter(p => p.newArrival);
      return limit ? filtered.slice(0, limit) : filtered;
    },

    /**
     * Get products by category
     */
    async getByCategory(categorySlug) {
      const all = await this.getAll();
      return all.filter(p => p.category.toLowerCase() === categorySlug.toLowerCase());
    },

    /**
     * Get products by brand
     */
    async getByBrand(brandSlug) {
      const all = await this.getAll();
      return all.filter(p => p.brandSlug === brandSlug || p.brand.toLowerCase() === brandSlug.toLowerCase());
    },

    /**
     * Generate HTML for standard product card (NO PRICES ALLOWED)
     */
    renderProductCard(product) {
      // Badges
      let badgesHtml = '';
      if (product.trending) {
        badgesHtml += '<span class="product-badge badge-trending">Trending</span>';
      }
      if (product.newArrival) {
        badgesHtml += '<span class="product-badge badge-new">New</span>';
      }

      // Availability badge
      let availHtml = '';
      if (product.availability === 'in_stock') {
        availHtml = '<span class="badge-availability avail-in-stock"><i class="fas fa-check-circle"></i> Available</span>';
      } else if (product.availability === 'low_stock') {
        availHtml = '<span class="badge-availability avail-low-stock"><i class="fas fa-clock"></i> Low Stock</span>';
      } else if (product.availability === 'pre_order') {
        availHtml = '<span class="badge-availability avail-pre-order"><i class="fas fa-calendar-alt"></i> Pre-Order</span>';
      }

      // Swatch preview
      let swatchPreviewHtml = '';
      if (product.colors && product.colors.length > 0) {
        const dots = product.colors.slice(0, 4).map(c => 
          `<span class="swatch-dot" style="background-color: ${c.hex};" title="${c.name}"></span>`
        ).join('');
        const extraCount = product.colors.length > 4 ? `<span class="swatch-count-tag">+${product.colors.length - 4}</span>` : '';
        swatchPreviewHtml = `
          <div class="swatch-preview-list">
            ${dots}
            ${extraCount}
          </div>
        `;
      } else if (product.shades && product.shades.length > 0) {
        swatchPreviewHtml = `<span class="swatch-count-tag">${product.shades.length} Shades</span>`;
      } else {
        swatchPreviewHtml = `<span class="swatch-count-tag"><i class="fas fa-sparkles"></i> Authentic</span>`;
      }

      const imgPath = product.primaryImage || 'assets/products/placeholder.svg';
      const encodedId = encodeURIComponent(product.id);

      return `
        <div class="product-card" data-product-id="${product.id}" data-category="${product.category}" data-brand="${product.brandSlug}">
          <div class="product-card-media">
            <div class="product-badge-group">
              ${badgesHtml}
            </div>
            ${availHtml}
            <a href="product.html?id=${encodedId}" aria-label="View ${product.name}">
              <img src="${imgPath}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='assets/products/placeholder.svg';">
            </a>
            <div class="product-card-actions">
              <button type="button" class="btn-card-quick btn-card-cart btn-quick-add" data-id="${product.id}">
                <i class="fas fa-shopping-bag"></i> Add
              </button>
              <button type="button" class="btn-card-quick btn-card-whatsapp btn-quick-whatsapp" data-id="${product.id}">
                <i class="fab fa-whatsapp"></i> Order
              </button>
            </div>
          </div>
          <div class="product-card-content">
            <div class="product-card-brand">${product.brand}</div>
            <h3 class="product-card-title">
              <a href="product.html?id=${encodedId}">${product.name}</a>
            </h3>
            <p class="product-card-desc">${product.shortDescription || ''}</p>
            <div class="product-card-meta">
              ${swatchPreviewHtml}
              <span class="product-card-cat-tag">${product.subcategory || product.category}</span>
            </div>
            <div class="product-card-footer">
              <a href="product.html?id=${encodedId}" class="btn btn-secondary btn-sm">Details</a>
              <button type="button" class="btn btn-primary btn-sm btn-quick-add" data-id="${product.id}">
                <i class="fas fa-shopping-bag"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Render a grid of product cards
     */
    renderGrid(products, containerElement) {
      if (!containerElement) return;
      if (!products || products.length === 0) {
        containerElement.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-search" style="font-size: 2.5rem; color: var(--color-charcoal-400); margin-bottom: 16px;"></i>
            <h3>No products found</h3>
            <p class="text-muted">Try adjusting your filters or search keywords.</p>
          </div>
        `;
        return;
      }

      containerElement.innerHTML = products.map(p => this.renderProductCard(p)).join('');
      this.attachQuickActions(containerElement);
    },

    /**
     * Attach click listeners for quick cart & quick whatsapp ordering
     */
    attachQuickActions(containerElement) {
      const addBtns = containerElement.querySelectorAll('.btn-quick-add');
      addBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const product = await this.getById(id);
          if (product && window.GlamoraCart) {
            window.GlamoraCart.addItem(product, 1, {
              selectedColor: product.colors?.[0]?.name || null,
              selectedShade: product.shades?.[0] || null,
              selectedSize: product.sizes?.[0] || null,
              selectedVariant: product.variants?.[0] || null
            });
          }
        });
      });

      const waBtns = containerElement.querySelectorAll('.btn-quick-whatsapp');
      waBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const product = await this.getById(id);
          if (product && window.GlamoraWhatsApp) {
            const url = window.GlamoraWhatsApp.buildProductInquiryUrl(product, {
              shade: product.shades?.[0] || null,
              color: product.colors?.[0]?.name || null,
              quantity: 1
            });
            window.open(url, '_blank');
          }
        });
      });
    },

    /**
     * Initialize Product Details Page
     */
    async initProductDetailsPage() {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      const container = document.getElementById('product-details-container');
      if (!container) return;

      if (!productId) {
        this.renderNotFound(container, 'No product specified.');
        return;
      }

      const product = await this.getById(productId);
      if (!product) {
        this.renderNotFound(container, 'We could not find the beauty product you are looking for.');
        return;
      }

      // Update page title and meta
      document.title = `${product.name} | ${product.brand} — Glamora`;

      // Set Breadcrumbs
      const brandCrumb = document.getElementById('crumb-brand');
      const productCrumb = document.getElementById('crumb-product');
      if (brandCrumb) {
        brandCrumb.textContent = product.brand;
        brandCrumb.href = `shop.html?brand=${product.brandSlug}`;
      }
      if (productCrumb) {
        productCrumb.textContent = product.name;
      }

      // Render Details
      let selectedColor = product.colors?.[0]?.name || null;
      let selectedShade = product.shades?.[0] || null;
      let selectedSize = product.sizes?.[0] || null;
      let selectedVariant = product.variants?.[0] || null;
      let currentQuantity = 1;

      // Gallery Images
      const imagesList = product.images && product.images.length > 0 ? product.images : [product.primaryImage || 'assets/products/placeholder.svg'];
      let thumbsHtml = '';
      if (imagesList.length > 1) {
        thumbsHtml = imagesList.map((img, i) => `
          <button type="button" class="gallery-thumb-btn ${i === 0 ? 'is-active' : ''}" data-img="${img}">
            <img src="${img}" alt="${product.name} view ${i + 1}" onerror="this.onerror=null; this.src='assets/products/placeholder.svg';">
          </button>
        `).join('');
      }

      // Color Swatches
      let colorsSelectorHtml = '';
      if (product.colors && product.colors.length > 0) {
        const swatchButtons = product.colors.map((c, i) => `
          <button type="button" class="swatch-item-btn ${i === 0 ? 'is-selected' : ''}" data-color-name="${c.name}">
            <span class="swatch-color-circle" style="background-color: ${c.hex};"></span>
            <span>${c.name}</span>
          </button>
        `).join('');

        colorsSelectorHtml = `
          <div class="product-option-group">
            <div class="option-group-label">
              <span>Selected Color</span>
              <span class="selected-value-label" id="label-selected-color">${selectedColor}</span>
            </div>
            <div class="swatch-selector-list" id="color-swatch-list">
              ${swatchButtons}
            </div>
          </div>
        `;
      }

      // Shade Pills
      let shadesSelectorHtml = '';
      if (product.shades && product.shades.length > 0) {
        const shadeButtons = product.shades.map((s, i) => `
          <button type="button" class="shade-pill-btn ${i === 0 ? 'is-selected' : ''}" data-shade-name="${s}">
            ${s}
          </button>
        `).join('');

        shadesSelectorHtml = `
          <div class="product-option-group">
            <div class="option-group-label">
              <span>Selected Shade</span>
              <span class="selected-value-label" id="label-selected-shade">${selectedShade}</span>
            </div>
            <div class="shade-pill-list" id="shade-pill-list">
              ${shadeButtons}
            </div>
          </div>
        `;
      }

      // Sizes / Volumes
      let sizesSelectorHtml = '';
      if (product.sizes && product.sizes.length > 0) {
        const sizePills = product.sizes.map((sz, i) => `
          <button type="button" class="shade-pill-btn ${i === 0 ? 'is-selected' : ''}" data-size-name="${sz}">
            ${sz}
          </button>
        `).join('');

        sizesSelectorHtml = `
          <div class="product-option-group">
            <div class="option-group-label">
              <span>Size / Volume</span>
              <span class="selected-value-label" id="label-selected-size">${selectedSize}</span>
            </div>
            <div class="shade-pill-list" id="size-pill-list">
              ${sizePills}
            </div>
          </div>
        `;
      }

      // Specifications table
      let specsRows = '';
      if (product.specifications) {
        for (const [key, value] of Object.entries(product.specifications)) {
          specsRows += `<tr><th>${key}</th><td>${value}</td></tr>`;
        }
      }

      container.innerHTML = `
        <div class="product-detail-grid">
          <!-- Gallery Column -->
          <div class="product-gallery">
            <div class="gallery-main-viewport">
              <img id="main-product-image" class="gallery-main-image" src="${imagesList[0]}" alt="${product.name}" onerror="this.onerror=null; this.src='assets/products/placeholder.svg';">
            </div>
            ${thumbsHtml ? `<div class="gallery-thumbnails-strip">${thumbsHtml}</div>` : ''}
          </div>

          <!-- Info Column -->
          <div class="product-info-col">
            <div class="product-info-brand">
              <i class="fas fa-gem"></i> ${product.brand}
            </div>
            <h1 class="product-info-title">${product.name}</h1>
            
            <div class="product-info-meta-row">
              <span class="product-category-tag">${product.subcategory || product.category}</span>
              ${product.availability === 'in_stock' ? '<span class="badge-availability avail-in-stock"><i class="fas fa-check-circle"></i> In Stock</span>' : ''}
              ${product.trending ? '<span class="product-badge badge-trending">Trending Selection</span>' : ''}
            </div>

            <p class="product-info-desc">${product.description}</p>

            ${colorsSelectorHtml}
            ${shadesSelectorHtml}
            ${sizesSelectorHtml}

            <!-- Quantity Selector -->
            <div class="product-option-group">
              <div class="option-group-label"><span>Quantity</span></div>
              <div class="product-actions-bar">
                <div class="quantity-control">
                  <button type="button" class="btn-qty" id="btn-qty-minus" aria-label="Decrease quantity"><i class="fas fa-minus"></i></button>
                  <input type="text" class="qty-display-input" id="input-qty" value="1" readonly>
                  <button type="button" class="btn-qty" id="btn-qty-plus" aria-label="Increase quantity"><i class="fas fa-plus"></i></button>
                </div>
              </div>
            </div>

            <!-- Customer Customization & Shade Notes -->
            <div class="customer-notes-wrapper">
              <label for="detail-customer-note"><i class="fas fa-feather-alt"></i> Personalized Shade, Tone, or Order Notes:</label>
              <textarea id="detail-customer-note" class="customer-notes-input" placeholder="e.g. Skin undertone preference, preferred gift packaging, or specific shade confirmation request..."></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="product-button-group">
              <button type="button" class="btn btn-primary btn-lg btn-block" id="btn-add-to-cart-detail">
                <i class="fas fa-shopping-bag"></i> Add to Shopping Bag
              </button>
              <button type="button" class="btn btn-whatsapp btn-lg btn-block" id="btn-order-whatsapp-detail">
                <i class="fab fa-whatsapp"></i> Order Directly via WhatsApp
              </button>
            </div>

            <!-- Trust Pillars -->
            <div class="product-guarantee-card">
              <div class="guarantee-item">
                <i class="fas fa-shield-alt"></i>
                <span><strong>100% Genuine Cosmetics:</strong> Hand-inspected authentic brands from authorized distribution channels.</span>
              </div>
              <div class="guarantee-item">
                <i class="fas fa-shipping-fast"></i>
                <span><strong>Nationwide Delivery across Pakistan:</strong> Fast door-to-door delivery with safe packaging.</span>
              </div>
              <div class="guarantee-item">
                <i class="fab fa-whatsapp"></i>
                <span><strong>WhatsApp Confirmation:</strong> Direct assistance on availability, shades, and custom requests.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Specifications & Details Tabs -->
        <div class="product-tabs-wrapper">
          <div class="tab-nav-list">
            <button type="button" class="tab-nav-btn is-active" data-tab="tab-specs">Product Specifications</button>
            <button type="button" class="tab-nav-btn" data-tab="tab-about-brand">About ${product.brand}</button>
            <button type="button" class="tab-nav-btn" data-tab="tab-ordering">WhatsApp Ordering Process</button>
          </div>

          <div class="tab-pane is-active" id="tab-specs">
            <table class="specs-table">
              <tbody>
                <tr><th>Brand</th><td>${product.brand}</td></tr>
                <tr><th>Category</th><td>${product.category.toUpperCase()} &mdash; ${product.subcategory || ''}</td></tr>
                ${specsRows}
                <tr><th>Product Availability</th><td>${product.availability === 'in_stock' ? 'In Stock & Ready for Dispatch' : product.availability}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="tab-pane" id="tab-about-brand">
            <div style="max-width: 760px; line-height: 1.8;">
              <h3 style="margin-bottom: 12px;">The Heritage of ${product.brand}</h3>
              <p>Glamora features authentic beauty collections from genuine brands like ${product.brand}. Every product in our inventory is carefully sourced to ensure that cosmetics lovers in Pakistan receive original, fresh, and properly stored cosmetics.</p>
              <p style="margin-top: 12px; color: var(--color-charcoal-600); font-size: 0.9rem;">
                <em>Disclaimer: Glamora is an independent beauty destination retailing multi-brand cosmetics and does not claim exclusive brand ownership or official manufacturer endorsement unless specified.</em>
              </p>
            </div>
          </div>

          <div class="tab-pane" id="tab-ordering">
            <div style="max-width: 760px; line-height: 1.8;">
              <h3 style="margin-bottom: 12px;">How to Order via WhatsApp (+92 318 3085519)</h3>
              <ol style="list-style: decimal; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                <li>Select your desired shades, tones, or size variations above.</li>
                <li>Click <strong>"Order Directly via WhatsApp"</strong> or add the product to your bag.</li>
                <li>WhatsApp will open with a pre-filled order draft containing your exact product and color selections.</li>
                <li>Our beauty concierge team will confirm live stock availability, delivery timelines, and finalize your shipment.</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Related Products Section -->
        <div style="margin-top: 80px;">
          <div class="section-header-flex">
            <div>
              <span class="subheading">You May Also Admire</span>
              <h2 class="heading-2">Complementary Beauty Essentials</h2>
            </div>
            <a href="shop.html?category=${product.category}" class="view-all-link">View More in ${product.category} <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="product-grid" id="related-products-grid"></div>
        </div>
      `;

      // Thumbnail clicks
      const thumbs = container.querySelectorAll('.gallery-thumb-btn');
      const mainImg = document.getElementById('main-product-image');
      thumbs.forEach(t => {
        t.addEventListener('click', () => {
          thumbs.forEach(other => other.classList.remove('is-active'));
          t.classList.add('is-active');
          const newSrc = t.getAttribute('data-img');
          if (mainImg && newSrc) {
            mainImg.src = newSrc;
          }
        });
      });

      // Swatch color clicks
      const colorBtns = container.querySelectorAll('.swatch-item-btn');
      const colorLabel = document.getElementById('label-selected-color');
      colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          colorBtns.forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          selectedColor = btn.getAttribute('data-color-name');
          if (colorLabel) colorLabel.textContent = selectedColor;
        });
      });

      // Shade clicks
      const shadeBtns = container.querySelectorAll('#shade-pill-list .shade-pill-btn');
      const shadeLabel = document.getElementById('label-selected-shade');
      shadeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          shadeBtns.forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          selectedShade = btn.getAttribute('data-shade-name');
          if (shadeLabel) shadeLabel.textContent = selectedShade;
        });
      });

      // Size clicks
      const sizeBtns = container.querySelectorAll('#size-pill-list .shade-pill-btn');
      const sizeLabel = document.getElementById('label-selected-size');
      sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          sizeBtns.forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          selectedSize = btn.getAttribute('data-size-name');
          if (sizeLabel) sizeLabel.textContent = selectedSize;
        });
      });

      // Quantity buttons
      const qtyInput = document.getElementById('input-qty');
      document.getElementById('btn-qty-minus')?.addEventListener('click', () => {
        if (currentQuantity > 1) {
          currentQuantity--;
          qtyInput.value = currentQuantity;
        }
      });
      document.getElementById('btn-qty-plus')?.addEventListener('click', () => {
        currentQuantity++;
        qtyInput.value = currentQuantity;
      });

      // Tabs switcher
      const tabBtns = container.querySelectorAll('.tab-nav-btn');
      const tabPanes = container.querySelectorAll('.tab-pane');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('is-active'));
          tabPanes.forEach(p => p.classList.remove('is-active'));
          btn.classList.add('is-active');
          const target = btn.getAttribute('data-tab');
          document.getElementById(target)?.classList.add('is-active');
        });
      });

      // Add to Cart Detail Button
      document.getElementById('btn-add-to-cart-detail')?.addEventListener('click', () => {
        const notes = document.getElementById('detail-customer-note')?.value || '';
        if (window.GlamoraCart) {
          window.GlamoraCart.addItem(product, currentQuantity, {
            selectedColor,
            selectedShade,
            selectedSize,
            selectedVariant,
            notes
          });
        }
      });

      // WhatsApp Order Button
      document.getElementById('btn-order-whatsapp-detail')?.addEventListener('click', () => {
        const notes = document.getElementById('detail-customer-note')?.value || '';
        if (window.GlamoraWhatsApp) {
          const url = window.GlamoraWhatsApp.buildProductInquiryUrl(product, {
            shade: selectedShade,
            color: selectedColor,
            size: selectedSize,
            quantity: currentQuantity,
            notes: notes
          });
          window.open(url, '_blank');
        }
      });

      // Load related products
      const relatedGrid = document.getElementById('related-products-grid');
      if (relatedGrid) {
        const allInCategory = await this.getByCategory(product.category);
        const related = allInCategory.filter(p => p.id !== product.id).slice(0, 4);
        this.renderGrid(related, relatedGrid);
      }
    },

    renderNotFound(container, message) {
      container.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-ivory); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--color-charcoal-400);">
            <i class="fas fa-gem"></i>
          </div>
          <h2 class="heading-2" style="margin-bottom: 12px;">Product Unavailable</h2>
          <p class="text-lead" style="margin-bottom: 30px;">${message}</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Browse Complete Collection</a>
        </div>
      `;
    }
  };

  window.GlamoraProducts = GlamoraProducts;
})(window);
