/**
 * ============================================================================
 * GLAMORA — LIVE VISITOR COUNTER CONFIGURATION
 * ============================================================================
 * 
 * Supports two operational modes:
 * 1. "countapi" (Default Zero-Setup Mode):
 *    Uses public CountAPI keyless counters combined with client-side session
 *    deduplication and Pakistan Standard Time (PKT, UTC+5) daily reset logic.
 *    No API keys, setup, or backend server required.
 * 
 * 2. "firebase" (Optional Real-Time Mode):
 *    Uses Google Firebase Realtime Database with atomic transactions,
 *    onDisconnect presence handlers, and server timestamps for 100% accurate
 *    global multi-device presence.
 * 
 * To switch to Firebase mode:
 * Set provider to 'firebase' and provide your project credentials below.
 */

window.GLAMORA_VISITOR_CONFIG = {
  // Provider: 'countapi' or 'firebase'
  provider: 'countapi',

  // CountAPI Configuration (Zero-setup mode)
  countapi: {
    endpoint: 'https://countapi.mileshilliard.com/api/v1',
    namespace: 'glamora-beauty-official',
    keys: {
      totalVisitors: 'total-visitors',
      todayVisitors: 'today-visitors',
      totalPageViews: 'total-page-views'
    }
  },

  // Optional Firebase Realtime Database Configuration
  firebase: {
    apiKey: "",
    authDomain: "glamora-beauty.firebaseapp.com",
    databaseURL: "https://glamora-beauty-default-rtdb.firebaseio.com",
    projectId: "glamora-beauty",
    storageBucket: "glamora-beauty.appspot.com",
    messagingSenderId: "",
    appId: ""
  },

  // Timezone & Presence Settings
  timezone: 'Asia/Karachi', // Pakistan Standard Time (PKT, UTC+5)
  utcOffsetHours: 5,        // UTC + 5 hours for PKT
  heartbeatIntervalMs: 30000, // Ping online presence every 30 seconds
  onlineWindowMs: 300000,     // 5-minute activity timeout for active status
  
  // Storage Keys
  storageKeys: {
    visitorId: 'glamora_anon_uid',
    lastPktDate: 'glamora_last_pkt_date',
    visitedToday: 'glamora_visited_today',
    sessionTimestamp: 'glamora_last_active_ts'
  }
};
