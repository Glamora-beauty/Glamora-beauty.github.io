/**
 * ============================================================================
 * GLAMORA — 100% REAL LIVE VISITOR ANALYTICS ENGINE
 * Pure Actual Values Across All Devices (Zero Fake Offsets / Invented Numbers).
 * Real-Time Multi-Device Sync, Daily PKT Reset, and Rolling Active Presence.
 * ============================================================================
 */

(function () {
  'use strict';

  const cfg = window.GLAMORA_VISITOR_CONFIG || {};
  const endpoint = cfg.endpoint || 'https://countapi.maayanlab.cloud/rpc';
  const keys = cfg.keys || {
    totalVisitors: 'glamora_actual_total_visitors',
    todayVisitorsPrefix: 'glamora_actual_today_',
    totalPageViews: 'glamora_actual_page_views',
    activePresencePrefix: 'glamora_actual_active_'
  };
  const storageKeys = cfg.storageKeys || {
    visitorId: 'glamora_actual_uid',
    lastPktDate: 'glamora_actual_pkt_date',
    visitedTodayPrefix: 'glamora_actual_visited_today_'
  };

  // Clean out legacy mock keys from old versions
  try {
    [
      'glamora_stat_val_tv', 'glamora_stat_val_td', 'glamora_stat_val_pv',
      'glamora_actual_real_tv', 'glamora_actual_real_td', 'glamora_actual_real_pv',
      'glamora_cached_pv_v2', 'glamora_cached_tv_v2', 'glamora_cached_td_v2',
      'glamora_anon_uid_v2', 'glamora_visited_today_v2', 'glamora_last_pkt_date_v2'
    ].forEach(k => localStorage.removeItem(k));
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
   * Helper: Pakistan Standard Time (PKT, UTC+5) Date string: YYYY-MM-DD
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
  function animateValue(elem, targetVal, duration = 800) {
    if (!elem) return;
    const target = Number(targetVal);
    if (isNaN(target)) {
      elem.textContent = targetVal;
      return;
    }
    const currentVal = parseInt(elem.textContent.replace(/,/g, ''), 10);
    const from = isNaN(currentVal) ? 0 : currentVal;
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

  /**
   * Helper: Cloud API Hit (Increment)
   */
  async function hitMetric(key) {
    try {
      const res = await fetch(`${endpoint}/hit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Helper: Cloud API Get (Query count)
   */
  async function getMetric(key) {
    try {
      const res = await fetch(`${endpoint}/get?key=${encodeURIComponent(key)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const text = await res.text();
        const num = parseInt(text, 10);
        return isNaN(num) ? 0 : num;
      }
    } catch (e) {}
    return 0;
  }

  class GlamoraActualVisitorCounter {
    constructor() {
      this.isNewVisitor = false;
      this.uid = this.getOrCreateVisitorId();
      this.pktDate = getPktDateString();
      this.todayKey = `${storageKeys.visitedTodayPrefix}${this.pktDate}`;
      this.isFirstVisitToday = localStorage.getItem(this.todayKey) !== 'true';
      this.lastPingedMinute = null;

      this.dom = {
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
      } else {
        this.isNewVisitor = false;
      }
      return uid;
    }

    async init() {
      // 1. Try local server API first if running locally on localhost:3000
      const serverSuccess = await this.tryServerApi();
      if (serverSuccess) {
        this.startPresenceHeartbeat(true);
        return;
      }

      // 2. Production Cloud API (GitHub Pages & multi-device sync)
      await this.syncActualMetrics();
      this.startPresenceHeartbeat(false);
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
              localStorage.setItem(this.todayKey, 'true');
            }
            this.renderDOM({
              totalVisitors: data.totalVisitors,
              todayVisitors: data.todayVisitors,
              onlineVisitors: data.onlineVisitors,
              pageViews: data.pageViews
            });
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    async syncActualMetrics() {
      const todayCloudKey = `${keys.todayVisitorsPrefix}${this.pktDate}`;
      const currentMinute = Math.floor(Date.now() / 60000);
      const activeMinuteKey = `${keys.activePresencePrefix}${currentMinute}`;

      // A. Increment Page Views on every page load
      const hitPv = hitMetric(keys.totalPageViews);

      // B. Increment Total Visitors if this device is visiting for the first time
      let hitTv = Promise.resolve();
      if (this.isNewVisitor) {
        hitTv = hitMetric(keys.totalVisitors);
      }

      // C. Increment Today's Visitors if this device has not visited yet today (PKT)
      let hitTd = Promise.resolve();
      if (this.isFirstVisitToday) {
        hitTd = hitMetric(todayCloudKey).then(() => {
          localStorage.setItem(this.todayKey, 'true');
        });
      }

      // D. Ping Online Active Presence for this minute slot
      let hitActive = Promise.resolve();
      if (this.lastPingedMinute !== currentMinute) {
        this.lastPingedMinute = currentMinute;
        hitActive = hitMetric(activeMinuteKey);
      }

      // Wait for increments to register
      await Promise.all([hitPv, hitTv, hitTd, hitActive]);

      // E. Fetch the actual live counts from cloud database
      await this.fetchAndRenderCloudStats();
    }

    async fetchAndRenderCloudStats() {
      const todayCloudKey = `${keys.todayVisitorsPrefix}${this.pktDate}`;
      const currentMinute = Math.floor(Date.now() / 60000);
      const prevMinute = currentMinute - 1;

      try {
        const [pvVal, tvVal, tdVal, activeCurrent, activePrev] = await Promise.all([
          getMetric(keys.totalPageViews),
          getMetric(keys.totalVisitors),
          getMetric(todayCloudKey),
          getMetric(`${keys.activePresencePrefix}${currentMinute}`),
          getMetric(`${keys.activePresencePrefix}${prevMinute}`)
        ]);

        // Real active online count across all active devices
        const realOnline = Math.max(1, Math.max(activeCurrent, activePrev));
        const realPv = Math.max(1, pvVal);
        const realTv = Math.max(1, tvVal);
        const realTd = Math.max(1, tdVal);

        this.renderDOM({
          totalVisitors: realTv,
          todayVisitors: realTd,
          onlineVisitors: realOnline,
          pageViews: realPv
        });
      } catch (err) {}
    }

    renderDOM({ totalVisitors, todayVisitors, onlineVisitors, pageViews }) {
      if (this.dom.totalVisitors) animateValue(this.dom.totalVisitors, totalVisitors);
      if (this.dom.todayVisitors) animateValue(this.dom.todayVisitors, todayVisitors);
      if (this.dom.onlineVisitors) animateValue(this.dom.onlineVisitors, onlineVisitors, 400);
      if (this.dom.pageViews) animateValue(this.dom.pageViews, pageViews);
    }

    startPresenceHeartbeat(isLocalServer = false) {
      setInterval(async () => {
        if (isLocalServer) {
          try {
            const url = `/api/stats?uid=${encodeURIComponent(this.uid)}&pktDate=${this.pktDate}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              if (data) {
                this.renderDOM(data);
              }
            }
          } catch (e) {}
        } else {
          // Cloud multi-device presence sync
          const currentMinute = Math.floor(Date.now() / 60000);
          if (this.lastPingedMinute !== currentMinute) {
            this.lastPingedMinute = currentMinute;
            await hitMetric(`${keys.activePresencePrefix}${currentMinute}`);
          }
          await this.fetchAndRenderCloudStats();
        }
      }, cfg.heartbeatIntervalMs || 8000);
    }
  }

  // Initialize immediately on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new GlamoraActualVisitorCounter().init();
    });
  } else {
    new GlamoraActualVisitorCounter().init();
  }
})();
