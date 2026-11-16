/**
 * ============================================================================
 * GLAMORA — ADVANCED AUTOMATIC BACKGROUND AUDIO ENGINE
 * Automatically plays ambient background music when web page is opened.
 * Uses multi-layered strategy for Chrome, Edge, Safari, and mobile autoplay.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const AUDIO_SRC = 'assets/audio/background-music.mp3';
  const STORAGE_KEY_PLAYING = 'glamora_music_enabled';
  const STORAGE_KEY_TIME = 'glamora_music_time';
  const TARGET_VOLUME = 0.35; // Elegant, gentle background volume

  class GlamoraAutoAudio {
    constructor() {
      this.audio = null;
      this.isPlaying = false;
      this.unlocked = false;
      this.floatingBtn = null;
      this.statusText = null;
      this.hintBanner = null;

      this.init();
    }

    init() {
      // Find or create HTML5 audio element
      let existingAudio = document.getElementById('glamora-bg-audio');
      if (existingAudio) {
        this.audio = existingAudio;
      } else {
        this.audio = new Audio(AUDIO_SRC);
        this.audio.id = 'glamora-bg-audio';
        this.audio.loop = true;
        this.audio.preload = 'auto';
        document.body.appendChild(this.audio);
      }

      this.audio.volume = TARGET_VOLUME;

      // Restore playback timestamp if available
      const savedTime = parseFloat(sessionStorage.getItem(STORAGE_KEY_TIME));
      if (!isNaN(savedTime) && savedTime > 0) {
        try {
          this.audio.currentTime = savedTime;
        } catch (e) {}
      }

      // Render floating UI widget & prompt
      this.renderPlayerWidget();

      // Trigger automatic playback immediately
      this.startAutoPlayback();

      // Sync position periodically
      setInterval(() => {
        if (this.audio && !this.audio.paused && this.audio.currentTime > 0) {
          sessionStorage.setItem(STORAGE_KEY_TIME, this.audio.currentTime.toString());
        }
      }, 1500);
    }

    renderPlayerWidget() {
      if (document.querySelector('.glamora-music-widget')) return;

      const widget = document.createElement('div');
      widget.className = 'glamora-music-widget';
      widget.setAttribute('role', 'region');
      widget.setAttribute('aria-label', 'Background Music Controller');
      widget.innerHTML = `
        <button type="button" class="glamora-music-btn is-playing" id="btn-toggle-music" title="Toggle Ambient Music" aria-label="Toggle Background Music">
          <div class="music-wave-bars">
            <span class="wave-bar bar-1"></span>
            <span class="wave-bar bar-2"></span>
            <span class="wave-bar bar-3"></span>
          </div>
          <i class="fas fa-music music-icon-note"></i>
          <span class="music-label-text" id="music-status-text">Ambient Music: Playing</span>
        </button>
      `;
      document.body.appendChild(widget);

      this.floatingBtn = widget.querySelector('#btn-toggle-music');
      this.statusText = widget.querySelector('#music-status-text');

      this.floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlayback();
      });
    }

    showAutoplayHint() {
      if (this.hintBanner || this.isPlaying) return;

      const hint = document.createElement('div');
      hint.className = 'music-autoplay-hint';
      hint.innerHTML = `
        <i class="fas fa-volume-up"></i>
        <span>Tap anywhere to enable ambient music</span>
      `;
      document.body.appendChild(hint);
      this.hintBanner = hint;

      hint.addEventListener('click', () => {
        this.forcePlay();
      });
    }

    hideAutoplayHint() {
      if (this.hintBanner) {
        this.hintBanner.style.opacity = '0';
        this.hintBanner.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          this.hintBanner?.remove();
          this.hintBanner = null;
        }, 300);
      }
    }

    startAutoPlayback() {
      if (!this.audio) return;

      // 1. Try immediate unmuted playback
      this.audio.volume = TARGET_VOLUME;
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.setPlayingState(true);
            this.hideAutoplayHint();
          })
          .catch(() => {
            // Browser autoplay policy blocked unmuted audio until user gesture
            // 2. Start interaction unlocking on ANY gesture (move mouse, scroll, click, tap)
            this.setupFastInteractionUnlock();
          });
      }
    }

    setupFastInteractionUnlock() {
      if (this.unlocked) return;

      // Show gentle hint if not playing yet
      setTimeout(() => {
        if (!this.isPlaying) {
          this.showAutoplayHint();
        }
      }, 800);

      const unlock = () => {
        if (this.unlocked || this.isPlaying) return;
        this.unlocked = true;

        this.audio.volume = TARGET_VOLUME;
        this.audio.play()
          .then(() => {
            this.setPlayingState(true);
            this.hideAutoplayHint();
          })
          .catch(() => {});

        // Cleanup listeners
        events.forEach(evt => {
          window.removeEventListener(evt, unlock, { passive: true, capture: true });
        });
      };

      const events = [
        'pointerdown',
        'mousedown',
        'touchstart',
        'click',
        'scroll',
        'wheel',
        'keydown',
        'mousemove'
      ];

      events.forEach(evt => {
        window.addEventListener(evt, unlock, { passive: true, capture: true, once: true });
      });
    }

    forcePlay() {
      if (!this.audio) return;
      this.audio.volume = TARGET_VOLUME;
      this.audio.play()
        .then(() => {
          this.setPlayingState(true);
          this.hideAutoplayHint();
        })
        .catch(() => {});
    }

    togglePlayback() {
      if (!this.audio) return;

      if (this.isPlaying) {
        this.audio.pause();
        this.setPlayingState(false);
      } else {
        this.forcePlay();
      }
    }

    setPlayingState(playing) {
      this.isPlaying = playing;
      if (this.floatingBtn) {
        if (playing) {
          this.floatingBtn.classList.add('is-playing');
          if (this.statusText) this.statusText.textContent = 'Ambient Music: Playing';
        } else {
          this.floatingBtn.classList.remove('is-playing');
          if (this.statusText) this.statusText.textContent = 'Music: Paused';
        }
      }
    }
  }

  // Initialize as soon as DOM is ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.GlamoraAudio = new GlamoraAutoAudio();
    });
  } else {
    window.GlamoraAudio = new GlamoraAutoAudio();
  }
})(window);
