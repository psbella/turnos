import { ciclosData, farmaciasCoords, obtenerCicloActual, formatearFechaGMT3, limpiarTelefono } from './data.js';
import { agregarMarcadores, limpiarMarcadores, mapDesktop, mapMobile, markersDesktop, markersMobile } from './maps.js';

let activeCard = null;
let modoTodas = false;
let farmaciasOriginales = null;

export function pad(n) { return String(n).padStart(2, '0'); }

export function labelFecha(d) {
  const di = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const me = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${di[d.getDay()]} ${d.getDate()} de ${me[d.getMonth()]} de ${d.getFullYear()}`;
}

export function capFirst(s) {
  return s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
}

export function getLocationIcon() {
  return `<span class="icon-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="white"/></svg></span>`;
}

export function getPhoneIcon() {
  return `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`;
}

export function mostrarFarmacias() {
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
    div.setAttribute('aria-label', `Ver detalles de ${f.nombre}`);

    const tClean = limpiarTelefono(f.telefono);
    const tLink = tClean ? `<a href="tel:${tClean}" class="phone-link" onclick="event.stopPropagation();">${getPhoneIcon()} ${f.telefono}</a>` : `<span class="phone-link">${getPhoneIcon()} Sin teléfono</span>`;

    div.innerHTML = `<div class="card-num">${pad(i + 1)}</div>
      <div class="card-info">
        <div class="card-name">${f.nombre}</div>
        <div class="card-address">${getLocationIcon()} ${f.direccion}</div>
      </div>
      <div class="card-phone">${tLink}</div>`;

    const activarTarjeta = (e) => {
      if (e.target.closest('.phone-link')) return;

      const esEscritorio = window.innerWidth >= 768;
      const c = farmaciasCoords[i];

      if (esEscritorio) {
        if (mapDesktop && markersDesktop && markersDesktop[i]) {
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
        document.getElementById('sheetName').innerHTML = `${f.nombre}<br><small style="font-size:12px">${f.direccion}</small>`;
        sheet.classList.add('open');
        if (c && mapMobile) {
          mapMobile.setView(c, 16);
          if (markersMobile && markersMobile[i]) markersMobile[i].openPopup();
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
}

export function mostrarTodasLasFarmacias() {
  if (modoTodas) return;
  modoTodas = true;
  document.body.classList.add('modo-todas');

  farmaciasOriginales = {
    lista: document.getElementById('lista').innerHTML,
    intro: document.getElementById('intro').innerHTML
  };

  const farmaciasUnicas = new Map();

  for (let i = 1; i <= 16; i++) {
    const grupo = i.toString();
    if (ciclosData[grupo]) {
      for (const f of ciclosData[grupo]) {
        const key = `${f.nombre}|${f.direccion}`;
        if (!farmaciasUnicas.has(key)) farmaciasUnicas.set(key, f);
      }
    }
  }

  if (ciclosData["farmacias_extra"]) {
    for (const f of ciclosData["farmacias_extra"]) {
      const key = `${f.nombre}|${f.direccion}`;
      if (!farmaciasUnicas.has(key)) farmaciasUnicas.set(key, f);
    }
  }

  const todas = Array.from(farmaciasUnicas.values());
  const ciclo = obtenerCicloActual();
  const farmaciasHoy = ciclosData[ciclo] || [];
  const nombresHoy = new Set(farmaciasHoy.map(f => `${f.nombre}|${f.direccion}`));

  const destacadas = [];
  const normales = [];

  todas.forEach(f => {
    const key = `${f.nombre}|${f.direccion}`;
    if (nombresHoy.has(key)) {
      destacadas.push(f);
    } else {
      normales.push(f);
    }
  });

  destacadas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  normales.sort((a, b) => a.nombre.localeCompare(b.nombre));

  const todasOrdenadas = [...destacadas, ...normales];

  document.getElementById('intro').innerHTML = `<div class="intro-line"><span class="icon-intro"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="white"/></svg></span><span>Todas las farmacias de Mar del Plata</span></div><div class="stats"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> ${todas.length} farmacias únicas</span></div>`;

  // Recargar mapas con todas las farmacias
  limpiarMarcadores();
  agregarMarcadores(todasOrdenadas);

  const listaDiv = document.getElementById('lista');
  listaDiv.innerHTML = '';
  todasOrdenadas.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    const key = `${f.nombre}|${f.direccion}`;
    const esDeTurnoHoy = nombresHoy.has(key);
    const badgeHtml = esDeTurnoHoy ? '<span class="badge-hoy-inline"><span class="circulo"></span> Hoy de turno</span>' : '';

    const tClean = limpiarTelefono(f.telefono);
    const tLink = tClean ? `<a href="tel:${tClean}" class="phone-link" onclick="event.stopPropagation();">${getPhoneIcon()} ${f.telefono}</a>` : `<span class="phone-link">${getPhoneIcon()} Sin teléfono</span>`;

    div.innerHTML = `<div class="card-num">${i + 1}</div>
      <div class="card-info">
        <div class="card-name">${f.nombre}</div>
        <div class="card-address">${getLocationIcon()} ${f.direccion}</div>
        ${badgeHtml ? `<div class="card-badge">${badgeHtml}</div>` : ''}
      </div>
      <div class="card-phone">${tLink}</div>`;

    div.onclick = () => {
      const sheet = document.getElementById('mapSheet');
      document.getElementById('sheetName').innerHTML = `${f.nombre}<br><small style="font-size:12px">${f.direccion}</small>`;
      sheet.classList.add('open');

      const coords = f.lat && f.lng ? [f.lat, f.lng] : null;
      if (coords && mapMobile) {
        mapMobile.setView(coords, 16);
      }
    };
    listaDiv.appendChild(div);
  });

  const btn = document.getElementById('btnTodasFarmacias');
  btn.textContent = 'Volver a turnos';
  btn.classList.remove('btn-todas');
  btn.classList.add('btn-volver');
}

export function volverATurno() {
  if (!modoTodas) return;
  modoTodas = false;
  document.body.classList.remove('modo-todas');

  document.getElementById('lista').innerHTML = farmaciasOriginales.lista;
  document.getElementById('intro').innerHTML = farmaciasOriginales.intro;

  const ciclo = obtenerCicloActual();
  const farmaciasTurno = ciclosData[ciclo] || [];
  limpiarMarcadores();
  agregarMarcadores(farmaciasTurno);

  const btn = document.getElementById('btnTodasFarmacias');
  btn.textContent = 'Ver todas';
  btn.classList.remove('btn-volver');
  btn.classList.add('btn-todas');
}
