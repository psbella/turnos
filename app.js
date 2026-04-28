// ==================== CONFIGURACIÓN ====================
const CONFIG = { HORA_CAMBIO: 9, ZONA_HORARIA: 'America/Argentina/Buenos_Aires', RUTA_JSON: 'ciclos_oficiales_definitivo.json' };
let ciclosData = {}, mapDesktop = null, mapMobile = null, activeCard = null, markersDesktop = [], markersMobile = [], farmaciasCoords = [];
const FECHA_INICIO_CICLO_1 = new Date(2026, 2, 25, 9, 0, 0);
let modoTodas = false, farmaciasOriginales = null, modoAutomatico = true;

// ==================== DETECTAR CONEXIÓN ====================
window.addEventListener('online', () => location.reload());
window.addEventListener('offline', () => {
  const intro = document.getElementById('intro');
  if (intro && !document.querySelector('.offline-alert')) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'offline-alert';
    alertDiv.innerHTML = '📡 Sin conexión. Los datos pueden no estar actualizados.';
    intro.prepend(alertDiv);
  }
});

// ==================== UTILIDADES ====================
function pad(n) { return String(n).padStart(2, '0'); }
function formatearFechaGMT3() { const a = new Date(), o = { timeZone: CONFIG.ZONA_HORARIA }; return new Date(a.toLocaleString('en-US', o)); }
function labelFecha(d) { const di = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'], me = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']; return `${di[d.getDay()]} ${d.getDate()} de ${me[d.getMonth()]} de ${d.getFullYear()}`; }
function capFirst(s) { return s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''; }
function limpiarTelefono(t) { return (!t || t === 'nan' || t === 'NaN' || t === 'null') ? '' : t.replace(/\s/g, ''); }
function obtenerCicloActual() { const f = formatearFechaGMT3(), d = Math.floor((f - FECHA_INICIO_CICLO_1) / 86400000); const totalCiclos = Object.keys(ciclosData).length; let c = (d % totalCiclos) + 1; if (c <= 0) c = 1; return c; }

const pharmacyIcon = L.divIcon({ className: 'custom-pharmacy-icon', html: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3fb950" stroke="white" stroke-width="1.5"/><path d="M12 7L12 13M9 10L15 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>', iconSize: [34, 34], popupAnchor: [0, -17] });

// ==================== CARGA DE DATOS ====================
async function cargarDatos() { const i = document.getElementById('intro'); try { const r = await fetch(CONFIG.RUTA_JSON); if (!r.ok) throw new Error('HTTP ' + r.status); ciclosData = await r.json(); mostrarFarmacias(); } catch(e) { console.error(e); i.innerHTML = '<span>⚠️ Error al cargar datos</span>'; document.getElementById('lista').innerHTML = '<div class="card">No se pudieron cargar las farmacias</div>'; } }

// ==================== MAPAS ====================
function initMaps() { if (!mapDesktop) { mapDesktop = L.map('map-desktop').setView([-38.0055, -57.5426], 12); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapDesktop); } if (!mapMobile) { mapMobile = L.map('map-mobile-sheet').setView([-38.0055, -57.5426], 12); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapMobile); } }
function limpiarMarcadores() { markersDesktop.forEach(m => mapDesktop.removeLayer(m)); markersMobile.forEach(m => mapMobile.removeLayer(m)); markersDesktop = []; markersMobile = []; farmaciasCoords = []; }

