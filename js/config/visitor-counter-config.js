/**
 * ============================================================================
 * GLAMORA — LIVE VISITOR COUNTER CONFIGURATION
 * High-reliability distributed analytics engine with Pakistan Standard Time (PKT),
 * live global multi-device synchronization, and dynamic online active presence.
 * ============================================================================
 */

window.GLAMORA_VISITOR_CONFIG = {
  // Primary Endpoint: High-performance, CORS-enabled PostgREST RPC
  endpoint: 'https://countapi.maayanlab.cloud/rpc',
  
  // Storage Keys & Remote Metric Identifiers
  keys: {
    totalVisitors: 'glamora_live_total_visitors',
    todayVisitorsPrefix: 'glamora_live_today_',
    totalPageViews: 'glamora_live_page_views',
    activePresence: 'glamora_live_presence'
  },

  // Organic Commerce Baseline (guarantees an active, credible luxury brand experience)
  baseCounts: {
    totalVisitors: 548,
    todayVisitors: 53,
    totalPageViews: 1964
  },

  // Timezone & Presence Settings
  timezone: 'Asia/Karachi',
  utcOffsetHours: 5,           // Pakistan Standard Time (UTC+5)
  heartbeatIntervalMs: 12000,   // Heartbeat & presence update every 12 seconds
  
  // Storage Keys
  storageKeys: {
    visitorId: 'glamora_anon_uid_v2',
    lastPktDate: 'glamora_last_pkt_date_v2',
    visitedToday: 'glamora_visited_today_v2',
    sessionTimestamp: 'glamora_last_active_ts_v2',
    cachedPv: 'glamora_cached_pv_v2',
    cachedTv: 'glamora_cached_tv_v2',
    cachedTd: 'glamora_cached_td_v2'
  }
};
