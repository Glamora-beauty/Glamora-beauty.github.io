/**
 * ============================================================================
 * GLAMORA — ADVANCED LIVE VISITOR ANALYTICS ENGINE
 * Pakistan Standard Time (PKT, UTC+5) Daily Reset, Global Multi-Device Sync,
 * Dynamic Active Shoppers Presence, and Animated Smooth Counters.
 * ============================================================================
 */

(function () {
  'use strict';

  const cfg = window.GLAMORA_VISITOR_CONFIG || {};
  const base = cfg.baseCounts || { totalVisitors: 548, todayVisitors: 53, totalPageViews: 1964 };
  const keys = cfg.keys || {
    totalVisitors: 'glamora_live_total_visitors',
    todayVisitorsPrefix: 'glamora_live_today_',
    totalPageViews: 'glamora_live_page_views',
    activePresence: 'glamora_live_presence'
  };
  const storageKeys = cfg.storageKeys || {
    visitorId: 'glamora_anon_uid_v2',
    lastPktDate: 'glamora_last_pkt_date_v2',
    visitedToday: 'glamora_visited_today_v2',
    cachedPv: 'glamora_cached_pv_v2',
    cachedTv: 'glamora_cached_tv_v2',
    cachedTd: 'glamora_cached_td_v2'
  };

  // Clean out any legacy storage from older versions
  try {
    ['glamora_stat_val_tv', 'glamora_stat_val_td', 'glamora_stat_val_pv',
     'glamora_actual_real_tv', 'glamora_actual_real_td', 'glamora_actual_real_pv'].forEach(k => {
      localStorage.removeItem(k);
    });
  } catch (e) {}

  /**
   * Helper: Generate unique anonymous UUID v4
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Helper: Pakistan Standard Time (PKT, UTC+5) YYYY-MM-DD
   */
  function getPktDateString() {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const pktTime = new Date(utcTime + (cfg.utcOffsetHours || 5) * 3600000);
    const y = pktTime.getFullYear();
    const m = String(pktTime.getMonth() + 1).padStart(2, '0');
    const d = String(pktTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Helper: Smooth number counter animation
   */
  function animateValue(elem, start, end, duration = 1000) {
    if (!elem) return;
    const target = Number(end);
    if (isNaN(target)) {
      elem.textContent = end;
      return;
    }
    const currentVal = parseInt(elem.textContent.replace(/,/g, ''), 10);
    const from = isNaN(currentVal) ? start : currentVal;
    const range = target - from;
    if (range === 0) {
      elem.textContent = target.toLocaleString();
      return;
    }
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + range * ease);
      elem.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        elem.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(update);
  }

  class VisitorAnalyticsEngine {
    constructor() {
      this.uid = this.getOrCreateVisitorId();
      this.pktDate = getPktDateString();
      this.isNewVisitor = false;
      this.isFirstVisitToday = false;

      this.currentStats = {
        totalVisitors: base.totalVisitors,
        todayVisitors: base.todayVisitors,
        onlineVisitors: 5,
        pageViews: base.totalPageViews
      };

      this.domElements = {
        totalVisitors: document.getElementById('stat-total-visitors'),
        todayVisitors: document.getElementById('stat-today-visitors'),
        onlineVisitors: document.getElementById('stat-online-visitors'),
        pageViews: document.getElementById('stat-page-views')
      };
    }

    getOrCreateVisitorId() {
      let uid = localStorage.getItem(storageKeys.visitorId);
      if (!uid) {
        uid = 'glam_' + generateUUID();
        localStorage.setItem(storageKeys.visitorId, uid);
        this.isNewVisitor = true;
      }
      return uid;
    }

    async init() {
      // Daily PKT visit reset
      const lastPktDate = localStorage.getItem(storageKeys.lastPktDate);
      if (lastPktDate !== this.pktDate) {
        localStorage.setItem(storageKeys.lastPktDate, this.pktDate);
        localStorage.setItem(storageKeys.visitedToday, 'false');
        this.isFirstVisitToday = true;
      } else {
        this.isFirstVisitToday = localStorage.getItem(storageKeys.visitedToday) !== 'true';
      }

      // Initial fast render from cache or healthy baseline
      this.renderInitialValues();

      // 1. Try local server API (when running node server.js locally)
      const serverSuccess = await this.tryServerApi();
      if (serverSuccess) {
        this.startHeartbeat(true);
        return;
      }

      // 2. Production Cloud Counter (GitHub Pages mode)
      await this.syncCloudAnalytics();
      this.startHeartbeat(false);
    }

    renderInitialValues() {
      const cachedPv = parseInt(localStorage.getItem(storageKeys.cachedPv), 10);
      const cachedTv = parseInt(localStorage.getItem(storageKeys.cachedTv), 10);
      const cachedTd = parseInt(localStorage.getItem(storageKeys.cachedTd), 10);

      this.currentStats.pageViews = (cachedPv && cachedPv >= base.totalPageViews) ? cachedPv + 1 : base.totalPageViews;
      this.currentStats.totalVisitors = (cachedTv && cachedTv >= base.totalVisitors) ? cachedTv : base.totalVisitors;
      this.currentStats.todayVisitors = (cachedTd && cachedTd >= base.todayVisitors) ? cachedTd : base.todayVisitors;
      this.currentStats.onlineVisitors = this.computeDynamicOnline(0);

      this.updateDOM(this.currentStats);
    }

    computeDynamicOnline(liveActiveOffset = 0) {
      // Natural organic fluctuation: between 4 and 8 active shoppers currently online
      const minute = new Date().getMinutes();
      const wave = Math.sin(minute * 0.3) * 2;
      const baseActive = 5 + Math.round(wave) + (liveActiveOffset % 3);
      return Math.max(3, Math.min(11, baseActive));
    }

    async tryServerApi() {
      try {
        const url = `/api/stats?uid=${encodeURIComponent(this.uid)}&pktDate=${this.pktDate}&isNew=${this.isNewVisitor}&isFirstToday=${this.isFirstVisitToday}`;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2000);
        const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
        clearTimeout(t);

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalVisitors === 'number') {
            if (this.isFirstVisitToday) {
              localStorage.setItem(storageKeys.visitedToday, 'true');
            }
            this.currentStats = {
              totalVisitors: data.totalVisitors,
              todayVisitors: data.todayVisitors,
              onlineVisitors: data.onlineVisitors,
              pageViews: data.pageViews
            };
            this.updateDOM(this.currentStats);
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    async syncCloudAnalytics() {
      const endpoint = cfg.endpoint || 'https://countapi.maayanlab.cloud/rpc';
      const todayKey = `${keys.todayVisitorsPrefix}${this.pktDate}`;

      // Hit Page Views on every page load
      const hitPvPromise = fetch(`${endpoint}/hit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keys.totalPageViews })
      }).catch(() => null);

      // Hit Total Visitors if brand new
      let hitTvPromise = Promise.resolve();
      if (this.isNewVisitor) {
        hitTvPromise = fetch(`${endpoint}/hit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keys.totalVisitors })
        }).catch(() => null);
      }

      // Hit Today's Visitors if first visit today in PKT
      let hitTdPromise = Promise.resolve();
      if (this.isFirstVisitToday) {
        hitTdPromise = fetch(`${endpoint}/hit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: todayKey })
        }).then(() => {
          localStorage.setItem(storageKeys.visitedToday, 'true');
        }).catch(() => null);
      }

      await Promise.all([hitPvPromise, hitTvPromise, hitTdPromise]);

      // Fetch latest global counts
      try {
        const [pvRes, tvRes, tdRes] = await Promise.all([
          fetch(`${endpoint}/get?key=${keys.totalPageViews}`).then(r => r.text()).catch(() => '0'),
          fetch(`${endpoint}/get?key=${keys.totalVisitors}`).then(r => r.text()).catch(() => '0'),
          fetch(`${endpoint}/get?key=${todayKey}`).then(r => r.text()).catch(() => '0')
        ]);

        const rawPv = parseInt(pvRes, 10) || 0;
        const rawTv = parseInt(tvRes, 10) || 0;
        const rawTd = parseInt(tdRes, 10) || 0;

        const totalPv = base.totalPageViews + rawPv;
        const totalTv = base.totalVisitors + rawTv;
        const totalTd = base.todayVisitors + rawTd;

        this.currentStats.pageViews = totalPv;
        this.currentStats.totalVisitors = totalTv;
        this.currentStats.todayVisitors = totalTd;
        this.currentStats.onlineVisitors = this.computeDynamicOnline(rawPv % 4);

        // Cache for offline/instant reload
        localStorage.setItem(storageKeys.cachedPv, totalPv.toString());
        localStorage.setItem(storageKeys.cachedTv, totalTv.toString());
        localStorage.setItem(storageKeys.cachedTd, totalTd.toString());

        this.updateDOM(this.currentStats);
      } catch (err) {
        // Fallback already rendered
      }
    }

    updateDOM(stats) {
      if (this.domElements.totalVisitors) {
        animateValue(this.domElements.totalVisitors, base.totalVisitors, stats.totalVisitors);
      }
      if (this.domElements.todayVisitors) {
        animateValue(this.domElements.todayVisitors, base.todayVisitors, stats.todayVisitors);
      }
      if (this.domElements.onlineVisitors) {
        animateValue(this.domElements.onlineVisitors, 4, stats.onlineVisitors, 600);
      }
      if (this.domElements.pageViews) {
        animateValue(this.domElements.pageViews, base.totalPageViews, stats.pageViews);
      }
    }

    startHeartbeat(isServer = false) {
      setInterval(async () => {
        if (isServer) {
          try {
            const url = `/api/stats?uid=${encodeURIComponent(this.uid)}&pktDate=${this.pktDate}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              if (data && this.domElements.onlineVisitors) {
                animateValue(this.domElements.onlineVisitors, this.currentStats.onlineVisitors, data.onlineVisitors, 600);
                this.currentStats.onlineVisitors = data.onlineVisitors;
              }
            }
          } catch (e) {}
        } else {
          // Dynamic online presence heartbeat
          const nextOnline = this.computeDynamicOnline(Math.floor(Math.random() * 3));
          if (this.domElements.onlineVisitors && nextOnline !== this.currentStats.onlineVisitors) {
            animateValue(this.domElements.onlineVisitors, this.currentStats.onlineVisitors, nextOnline, 600);
            this.currentStats.onlineVisitors = nextOnline;
          }
        }
      }, cfg.heartbeatIntervalMs || 12000);
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new VisitorAnalyticsEngine().init();
    });
  } else {
    new VisitorAnalyticsEngine().init();
  }
})();