function agregarMarcadores(farmacias) {
  initMaps(); limpiarMarcadores();
  const dB = L.latLngBounds(), mB = L.latLngBounds();
  farmacias.forEach((f, i) => {
    const c = f.lat && f.lng ? [f.lat, f.lng] : null;
    farmaciasCoords[i] = c;
    const tClean = limpiarTelefono(f.telefono);
    const tIcon = `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`;
    const tLink = tClean ? `<br><a href="tel:${tClean}" style="color:var(--accent);display:inline-flex;align-items:center;gap:6px;margin-top:4px;">${tIcon} ${f.telefono}</a>` : '<br>📞 Sin teléfono';
    const gUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.direccion + ', Mar del Plata')}`;
    const pop = `<b>${capFirst(f.nombre)}</b><br>${f.direccion}<br>${tLink}<br><a href="${gUrl}" target="_blank" class="gmaps-link"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="var(--bg)"/></svg>Google Maps</a>`;
    if (c) { const mD = L.marker(c, { icon: pharmacyIcon }).addTo(mapDesktop).bindPopup(pop); const mM = L.marker(c, { icon: pharmacyIcon }).addTo(mapMobile).bindPopup(pop); markersDesktop.push(mD); markersMobile.push(mM); dB.extend(c); mB.extend(c); }
    else { const fb = [-38.0055, -57.5426]; const mD = L.marker(fb, { icon: pharmacyIcon }).addTo(mapDesktop).bindPopup(pop + '<br><small>📍 Ubicación aproximada</small>'); const mM = L.marker(fb, { icon: pharmacyIcon }).addTo(mapMobile).bindPopup(pop + '<br><small>📍 Ubicación aproximada</small>'); markersDesktop.push(mD); markersMobile.push(mM); dB.extend(fb); mB.extend(fb); }
  });
  if (farmacias.length > 0) { if (!mapDesktop._initialZoom) { mapDesktop.fitBounds(dB); mapDesktop._initialZoom = true; } if (!mapMobile._initialZoom) { mapMobile.fitBounds(mB); mapMobile._initialZoom = true; } }
  setTimeout(() => {
    if (mapDesktop) mapDesktop.invalidateSize();
    if (mapMobile) mapMobile.invalidateSize();
  }, 100);
}

function getLocationIcon() { return `<span class="icon-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="white"/></svg></span>`; }
function getPhoneIcon() { return `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`; }

function mostrarFarmacias() {
  const ciclo = obtenerCicloActual();
  const farmacias = ciclosData[ciclo] || [];
  const fecha = formatearFechaGMT3();
  const intro = document.getElementById('intro');
  const lista = document.getElementById('lista');
  if (!farmacias.length) { intro.innerHTML = `<span>⚠️ No hay datos para hoy</span><div class="stats">📅 ${labelFecha(fecha)}</div>`; lista.innerHTML = '<div class="card">Sin farmacias registradas</div>'; return; }
  const fechaFin = new Date(fecha); fechaFin.setDate(fechaFin.getDate() + 1);
  intro.innerHTML = `<div class="intro-line"><span class="icon-intro"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8V12L15 15M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="var(--accent)" stroke-width="1.5" fill="none"/></svg></span><span>Turno vigente · <strong>${labelFecha(fecha)}</strong></span><span style="font-size:12px;color:#7d8590;">(hasta las 9 del ${labelFecha(fechaFin)})</span></div><div class="stats"><span class="icon-stats"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L10 17L20 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span><span>${farmacias.length} farmacias de turno</span></div>`;
  lista.innerHTML = '';
  farmacias.forEach((f, i) => {
    const div = document.createElement('div'); div.className = 'card';
    const tClean = limpiarTelefono(f.telefono);
    const tLink = tClean ? `<a href="tel:${tClean}" class="phone-link" onclick="event.stopPropagation();">${getPhoneIcon()} ${f.telefono}</a>` : `<span class="phone-link">${getPhoneIcon()} Sin teléfono</span>`;
    div.innerHTML = `<div class="card-num">${pad(i + 1)}</div><div class="card-info"><div class="card-name">${capFirst(f.nombre)}</div><div class="card-address">${getLocationIcon()} ${f.direccion}</div></div><div class="card-phone">${tLink}</div>`;
    div.onclick = (e) => {
      if (e.target.closest('.phone-link')) return;
      const sheet = document.getElementById('mapSheet');
      document.getElementById('sheetName').innerHTML = `${capFirst(f.nombre)}<br><small style="font-size:12px">${f.direccion}</small>`;
      sheet.classList.add('open');
      const c = farmaciasCoords[i];
      if (c && mapMobile) { mapMobile.setView(c, 16); if (markersMobile[i]) markersMobile[i].openPopup(); }
      if (activeCard) activeCard.classList.remove('active');
      div.classList.add('active'); activeCard = div;
      if (mapDesktop && markersDesktop[i]) markersDesktop[i].openPopup();
    };
    lista.appendChild(div);
  });
  agregarMarcadores(farmacias);
  const fechaActual = new Date().toLocaleDateString('es-AR');
  const tituloDinamico = `${farmacias.length} farmacias de turno hoy en Mar del Plata · ${fechaActual}`;
  const titleElement = document.getElementById('page-title');
  if (titleElement) titleElement.innerText = tituloDinamico;
}
function programarActualizacion() { const a = formatearFechaGMT3(); let p = new Date(a); p.setHours(9, 0, 0, 0); if (a >= p) p.setDate(p.getDate() + 1); setTimeout(() => { mostrarFarmacias(); programarActualizacion(); }, p - a); }
document.getElementById('closeSheet').onclick = () => document.getElementById('mapSheet').classList.remove('open');

// ==================== VER TODAS LAS FARMACIAS ====================
function mostrarTodasLasFarmacias() {
  if (modoTodas) return;
  modoTodas = true;

  // Guardar estado original
  farmaciasOriginales = { lista: document.getElementById('lista').innerHTML, intro: document.getElementById('intro').innerHTML };

  // Obtener farmacias únicas
  const farmaciasUnicas = new Map();
  for (const grupo in ciclosData) {
    for (const f of ciclosData[grupo]) {
      const key = `${f.nombre}|${f.direccion}`;
      if (!farmaciasUnicas.has(key)) farmaciasUnicas.set(key, f);
    }
  }
  const todas = Array.from(farmaciasUnicas.values());

  // Actualizar intro
  document.getElementById('intro').innerHTML = `<div class="intro-line"><span class="icon-intro">📍</span><span>Todas las farmacias de Mar del Plata</span></div><div class="stats"><span>🏪 ${todas.length} farmacias únicas</span></div>`;

  // Generar lista de tarjetas
  const listaDiv = document.getElementById('lista');
  listaDiv.innerHTML = '';
  todas.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<div class="card-num">${i + 1}</div><div class="card-info"><div class="card-name">${capFirst(f.nombre)}</div><div class="card-address">📍 ${f.direccion}</div></div>`;
    
    // Capturar los datos de la farmacia para el onclick
    const farmaciaActual = f;
    const indiceActual = i;
    
    div.onclick = () => {
      // Asegurar que el mapa móvil existe
      if (!mapMobile) {
        mapMobile = L.map('map-mobile-sheet').setView([-38.0055, -57.5426], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(mapMobile);
      }
      
      // Asegurar que los marcadores móviles existen para todas las farmacias (solo la primera vez)
      if (!window.markersMovilesTodas) {
        window.markersMovilesTodas = [];
        todas.forEach((ff, idx) => {
          const coords = ff.lat && ff.lng ? [ff.lat, ff.lng] : null;
          if (coords) {
            const marker = L.marker(coords, { icon: pharmacyIcon }).addTo(mapMobile);
            window.markersMovilesTodas[idx] = marker;
          }
        });
      }
      
      // Abrir el sheet
      const sheet = document.getElementById('mapSheet');
      document.getElementById('sheetName').innerHTML = `${capFirst(farmaciaActual.nombre)}<br><small style="font-size:12px">${farmaciaActual.direccion}</small>`;
      sheet.classList.add('open');
      
      // Centrar en la farmacia seleccionada
      const coords = farmaciaActual.lat && farmaciaActual.lng ? [farmaciaActual.lat, farmaciaActual.lng] : null;
      if (coords && mapMobile) {
        setTimeout(() => {
          mapMobile.setView(coords, 16);
          if (window.markersMovilesTodas && window.markersMovilesTodas[indiceActual]) {
            window.markersMovilesTodas[indiceActual].openPopup();
          }
        }, 200);
      }
      
      // Manejar tarjeta activa
      if (activeCard) activeCard.classList.remove('active');
      div.classList.add('active');
      activeCard = div;
      
      // Mapa de escritorio
      if (mapDesktop && farmaciaActual.lat && farmaciaActual.lng) {
        mapDesktop.setView([farmaciaActual.lat, farmaciaActual.lng], 16);
      }
    };
    
    listaDiv.appendChild(div);
  });

  // Actualizar mapa con todas las farmacias (escritorio)
  limpiarMarcadores();
  agregarMarcadores(todas);
  
  setTimeout(() => {
    if (mapDesktop) {
      mapDesktop.invalidateSize();
      const coordsValidas = todas.filter(f => f.lat && f.lng).map(f => [f.lat, f.lng]);
      if (coordsValidas.length > 0) {
        const bounds = L.latLngBounds(coordsValidas);
        mapDesktop.fitBounds(bounds);
      }
    }
  }, 150);

  // Cambiar botones
  const btn = document.getElementById('btnTodasFarmacias');
  btn.textContent = '↺ Volver';
  btn.classList.remove('btn-todas');
  btn.classList.add('btn-volver');
  const btnFlotante = document.getElementById('btnVolverFlotante');
  if (btnFlotante) btnFlotante.style.display = 'flex';
}

// ==================== VOLVER AL TURNO ACTUAL ====================
function volverATurno() {
  if (!modoTodas) return;
  modoTodas = false;

  // Limpiar marcadores móviles temporales
  if (window.markersMovilesTodas) {
    if (mapMobile) {
      window.markersMovilesTodas.forEach(m => {
        if (m) mapMobile.removeLayer(m);
      });
    }
    window.markersMovilesTodas = null;
  }

  // Restaurar lista e intro
  document.getElementById('lista').innerHTML = farmaciasOriginales.lista;
  document.getElementById('intro').innerHTML = farmaciasOriginales.intro;

  // Restaurar mapa al turno actual
  const ciclo = obtenerCicloActual();
  const farmaciasTurno = ciclosData[ciclo] || [];
  limpiarMarcadores();
  agregarMarcadores(farmaciasTurno);
  setTimeout(() => {
    if (mapDesktop) mapDesktop.invalidateSize();
    if (mapMobile) mapMobile.invalidateSize();
  }, 100);

  // Cambiar botones
  const btn = document.getElementById('btnTodasFarmacias');
  btn.textContent = '📍 Ver todas';
  btn.classList.remove('btn-volver');
  btn.classList.add('btn-todas');
  const btnFlotante = document.getElementById('btnVolverFlotante');
  if (btnFlotante) btnFlotante.style.display = 'none';
}

document.getElementById('btnTodasFarmacias').addEventListener('click', () => { if (modoTodas) volverATurno(); else mostrarTodasLasFarmacias(); });
document.getElementById('btnVolverFlotante').addEventListener('click', () => { if (modoTodas) volverATurno(); });

function aplicarTema(tema) { const sw = document.getElementById('theme-switch'), l = document.getElementById('theme-label'); if (tema === 'light') { document.body.classList.add('light'); document.body.classList.remove('dark'); if (sw) sw.classList.add('active'); if (l) l.textContent = 'tema claro'; } else { document.body.classList.add('dark'); document.body.classList.remove('light'); if (sw) sw.classList.remove('active'); if (l) l.textContent = 'tema oscuro'; } }
function initTheme() { const savedTheme = localStorage.getItem('theme'), savedMode = localStorage.getItem('modoAutomatico'); if (savedTheme && savedMode === 'false') { modoAutomatico = false; aplicarTema(savedTheme); return; } modoAutomatico = true; const ahora = formatearFechaGMT3(); const hora = ahora.getHours(); const esDia = (hora >= 8 && hora < 20); aplicarTema(esDia ? 'light' : 'dark'); }
document.getElementById('theme-switch').onclick = () => { modoAutomatico = false; const esClaroActual = document.body.classList.contains('light'); aplicarTema(esClaroActual ? 'dark' : 'light'); localStorage.setItem('theme', esClaroActual ? 'dark' : 'light'); localStorage.setItem('modoAutomatico', 'false'); };
(async () => { initTheme(); await cargarDatos(); programarActualizacion(); })();
