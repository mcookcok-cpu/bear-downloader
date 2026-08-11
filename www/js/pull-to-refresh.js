/**
 * Pull-to-Refresh Handler
 * Mendukung touch gesture pada navbar / body
 */
(function() {
  'use strict';

  const PTR_THRESHOLD = 80; // pixel
  const PTR_MAX = 130;

  let startY = 0;
  let currentY = 0;
  let pulling = false;
  let refreshing = false;

  const indicator = document.getElementById('ptrIndicator');
  const navbar = document.getElementById('navbar');

  function isScrollable() {
    return window.scrollY > 0;
  }

  function startPull(e) {
    if (refreshing) return;
    if (isScrollable()) return;
    const t = e.touches ? e.touches[0] : e;
    startY = t.clientY;
    pulling = true;
  }

  function movePull(e) {
    if (!pulling || refreshing) return;
    const t = e.touches ? e.touches[0] : e;
    currentY = t.clientY;
    const diff = currentY - startY;

    if (diff > 0 && !isScrollable()) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, PTR_MAX);
      indicator.style.height = distance + 'px';
      indicator.classList.add('visible');

      if (distance > PTR_THRESHOLD) {
        indicator.classList.add('refreshing');
      } else {
        indicator.classList.remove('refreshing');
      }
    }
  }

  function endPull(e) {
    if (!pulling) return;
    const diff = currentY - startY;
    pulling = false;

    if (diff * 0.5 > PTR_THRESHOLD && !refreshing) {
      triggerRefresh();
    } else {
      resetIndicator();
    }
    startY = 0;
    currentY = 0;
  }

  function triggerRefresh() {
    refreshing = true;
    indicator.classList.add('refreshing');
    navbar.classList.add('refreshing');

    setTimeout(() => {
      resetIndicator();
      navbar.classList.remove('refreshing');
      refreshing = false;

      // Dispatch event agar app.js bisa handle
      window.dispatchEvent(new CustomEvent('ptr-refresh'));

      // Default fallback: reload page jika tidak ada listener
      if (!window._ptrHandled) {
        location.reload();
      }
    }, 1200);
  }

  function resetIndicator() {
    indicator.style.height = '0px';
    indicator.classList.remove('visible', 'refreshing');
    setTimeout(() => {
      indicator.style.height = '';
    }, 250);
  }

  // Touch events
  document.addEventListener('touchstart', startPull, { passive: true });
  document.addEventListener('touchmove', movePull, { passive: false });
  document.addEventListener('touchend', endPassThrough, { passive: true });

  // Mouse events (untuk desktop testing)
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) startPull(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (pulling) movePull(e);
  });
  document.addEventListener('mouseup', endPassThrough);

  function endPassThrough(e) {
    endPull(e);
  }

  // Public API: manual refresh trigger
  window.PullToRefresh = {
    refresh: triggerRefresh,
    isRefreshing: () => refreshing
  };
})();