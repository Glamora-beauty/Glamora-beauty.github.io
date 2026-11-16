/**
 * ============================================================================
 * GLAMORA — MAIN APPLICATION SCRIPT
 * Header scroll state, mobile navigation, toast alerts, global utilities.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const GlamoraApp = {
    init() {
      this.initHeaderScroll();
      this.initMobileNav();
      this.highlightActiveNavLink();
      this.initCurrentYear();
      this.initNewsletter();
      this.initFaqAccordion();
      this.initBrandAlphabetFilter();
      this.initContactForm();
    },

    /**
     * Header background scroll effect
     */
    initHeaderScroll() {
      const header = document.querySelector('.site-header');
      if (!header) return;

      const handleScroll = () => {
        if (window.scrollY > 20) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    },

    /**
     * Mobile Navigation Drawer & Hamburger
     */
    initMobileNav() {
      const toggle = document.querySelector('.mobile-nav-toggle');
      const menu = document.querySelector('.nav-menu');
      const overlay = document.querySelector('.mobile-drawer-overlay');

      if (!toggle || !menu) return;

      const openMenu = () => {
        menu.classList.add('is-active');
        if (overlay) overlay.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      };

      const closeMenu = () => {
        menu.classList.remove('is-active');
        if (overlay) overlay.classList.remove('is-active');
        document.body.style.overflow = '';
      };

      toggle.addEventListener('click', () => {
        if (menu.classList.contains('is-active')) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      overlay?.addEventListener('click', closeMenu);

      menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
    },

    /**
     * Highlight current page nav link
     */
    highlightActiveNavLink() {
      const path = window.location.pathname;
      const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

      document.querySelectorAll('.nav-link, .mobile-bottom-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href === filename || (filename === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });
    },

    /**
     * Set dynamic copyright year in footer
     */
    initCurrentYear() {
      const yearSpan = document.getElementById('footer-year');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    },

    /**
     * Toast notification manager
     */
    showToast(message, type = 'info', duration = 3200) {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast-item toast-${type}`;

      let icon = 'fa-info-circle';
      if (type === 'success') icon = 'fa-check-circle';
      if (type === 'error') icon = 'fa-exclamation-circle';

      toast.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.1rem;"></i>
        <span>${message}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    /**
     * Newsletter updates form
     */
    initNewsletter() {
      const form = document.getElementById('newsletter-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value.trim()) {
          this.showToast('Thank you for connecting with Glamora updates!', 'success');
          emailInput.value = '';
        }
      });
    },

    /**
     * FAQ Accordion Expand/Collapse
     */
    initFaqAccordion() {
      const faqItems = document.querySelectorAll('.faq-accordion-item');
      faqItems.forEach(item => {
        const btn = item.querySelector('.faq-header-btn');
        btn?.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          // Close others
          faqItems.forEach(other => other.classList.remove('is-open'));
          if (!isOpen) {
            item.classList.add('is-open');
          }
        });
      });
    },

    /**
     * Brands alphabetical filter
     */
    initBrandAlphabetFilter() {
      const alphaBtns = document.querySelectorAll('.alpha-letter-btn');
      const brandCards = document.querySelectorAll('.brand-directory-card');
      if (alphaBtns.length === 0 || brandCards.length === 0) return;

      alphaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          alphaBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const letter = btn.getAttribute('data-letter').toUpperCase();

          brandCards.forEach(card => {
            const brandLetter = card.getAttribute('data-letter')?.toUpperCase();
            if (letter === 'ALL' || brandLetter === letter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    },

    /**
     * Contact Page Form
     */
    initContactForm() {
      const contactForm = document.getElementById('glamora-contact-form');
      if (!contactForm) return;

      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name')?.value.trim();
        const phone = document.getElementById('contact-phone')?.value.trim();
        const subject = document.getElementById('contact-subject')?.value.trim();
        const message = document.getElementById('contact-message')?.value.trim();

        if (!name || !phone || !message) {
          alert('Please fill out all required contact fields.');
          return;
        }

        const msgLines = [
          '✨ *GLAMORA — CUSTOMER INQUIRY* ✨',
          '----------------------------------------',
          `• Name: ${name}`,
          `• Phone / WhatsApp: ${phone}`,
          `• Subject: ${subject || 'General Inquiry'}`,
          '----------------------------------------',
          `Message:\n${message}`,
          '----------------------------------------',
          'Sent via Glamora Contact Concierge'
        ];

        const waUrl = window.GlamoraWhatsApp.buildWhatsAppUrl(msgLines.join('\n'));
        window.open(waUrl, '_blank');
        this.showToast('Message forwarded to Glamora WhatsApp!', 'success');
        contactForm.reset();
      });
    }
  };

  window.GlamoraApp = GlamoraApp;

  document.addEventListener('DOMContentLoaded', () => {
    GlamoraApp.init();
  });
})(window);
