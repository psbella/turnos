import { farmaciasCoords, limpiarTelefono } from './data.js';
import { capFirst } from './ui.js';

let mapDesktop = null;
let mapMobile = null;
let markersDesktop = [];
let markersMobile = [];

const pharmacyIcon = L.divIcon({
  className: 'custom-pharmacy-icon',
  html: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3fb950" stroke="white" stroke-width="1.5"/><path d="M12 7L12 13M9 10L15 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>',
  iconSize: [34, 34],
  popupAnchor: [0, -17]
});

export function initMaps() {
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

export function limpiarMarcadores() {
  markersDesktop.forEach(m => mapDesktop.removeLayer(m));
  markersMobile.forEach(m => mapMobile.removeLayer(m));
  markersDesktop = [];
  markersMobile = [];
}

export function agregarMarcadores(farmacias) {
  initMaps();
  limpiarMarcadores();
  const dB = L.latLngBounds(), mB = L.latLngBounds();

  farmacias.forEach((f, i) => {
    const c = f.lat && f.lng ? [f.lat, f.lng] : null;
    farmaciasCoords[i] = c;

    const pop = `<b>${f.nombre}</b><br>${f.direccion}<br>${getPhoneLink(f)}<br><a href="${getGoogleMapsLink(f.direccion)}" target="_blank" class="gmaps-link">Google Maps</a>`;

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

function getPhoneLink(f) {
  const tClean = limpiarTelefono(f.telefono);
  const phoneIcon = getPhoneIcon();
  return tClean ? `<a href="tel:${tClean}" class="phone-link" onclick="event.stopPropagation();">${phoneIcon} ${f.telefono}</a>` : `<span class="phone-link">${phoneIcon} Sin teléfono</span>`;
}

function getGoogleMapsLink(direccion) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion + ', Mar del Plata')}`;
}

function getPhoneIcon() {
  return `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`;
}

// Exportar mapas y marcadores para usar en ui.js
export { mapDesktop, mapMobile, markersDesktop, markersMobile };
