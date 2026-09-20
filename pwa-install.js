// PWA Registration & Offline Storage Helper
let deferredPrompt = null;

// Offline Data Persistence Helper (localStorage Wrapper)
window.PwaStorage = {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[PWA Storage] Error saving to localStorage:', e);
      return false;
    }
  },
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
};

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] beforeinstallprompt event triggered');
  
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
    installBtn.addEventListener('click', promptPwaInstall);
  } else {
    showPwaInstallBanner();
  }
});

async function promptPwaInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] User choice outcome:', outcome);
  deferredPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
}

function showPwaInstallBanner() {
  if (document.getElementById('pwa-install-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1e293b;color:#fff;padding:12px 18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:999999;display:flex;align-items:center;gap:12px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;';
  banner.innerHTML = `
    <span>📲 Cài đặt ứng dụng này?</span>
    <button id="pwa-banner-install-btn" style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-weight:bold;cursor:pointer;">Cài đặt</button>
    <button id="pwa-banner-close-btn" style="background:transparent;color:#94a3b8;border:none;font-size:16px;cursor:pointer;">✕</button>
  `;
  document.body.appendChild(banner);

  document.getElementById('pwa-banner-install-btn').addEventListener('click', promptPwaInstall);
  document.getElementById('pwa-banner-close-btn').addEventListener('click', () => banner.remove());
}

window.addEventListener('appinstalled', () => {
  console.log('[PWA] Application successfully installed!');
  deferredPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => console.log('[ServiceWorker] Registered with scope:', reg.scope))
      .catch(err => console.error('[ServiceWorker] Registration failed:', err));
  });
}