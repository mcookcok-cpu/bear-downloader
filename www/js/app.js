/**
 * Bear Downloader - Main App Logic
 * Fitur: Downloader, TTS, Mode Desktop, Pull-to-refresh
 */
(function() {
  'use strict';

  // ===== Platform Detection =====
  const isCordova = !!(window.cordova || window.PhoneGap);
  document.getElementById('platform').textContent = isCordova ? 'Cordova (Android)' : 'Web Browser';
  document.getElementById('ttsAvailable').textContent = 'speechSynthesis' in window ? '✅ Yes' : '❌ No';

  // ===== Desktop Mode Toggle =====
  const modeToggle = document.getElementById('modeToggle');
  const modeIcon = document.getElementById('modeIcon');
  const currentMode = document.getElementById('currentMode');
  const body = document.body;

  function updateMode() {
    const isDesktop = body.classList.contains('desktop-mode');
    modeIcon.textContent = isDesktop ? '💻' : '📱';
    currentMode.textContent = isDesktop ? 'Desktop' : 'Mobile';
  }

  modeToggle.addEventListener('click', () => {
    body.classList.toggle('desktop-mode');
    localStorage.setItem('bear-mode', body.classList.contains('desktop-mode') ? 'desktop' : 'mobile');
    updateMode();
  });

  // Load saved mode
  if (localStorage.getItem('bear-mode') === 'desktop') {
    body.classList.add('desktop-mode');
  }
  updateMode();

  // ===== Refresh Button =====
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (window.PullToRefresh && window.PullToRefresh.refresh) {
      window._ptrHandled = true; // Prevent reload fallback
      window.PullToRefresh.refresh();
    } else {
      location.reload();
    }
  });

  // ===== Pull-to-Refresh Listener =====
  window.addEventListener('ptr-refresh', () => {
    window._ptrHandled = true;
    setStatus('refreshStatus' /* placeholder */, '🔄 Konten diperbarui!', 'success');
    // Reload data here
  });

  // ===== File Downloader =====
  const downloadBtn = document.getElementById('downloadBtn');
  const fileUrlInput = document.getElementById('fileUrl');
  const fileNameInput = document.getElementById('fileName');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const downloadStatus = document.getElementById('downloadStatus');

  function setStatus(msg, type) {
    downloadStatus.textContent = msg;
    downloadStatus.className = 'status show ' + type;
  }

  function getFilenameFromUrl(url, fallback) {
    try {
      const u = new URL(url);
      const path = u.pathname.split('/').pop();
      return path && path.length > 0 ? path : fallback;
    } catch {
      return fallback;
    }
  }

  downloadBtn.addEventListener('click', () => {
    const url = fileUrlInput.value.trim();
    const customName = fileNameInput.value.trim();

    if (!url) {
      setStatus('❌ Masukkan URL file terlebih dahulu', 'error');
      return;
    }

    const filename = customName || getFilenameFromUrl(url, 'downloaded-file');

    if (isCordova && window.cordova && window.cordova.plugin && window.cordova.plugin.http) {
      // Native download via cordova-plugin-http + File plugin
      downloadNative(url, filename);
    } else if (isCordova && window.resolveLocalFileSystemURL) {
      // Fallback: open in system browser
      window.open(url, '_system');
      setStatus('📂 File dibuka di browser sistem', 'info');
    } else {
      // Web download via fetch + blob
      downloadWeb(url, filename);
    }
  });

  async function downloadWeb(url, filename) {
    progressContainer.style.display = 'block';
    downloadBtn.disabled = true;
    setStatus('⏳ Mengunduh...', 'info');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength) : 0;
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) {
          const pct = Math.round((received / total) * 100);
          progressBar.style.width = pct + '%';
          progressText.textContent = pct + '%';
        }
      }

      const blob = new Blob(chunks);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      progressBar.style.width = '100%';
      progressText.textContent = '100%';
      setStatus('✅ Berhasil diunduh: ' + filename + ' (' + formatBytes(received) + ')', 'success');
    } catch (err) {
      setStatus('❌ Gagal: ' + err.message, 'error');
    } finally {
      downloadBtn.disabled = false;
      setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
      }, 2000);
    }
  }

  function downloadNative(url, filename) {
    // Placeholder: implementation requires cordova-plugin-file-transfer
    setStatus('⚠️ Native downloader perlu plugin cordova-plugin-file-transfer', 'info');
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ===== Text-to-Speech =====
  const ttsText = document.getElementById('ttsText');
  const ttsSpeak = document.getElementById('ttsSpeak');
  const ttsPause = document.getElementById('ttsPause');
  const ttsStop = document.getElementById('ttsStop');
  const ttsRate = document.getElementById('ttsRate');
  const ttsVoice = document.getElementById('ttsVoice');
  const rateValue = document.getElementById('rateValue');

  let voices = [];

  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    ttsVoice.innerHTML = '';
    voices.forEach((voice, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = voice.name + ' (' + voice.lang + ')';
      // Prefer Indonesian voice
      if (voice.lang.startsWith('id')) opt.selected = true;
      ttsVoice.appendChild(opt);
    });
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  ttsRate.addEventListener('input', () => {
    rateValue.textContent = ttsRate.value;
  });

  ttsSpeak.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      alert('Browser ini tidak mendukung Text-to-Speech');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(ttsText.value);
    utter.rate = parseFloat(ttsRate.value);
    utter.lang = 'id-ID';
    if (voices[ttsVoice.value]) {
      utter.voice = voices[ttsVoice.value];
    }
    window.speechSynthesis.speak(utter);
  });

  ttsPause.addEventListener('click', () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  });

  ttsStop.addEventListener('click', () => {
    window.speechSynthesis.cancel();
  });

  // ===== Cordova Ready =====
  document.addEventListener('deviceready', () => {
    console.log('[Bear] Cordova ready');
    document.getElementById('platform').textContent = 'Cordova (Android)';
  }, false);

})();