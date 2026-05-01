// ==================== CONFIGURACIÓN ====================
const CONFIG = { HORA_CAMBIO: 9, ZONA_HORARIA: 'America/Argentina/Buenos_Aires', RUTA_JSON: 'db.json' };
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
    alertDiv.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg> Sin conexión. Los datos pueden no estar actualizados.`;
    intro.prepend(alertDiv);
  }
});

// ==================== UTILIDADES ====================
function pad(n) { return String(n).padStart(2, '0'); }
function formatearFechaGMT3() { const a = new Date(), o = { timeZone: CONFIG.ZONA_HORARIA }; return new Date(a.toLocaleString('en-US', o)); }
function labelFecha(d) { const di = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'], me = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']; return `${di[d.getDay()]} ${d.getDate()} de ${me[d.getMonth()]} de ${d.getFullYear()}`; }
function capFirst(s) { return s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''; }
function limpiarTelefono(t) { return (!t || t === 'nan' || t === 'NaN' || t === 'null') ? '' : t.replace(/\s/g, ''); }

function obtenerCicloActual() {
  const ahora = formatearFechaGMT3();
  const totalCiclos = Object.keys(ciclosData).length;
  if (totalCiclos === 0) return 1;

  let fechaBase = new Date(FECHA_INICIO_CICLO_1);
  let fechaActual = new Date(ahora);

  if (fechaActual.getHours() < 9) {
    fechaActual.setDate(fechaActual.getDate() - 1);
  }
  fechaBase.setHours(9, 0, 0, 0);
  fechaActual.setHours(9, 0, 0, 0);

  const diffDias = Math.floor((fechaActual - fechaBase) / 86400000);
  let ciclo = (diffDias % totalCiclos) + 1;
  if (ciclo <= 0) ciclo = 1;
  return ciclo;
}

const pharmacyIcon = L.divIcon({ className: 'custom-pharmacy-icon', html: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3fb950" stroke="white" stroke-width="1.5"/><path d="M12 7L12 13M9 10L15 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>', iconSize: [34, 34], popupAnchor: [0, -17] });

// ==================== CARGA DE DATOS ====================
async function cargarDatos() { 
  const intro = document.getElementById('intro');
  intro.innerHTML = '<span>Cargando datos...</span>';
  try { 
    const r = await fetch(CONFIG.RUTA_JSON + '?t=' + Date.now()); 
    if (!r.ok) throw new Error('HTTP ' + r.status); 
    ciclosData = await r.json(); 
    mostrarFarmacias(); 
  } catch(e) { 
    console.error('Error al cargar db.json:', e); 
    intro.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#f85149"/></svg> Error al cargar datos</span>'; 
    document.getElementById('lista').innerHTML = '<div class="card">No se pudieron cargar las farmacias</div>'; 
  } 
}

// ==================== MAPAS ====================
function initMaps() { 
  if (!mapDesktop) { 
    mapDesktop = L.map('map-desktop').setView([-38.0055, -57.5426], 12); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap' 
    }).addTo(mapDesktop); 
  } 
  if (!mapMobile) { 
    mapMobile = L.map('map-mobile-sheet').setView([-38.0055, -57.5426], 12); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap' 
    }).addTo(mapMobile); 
  } 
}

function limpiarMarcadores() { 
  markersDesktop.forEach(m => mapDesktop.removeLayer(m)); 
  markersMobile.forEach(m => mapMobile.removeLayer(m)); 
  markersDesktop = []; 
  markersMobile = []; 
  farmaciasCoords = []; 
}

function agregarMarcadores(farmacias) {
  initMaps(); 
  limpiarMarcadores();
  const dB = L.latLngBounds(), mB = L.latLngBounds();
  
  farmacias.forEach((f, i) => {
    const c = f.lat && f.lng ? [f.lat, f.lng] : null;
    farmaciasCoords[i] = c;
    
    const tClean = limpiarTelefono(f.telefono);
    const tIcon = `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`;
    const tLink = tClean ? `<br><a href="tel:${tClean}" style="color:var(--accent);display:inline-flex;align-items:center;gap:6px;margin-top:4px;">${tIcon} ${f.telefono}</a>` : '<br>📞 Sin teléfono';
    const gUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.direccion + ', Mar del Plata')}`;
    const pop = `<b>${capFirst(f.nombre)}</b><br>${f.direccion}<br>${tLink}<br><a href="${gUrl}" target="_blank" class="gmaps-link"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="var(--bg)"/></svg>Google Maps</a>`;
    
    if (c) { 
      const mD = L.marker(c, { icon: pharmacyIcon }).addTo(mapDesktop).bindPopup(pop); 
      const mM = L.marker(c, { icon: pharmacyIcon }).addTo(mapMobile).bindPopup(pop); 
      markersDesktop.push(mD); 
      markersMobile.push(mM); 
      dB.extend(c); 
      mB.extend(c); 
    } else { 
      const fb = [-38.0055, -57.5426]; 
      const mD = L.marker(fb, { icon: pharmacyIcon }).addTo(mapDesktop).bindPopup(pop + '<br><small>📍 Ubicación aproximada</small>'); 
      const mM = L.marker(fb, { icon: pharmacyIcon }).addTo(mapMobile).bindPopup(pop + '<br><small>📍 Ubicación aproximada</small>'); 
      markersDesktop.push(mD); 
      markersMobile.push(mM); 
      dB.extend(fb); 
      mB.extend(fb); 
    }
  });
  
  if (farmacias.length > 0) { 
    if (!mapDesktop._initialZoom) { 
      mapDesktop.fitBounds(dB); 
      mapDesktop._initialZoom = true; 
    } 
    if (!mapMobile._initialZoom) { 
      mapMobile.fitBounds(mB); 
      mapMobile._initialZoom = true; 
    } 
  }
  
  setTimeout(() => {
    if (mapDesktop) mapDesktop.invalidateSize();
    if (mapMobile) mapMobile.invalidateSize();
  }, 100);
}

