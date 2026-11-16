/**
 * ============================================================================
 * GLAMORA — CATALOG FILTERS & SORTING ENGINE
 * Dynamic multi-facet filtering (category, brand, availability, trending, new)
 * Non-price sorting (Popularity, Newest, A-Z, Z-A).
 * STRICT RULE: ZERO PRICE SORTING OR PRICE FILTERING.
 * ============================================================================
 */

(function (window) {
  'use strict';

  class CatalogFilterManager {
    constructor() {
      this.allProducts = [];
      this.filteredProducts = [];
      this.activeFilters = {
        categories: new Set(),
        brands: new Set(),
        availability: new Set(),
        trendingOnly: false,
        newOnly: false,
        searchQuery: '',
        sortBy: 'popularity'
      };

      this.gridContainer = document.getElementById('catalog-products-grid');
      this.countDisplay = document.getElementById('catalog-results-count');
      this.activeTagsContainer = document.getElementById('active-filter-tags');
      this.sortDropdown = document.getElementById('catalog-sort-select');

      this.init();
    }

    async init() {
      if (!this.gridContainer) return;

      this.allProducts = await window.GlamoraProducts.getAll();
      this.parseUrlParameters();
      this.populateSidebarFilters();
      this.bindEvents();
      this.applyFilters();
    }

    parseUrlParameters() {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      const brandParam = params.get('brand');
      const searchParam = params.get('search');
      const trendingParam = params.get('trending');
      const newParam = params.get('new');

      if (categoryParam) {
        this.activeFilters.categories.add(categoryParam.toLowerCase());
      }
      if (brandParam) {
        this.activeFilters.brands.add(brandParam.toLowerCase());
      }
      if (searchParam) {
        this.activeFilters.searchQuery = searchParam.trim();
      }
      if (trendingParam === 'true') {
        this.activeFilters.trendingOnly = true;
      }
      if (newParam === 'true') {
        this.activeFilters.newOnly = true;
      }
    }

    async populateSidebarFilters() {
      const categories = await window.GlamoraProducts.getCategories();
      const brands = await window.GlamoraProducts.getBrands();

      // Populate Category Checkboxes
      const catList = document.getElementById('filter-category-list');
      if (catList) {
        catList.innerHTML = categories.map(cat => {
          const count = this.allProducts.filter(p => p.category.toLowerCase() === cat.id.toLowerCase()).length;
          const isChecked = this.activeFilters.categories.has(cat.id.toLowerCase());
          return `
            <label class="filter-checkbox-item">
              <span>
                <input type="checkbox" name="filter-category" value="${cat.id}" ${isChecked ? 'checked' : ''}>
                ${cat.name}
              </span>
              <span class="filter-item-count">(${count})</span>
            </label>
          `;
        }).join('');
      }

      // Populate Brand Checkboxes
      const brandList = document.getElementById('filter-brand-list');
      if (brandList) {
        // Sort brands by name
        const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
        brandList.innerHTML = sortedBrands.map(b => {
          const count = this.allProducts.filter(p => p.brandSlug === b.slug || p.brand.toLowerCase() === b.slug.toLowerCase()).length;
          if (count === 0) return '';
          const isChecked = this.activeFilters.brands.has(b.slug.toLowerCase());
          return `
            <label class="filter-checkbox-item">
              <span>
                <input type="checkbox" name="filter-brand" value="${b.slug}" ${isChecked ? 'checked' : ''}>
                ${b.name}
              </span>
              <span class="filter-item-count">(${count})</span>
            </label>
          `;
        }).join('');
      }
    }

    bindEvents() {
      // Category Checkbox Changes
      document.getElementById('filter-category-list')?.addEventListener('change', (e) => {
        if (e.target.name === 'filter-category') {
          if (e.target.checked) {
            this.activeFilters.categories.add(e.target.value.toLowerCase());
          } else {
            this.activeFilters.categories.delete(e.target.value.toLowerCase());
          }
          this.applyFilters();
        }
      });

      // Brand Checkbox Changes
      document.getElementById('filter-brand-list')?.addEventListener('change', (e) => {
        if (e.target.name === 'filter-brand') {
          if (e.target.checked) {
            this.activeFilters.brands.add(e.target.value.toLowerCase());
          } else {
            this.activeFilters.brands.delete(e.target.value.toLowerCase());
          }
          this.applyFilters();
        }
      });

      // Availability Checkbox Changes
      document.getElementById('filter-avail-list')?.addEventListener('change', (e) => {
        if (e.target.name === 'filter-avail') {
          if (e.target.checked) {
            this.activeFilters.availability.add(e.target.value);
          } else {
            this.activeFilters.availability.delete(e.target.value);
          }
          this.applyFilters();
        }
      });

      // Sort Dropdown
      this.sortDropdown?.addEventListener('change', (e) => {
        this.activeFilters.sortBy = e.target.value;
        this.applyFilters();
      });

      // Reset All Filters
      document.querySelectorAll('.btn-reset-filters').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.resetAll();
        });
      });
    }

    resetAll() {
      this.activeFilters.categories.clear();
      this.activeFilters.brands.clear();
      this.activeFilters.availability.clear();
      this.activeFilters.trendingOnly = false;
      this.activeFilters.newOnly = false;
      this.activeFilters.searchQuery = '';
      this.activeFilters.sortBy = 'popularity';

      // Uncheck all checkboxes
      document.querySelectorAll('.filter-checkbox-item input').forEach(input => input.checked = false);
      if (this.sortDropdown) this.sortDropdown.value = 'popularity';

      this.applyFilters();
    }

    applyFilters() {
      let results = [...this.allProducts];

      // 1. Search Query
      if (this.activeFilters.searchQuery) {
        const q = this.activeFilters.searchQuery.toLowerCase();
        results = results.filter(p => {
          return p.name.toLowerCase().includes(q) ||
                 p.brand.toLowerCase().includes(q) ||
                 p.category.toLowerCase().includes(q) ||
                 (p.subcategory || '').toLowerCase().includes(q) ||
                 (p.description || '').toLowerCase().includes(q) ||
                 (p.shades || []).some(s => s.toLowerCase().includes(q));
        });
      }

      // 2. Categories
      if (this.activeFilters.categories.size > 0) {
        results = results.filter(p => this.activeFilters.categories.has(p.category.toLowerCase()));
      }

      // 3. Brands
      if (this.activeFilters.brands.size > 0) {
        results = results.filter(p => this.activeFilters.brands.has(p.brandSlug.toLowerCase()) || this.activeFilters.brands.has(p.brand.toLowerCase()));
      }

      // 4. Availability
      if (this.activeFilters.availability.size > 0) {
        results = results.filter(p => this.activeFilters.availability.has(p.availability));
      }

      // 5. Trending Only
      if (this.activeFilters.trendingOnly) {
        results = results.filter(p => p.trending);
      }

      // 6. New Only
      if (this.activeFilters.newOnly) {
        results = results.filter(p => p.newArrival);
      }

      // 7. Sorting (STRICTLY NO PRICE SORTING)
      switch (this.activeFilters.sortBy) {
        case 'newest':
          results.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
          break;
        case 'alpha-asc':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'alpha-desc':
          results.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'popularity':
        default:
          results.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
          break;
      }

      this.filteredProducts = results;
      this.render();
    }

    render() {
      // 1. Render Results Count
      if (this.countDisplay) {
        this.countDisplay.innerHTML = `Showing <strong>${this.filteredProducts.length}</strong> of <strong>${this.allProducts.length}</strong> beauty products`;
      }

      // 2. Render Active Tags
      this.renderActiveTags();

      // 3. Render Product Cards Grid
      window.GlamoraProducts.renderGrid(this.filteredProducts, this.gridContainer);
    }

    renderActiveTags() {
      if (!this.activeTagsContainer) return;
      let tags = [];

      if (this.activeFilters.searchQuery) {
        tags.push({ label: `Search: "${this.activeFilters.searchQuery}"`, type: 'search' });
      }
      this.activeFilters.categories.forEach(cat => {
        tags.push({ label: `Category: ${cat}`, type: 'cat', value: cat });
      });
      this.activeFilters.brands.forEach(b => {
        tags.push({ label: `Brand: ${b}`, type: 'brand', value: b });
      });
      this.activeFilters.availability.forEach(av => {
        tags.push({ label: `Stock: ${av}`, type: 'avail', value: av });
      });
      if (this.activeFilters.trendingOnly) {
        tags.push({ label: 'Trending Only', type: 'trending' });
      }
      if (this.activeFilters.newOnly) {
        tags.push({ label: 'New Arrivals Only', type: 'new' });
      }

      if (tags.length === 0) {
        this.activeTagsContainer.innerHTML = '';
        return;
      }

      this.activeTagsContainer.innerHTML = tags.map(tag => `
        <span class="active-filter-tag">
          ${tag.label}
          <span class="btn-remove-tag" data-tag-type="${tag.type}" data-tag-val="${tag.value || ''}">&times;</span>
        </span>
      `).join('');

      this.activeTagsContainer.querySelectorAll('.btn-remove-tag').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-tag-type');
          const val = btn.getAttribute('data-tag-val');

          if (type === 'search') this.activeFilters.searchQuery = '';
          if (type === 'cat') {
            this.activeFilters.categories.delete(val);
            const input = document.querySelector(`input[name="filter-category"][value="${val}"]`);
            if (input) input.checked = false;
          }
          if (type === 'brand') {
            this.activeFilters.brands.delete(val);
            const input = document.querySelector(`input[name="filter-brand"][value="${val}"]`);
            if (input) input.checked = false;
          }
          if (type === 'avail') {
            this.activeFilters.availability.delete(val);
            const input = document.querySelector(`input[name="filter-avail"][value="${val}"]`);
            if (input) input.checked = false;
          }
          if (type === 'trending') this.activeFilters.trendingOnly = false;
          if (type === 'new') this.activeFilters.newOnly = false;

          this.applyFilters();
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.GlamoraCatalogFilters = new CatalogFilterManager();
  });
})(window);
