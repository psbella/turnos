let deferredPrompt = null;

export function setupInstallPWA() {
  const btnInstalar = document.getElementById('btnInstalar');
  const iosModal = document.getElementById('iosModal');
  const closeIosModal = document.getElementById('closeIosModal');
  const entendidoBtn = document.getElementById('entendidoBtn');

  function isIOS() {
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && navigator.standalone === true);
  }

  function showIOSInstructions() {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed && !isInstalled() && isIOS()) {
      setTimeout(() => {
        if (iosModal) iosModal.style.display = 'flex';
      }, 3000);
    }
  }

  function closeIOSModal() {
    if (iosModal) iosModal.style.display = 'none';
    localStorage.setItem('pwa-install-dismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 30 * 24 * 60 * 60 * 1000);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstalar) btnInstalar.style.display = 'flex';
  });

  if (btnInstalar) {
    btnInstalar.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Instalación: ${outcome}`);
        deferredPrompt = null;
        btnInstalar.style.display = 'none';
      } else if (isIOS()) {
        showIOSInstructions();
      } else {
        alert('Para instalar, tocá el menú ⋮ y seleccioná "Instalar aplicación"');
      }
    });
  }

  if (closeIosModal) closeIosModal.onclick = closeIOSModal;
  if (entendidoBtn) entendidoBtn.onclick = closeIOSModal;

  if (isIOS() && !isInstalled()) {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) setTimeout(showIOSInstructions, 3000);
  }

  if (isInstalled() && btnInstalar) {
    btnInstalar.style.display = 'none';
  }
}
