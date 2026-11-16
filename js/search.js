/**
 * ============================================================================
 * GLAMORA — ADVANCED SEARCH ENGINE
 * Instant multi-field search (name, brand, category, shades, keywords),
 * search suggestions, localStorage search history, and trending tags.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const HISTORY_KEY = 'glamora_search_history';
  const MAX_HISTORY = 6;

  const TRENDING_SEARCH_TAGS = [
    'Lipstick',
    'Foundation',
    'Sunscreen',
    'Skin Serum',
    'Makeup Kit',
    'Korean Skincare',
    'Eyeshadow Palette',
    'Mascara',
    'Setting Spray',
    'Face Wash',
    'Blush',
    'Centella'
  ];

  class SearchEngine {
    constructor() {
      this.history = this.loadHistory();
      this.modalOverlay = document.getElementById('search-modal-overlay');
      this.searchInput = document.getElementById('search-modal-input');
      this.clearBtn = document.getElementById('btn-clear-search');
      this.closeBtn = document.getElementById('btn-close-search');
      this.resultsContainer = document.getElementById('search-live-results');
      this.historyContainer = document.getElementById('search-history-chips');
      this.trendingContainer = document.getElementById('search-trending-chips');
      this.debounceTimer = null;

      this.init();
    }

    loadHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    saveHistory(query) {
      if (!query || !query.trim()) return;
      const clean = query.trim();
      this.history = [clean, ...this.history.filter(h => h.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
      } catch (e) {}
      this.renderHistory();
    }

    clearHistory() {
      this.history = [];
      try {
        localStorage.removeItem(HISTORY_KEY);
      } catch (e) {}
      this.renderHistory();
    }

    init() {
      // Open modal triggers
      const openTriggers = document.querySelectorAll('.btn-open-search');
      openTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openModal();
        });
      });

      // Close modal triggers
      this.closeBtn?.addEventListener('click', () => this.closeModal());
      this.modalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal();
        }
      });

      // Keyboard Esc to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modalOverlay?.classList.contains('is-active')) {
          this.closeModal();
        }
      });

      // Clear search button
      this.clearBtn?.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = '';
          this.searchInput.focus();
          this.handleSearchInput('');
        }
      });

      // Clear history button
      document.getElementById('btn-clear-history')?.addEventListener('click', () => {
        this.clearHistory();
      });

      // Input listener
      this.searchInput?.addEventListener('input', (e) => {
        const query = e.target.value;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.handleSearchInput(query);
        }, 200);
      });

      // Enter key submits search to shop.html?search=...
      this.searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = this.searchInput.value.trim();
          if (q) {
            this.saveHistory(q);
            window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
          }
        }
      });

      // Render tags
      this.renderTrendingTags();
      this.renderHistory();
    }

    openModal() {
      if (!this.modalOverlay) return;
      this.modalOverlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.searchInput?.focus(), 100);
    }

    closeModal() {
      if (!this.modalOverlay) return;
      this.modalOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    renderTrendingTags() {
      if (!this.trendingContainer) return;
      this.trendingContainer.innerHTML = TRENDING_SEARCH_TAGS.map(tag => `
        <button type="button" class="search-tag-chip" data-query="${tag}">
          <i class="fas fa-fire-alt" style="color: var(--color-primary); font-size: 0.75rem; margin-right: 4px;"></i>${tag}
        </button>
      `).join('');

      this.trendingContainer.querySelectorAll('.search-tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-query');
          if (this.searchInput) {
            this.searchInput.value = q;
            this.handleSearchInput(q);
          }
        });
      });
    }

    renderHistory() {
      if (!this.historyContainer) return;
      const wrap = document.getElementById('search-history-wrapper');
      if (this.history.length === 0) {
        if (wrap) wrap.style.display = 'none';
        this.historyContainer.innerHTML = '';
        return;
      }

      if (wrap) wrap.style.display = 'block';
      this.historyContainer.innerHTML = this.history.map(item => `
        <button type="button" class="search-tag-chip" data-query="${item}">
          <i class="fas fa-history" style="color: var(--color-charcoal-400); font-size: 0.75rem; margin-right: 4px;"></i>${item}
        </button>
      `).join('');

      this.historyContainer.querySelectorAll('.search-tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-query');
          if (this.searchInput) {
            this.searchInput.value = q;
            this.handleSearchInput(q);
          }
        });
      });
    }

    async handleSearchInput(query) {
      if (!this.resultsContainer) return;
      const q = (query || '').trim().toLowerCase();

      if (!q) {
        this.resultsContainer.innerHTML = '';
        return;
      }

      const all = await window.GlamoraProducts.getAll();
      const matched = all.filter(p => {
        const inName = p.name.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inCat = p.category.toLowerCase().includes(q);
        const inSub = (p.subcategory || '').toLowerCase().includes(q);
        const inDesc = (p.description || '').toLowerCase().includes(q);
        const inShades = (p.shades || []).some(s => s.toLowerCase().includes(q));
        const inColors = (p.colors || []).some(c => c.name.toLowerCase().includes(q));
        return inName || inBrand || inCat || inSub || inDesc || inShades || inColors;
      }).slice(0, 6);

      if (matched.length === 0) {
        this.resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 30px 10px;">
            <p style="font-weight: 600; margin-bottom: 6px;">No beauty products matching "${query}"</p>
            <p class="text-muted" style="font-size: 0.85rem;">Try searching for lipstick, foundation, Korean skincare, or brand names like Huda Beauty or NARS.</p>
          </div>
        `;
        return;
      }

      this.resultsContainer.innerHTML = `
        <div class="search-tags-title">
          <span>Search Results (${matched.length})</span>
          <a href="shop.html?search=${encodeURIComponent(q)}" style="color: var(--color-primary-dark); font-weight: 600; font-size: 0.75rem;">View All &rarr;</a>
        </div>
        <div class="search-results-list">
          ${matched.map(p => `
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="search-result-item" data-id="${p.id}">
              <img src="${p.primaryImage || 'assets/products/placeholder.svg'}" class="search-result-thumb" alt="${p.name}" onerror="this.onerror=null; this.src='assets/products/placeholder.svg';">
              <div class="search-result-info">
                <h4>${p.name}</h4>
                <p>${p.brand} &bull; ${p.subcategory || p.category}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `;

      // Save to history when clicked
      this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          this.saveHistory(q);
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.GlamoraSearch = new SearchEngine();
  });
})(window);
