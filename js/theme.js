export let modoAutomatico = true;

export function aplicarTema(tema) {
  const sw = document.getElementById('theme-switch');
  const l = document.getElementById('theme-label');
  if (tema === 'light') {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
    if (sw) sw.classList.add('active');
    if (l) l.textContent = 'tema claro';
  } else {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
    if (sw) sw.classList.remove('active');
    if (l) l.textContent = 'tema oscuro';
  }
}

export function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const savedMode = localStorage.getItem('modoAutomatico');
  if (savedTheme && savedMode === 'false') {
    modoAutomatico = false;
    aplicarTema(savedTheme);
    return;
  }
  modoAutomatico = true;
  const ahora = new Date();
  const hora = ahora.getHours();
  const esDia = (hora >= 8 && hora < 20);
  aplicarTema(esDia ? 'light' : 'dark');
}

// Evento para el switch de tema (se conecta en main.js)
export function setupThemeSwitch() {
  document.getElementById('theme-switch').onclick = () => {
    modoAutomatico = false;
    const esClaroActual = document.body.classList.contains('light');
    aplicarTema(esClaroActual ? 'dark' : 'light');
    localStorage.setItem('theme', esClaroActual ? 'dark' : 'light');
    localStorage.setItem('modoAutomatico', 'false');
  };
}
