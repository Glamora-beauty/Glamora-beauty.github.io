/**
 * ============================================================================
 * GLAMORA — LIVE VISITOR ANALYTICS CONFIGURATION
 * 100% Actual Global Multi-Device Real Values (Zero Fake Baseline Offsets).
 * Synchronized live via CORS-enabled high-speed PostgREST cloud database.
 * ============================================================================
 */

window.GLAMORA_VISITOR_CONFIG = {
  // Production Cloud RPC Endpoint (CORS enabled, real-time shared database)
  endpoint: 'https://countapi.maayanlab.cloud/rpc',

  // Metric Keys (Clean keys for 100% actual counts)
  keys: {
    totalVisitors: 'glamora_actual_total_visitors',
    todayVisitorsPrefix: 'glamora_actual_today_',
    totalPageViews: 'glamora_actual_page_views',
    activePresencePrefix: 'glamora_actual_active_'
  },

  // Timezone & Presence Settings
  timezone: 'Asia/Karachi',
  utcOffsetHours: 5,           // Pakistan Standard Time (PKT, UTC+5)
  heartbeatIntervalMs: 8000,    // 8-second presence & sync interval for instant multi-device feedback

  // Local Storage Keys
  storageKeys: {
    visitorId: 'glamora_actual_uid',
    lastPktDate: 'glamora_actual_pkt_date',
    visitedTodayPrefix: 'glamora_actual_visited_today_'
  }
};