function getLocationIcon() { return `<span class="icon-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="white"/></svg></span>`; }
function getPhoneIcon() { return `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`; }

// ==================== MOSTRAR FARMACIAS CON ACCESIBILIDAD ====================
function mostrarFarmacias() {
  const ciclo = obtenerCicloActual();
  const farmacias = ciclosData[ciclo] || [];
  const fecha = formatearFechaGMT3();
  const intro = document.getElementById('intro');
  const lista = document.getElementById('lista');
  
  if (!farmacias.length) { 
    intro.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg> No hay datos para hoy</span><div class="stats"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${labelFecha(fecha)}</div>`; 
    lista.innerHTML = '<div class="card">Sin farmacias registradas</div>'; 
    return; 
  }
  
  const fechaFin = new Date(fecha); 
  fechaFin.setDate(fechaFin.getDate() + 1);
  intro.innerHTML = `<div class="intro-line"><span class="icon-intro"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8V12L15 15M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="var(--accent)" stroke-width="1.5" fill="none"/></svg></span><span>Turno vigente · <strong>${labelFecha(fecha)}</strong></span><span style="font-size:12px;color:#7d8590;">(hasta las 9 del ${labelFecha(fechaFin)})</span></div><div class="stats"><span class="icon-stats"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L10 17L20 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span><span>${farmacias.length} farmacias de turno</span></div>`;
  lista.innerHTML = '';
  
  farmacias.forEach((f, i) => {
    const div = document.createElement('div'); 
    div.className = 'card';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Ver detalles de ${capFirst(f.nombre)}`);
    
    const tClean = limpiarTelefono(f.telefono);
    const tLink = tClean ? `<a href="tel:${tClean}" class="phone-link" onclick="event.stopPropagation();">${getPhoneIcon()} ${f.telefono}</a>` : `<span class="phone-link">${getPhoneIcon()} Sin teléfono</span>`;
    div.innerHTML = `<div class="card-num">${pad(i + 1)}</div><div class="card-info"><div class="card-name">${capFirst(f.nombre)}</div><div class="card-address">${getLocationIcon()} ${f.direccion}</div></div><div class="card-phone">${tLink}</div>`;
    
    const activarTarjeta = (e) => {
      if (e.target.closest('.phone-link')) return;

      const esEscritorio = window.innerWidth >= 768;

      if (esEscritorio) {
        const c = farmaciasCoords[i];
        if (mapDesktop && markersDesktop[i]) {
          markersDesktop[i].openPopup();
          if (c) mapDesktop.setView(c, 16);
        }
        setTimeout(() => {
          const mapElement = document.getElementById('map-desktop');
          if (mapElement) {
            const yOffset = -80;
            const y = mapElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      } else {
        const sheet = document.getElementById('mapSheet');
        document.getElementById('sheetName').innerHTML = `${capFirst(f.nombre)}<br><small style="font-size:12px">${f.direccion}</small>`;
        sheet.classList.add('open');
        const c = farmaciasCoords[i];
        if (c && mapMobile) { 
          mapMobile.setView(c, 16); 
          if (markersMobile[i]) markersMobile[i].openPopup(); 
        }
      }

      if (activeCard) activeCard.classList.remove('active');
      div.classList.add('active'); 
      activeCard = div;
    };
    
    div.onclick = activarTarjeta;
    div.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activarTarjeta(e);
      }
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
  // ... (Esta función se mantiene igual, la tienes completa en tu archivo)
  if (modoTodas) return;
  modoTodas = true;
  // ... (resto de la función)
}

// ==================== VOLVER AL TURNO ACTUAL ====================
function volverATurno() {
  // ... (Esta función se mantiene igual, la tienes completa en tu archivo)
}

// ... (El resto de tu código: listeners, temas, botón ir arriba, instalación PWA) ...
// Asegúrate de que el resto de tu código (temas, instalación, etc.) esté presente después de estas funciones.
