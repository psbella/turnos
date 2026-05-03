# 💊 Farmacias de Turno MDP v2.0

**Aplicación web progresiva (PWA) para consultar farmacias de turno en Mar del Plata, Argentina.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8)](https://web.dev/progressive-web-apps/)
[![GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-blue)](https://pages.github.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-DNS-F38020?logo=cloudflare&logoColor=white)](https://cloudflare.com)
[![Google AdSense](https://img.shields.io/badge/AdSense-4285F4?logo=googleadsense&logoColor=white)](https://adsense.google.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/)
[![JSON](https://img.shields.io/badge/JSON-000000?logo=json&logoColor=white)](https://www.json.org/)
[![Google Fonts](https://img.shields.io/badge/Google%20Fonts-4285F4?logo=googlefonts&logoColor=white)](https://fonts.google.com/)
[![SVG](https://img.shields.io/badge/SVG-FFB13B?logo=svg&logoColor=white)](https://www.w3.org/Graphics/SVG/)
[![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)](https://git-scm.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)

---

## 📱 Demo

**Farmacias de Turno MDP** es una aplicación web progresiva (PWA) que permite consultar de forma clara y rápida qué farmacia está de turno en Mar del Plata. Con mapa interactivo, modo claro/oscuro y diseño responsive.

[🌐 Visitar la aplicación](https://farmaciasmdp.com.ar)

---

## ✨ Características principales

- **🗺️ Mapa interactivo**: Ubicación de cada farmacia con marcadores personalizados (Leaflet + OpenStreetMap)
- **🔄 Sistema de turnos automático**: Calcula matemáticamente qué grupo de farmacias está de turno cada día
- **📱 Totalmente responsive**: Diseño adaptado a celulares, tablets y computadoras
- **🌙 Modo claro/oscuro**: Cambia el tema según tu preferencia o la hora del día
- **📲 Instalable (PWA)**: Podés agregar la app a la pantalla de inicio de tu celular
- **♿ Accesible**: Navegación por teclado y etiquetas ARIA para lectores de pantalla
- **🔒 Privacidad**: No recopila datos personales. Política de privacidad incluida
- **📊 SEO optimizado**: Open Graph, Twitter Cards, Schema.org, sitemap y robots.txt
- **🏪 Ver todas**: Directorio completo de farmacias de Mar del Plata

---

## 🏗️ Arquitectura (v2.0)

A partir de la versión 2.0, el código fue refactorizado a una **arquitectura modular**, mejorando mantenibilidad y escalabilidad.

```
├── index.html              # Punto de entrada
├── style.css               # Estilos globales
├── sw.js                   # Service Worker
├── manifest.json           # PWA manifest
├── db.json                 # Base de datos de farmacias
├── config.json             # Configuración (fecha inicio)
├── js/
│   ├── main.js             # Punto de entrada JS (coordina módulos)
│   ├── config.js           # Configuración y variables globales
│   ├── data.js             # Carga de datos y lógica de ciclos
│   ├── maps.js             # Mapas, marcadores y ubicaciones
│   ├── ui.js               # Renderizado de interfaz y tarjetas
│   ├── theme.js            # Tema claro/oscuro
│   └── install.js          # Instalación PWA (iOS y Android)
├── privacidad.html         # Política de privacidad
├── terminos.html           # Términos y condiciones
├── sitemap.xml             # Mapa del sitio para SEO
├── robots.txt              # Instrucciones para buscadores
└── [íconos]                # icon-16.png, icon-32.png, icon-48.png, icon-96.png, icon-512.png
```


### Responsabilidades de cada módulo

| Módulo | Responsabilidad |
|--------|----------------|
| `main.js` | Orquesta la inicialización de todos los módulos |
| `config.js` | Maneja configuración (zona horaria, hora de cambio, fecha base) |
| `data.js` | Carga `db.json`, calcula ciclo actual, exporta datos |
| `maps.js` | Inicializa mapas, agrega/limpia marcadores |
| `ui.js` | Renderiza lista de farmacias, maneja interacciones |
| `theme.js` | Controla tema claro/oscuro (automático y manual) |
| `install.js` | Maneja instalación PWA en Android e iOS |

---

## 🧠 ¿Cómo funciona la rotación de turnos?

El Colegio de Farmacéuticos de General Pueyrredon organiza las farmacias en **16 grupos rotativos** (más un grupo de farmacias extras). La aplicación replica esta lógica:

1. **Fecha base**: Se define en `config.json` (`FECHA_INICIO_CICLO_1`)
2. **Cálculo diario**: Se calculan los días desde la fecha base y se determina qué grupo toca
3. **Presentación**: La app consulta `db.json` y muestra el grupo correspondiente

Esto asegura que la información funcione sin conexión (los datos se cachean localmente).

---

## 🛠️ Instalación y pruebas locales

```bash
# 1. Clonar el repositorio
git clone https://github.com/psbella/turnos.git

# 2. Entrar en la carpeta
cd turnos

# 3. Iniciar un servidor local (opcional)
# Usando Python:
python -m http.server 8000

# Usando VS Code Live Server:
# Click derecho en index.html → "Open with Live Server"


# 4. Abrir el navegador en http://localhost:8000
Nota: El Service Worker requiere HTTPS o localhost para funcionar correctamente.

```

## 📦 Dependencias

Librería	Uso	CDN
Leaflet	Mapas interactivos	https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/
Google Fonts	Fuentes (Bebas Neue, Nunito)	https://fonts.googleapis.com/
No requiere instalación de paquetes npm ni build steps.

## 🔧 Configuración

config.json
json
{
  "FECHA_INICIO_CICLO_1": "2026-04-26T09:00:00-03:00"
}
FECHA_INICIO_CICLO_1: Fecha y hora de inicio del ciclo 1 (formato ISO 8601)

db.json
Estructura principal:

json
{
  "1": [ ... ],
  "2": [ ... ],
  ...
  "16": [ ... ],
  "farmacias_extra": [ ... ]
}
Cada farmacia tiene:

nombre (string)

direccion (string)

telefono (string)

lat (float, opcional)

lng (float, opcional)

## 🚀 Despliegue

El sitio está hosteado en GitHub Pages con dominio propio y DNS gestionado por Cloudflare.

Pasos para desplegar tu propia versión:
Forkeá el repositorio

Activá GitHub Pages en Settings → Pages (branch main, carpeta /)

(Opcional) Configurá tu dominio personalizado

Asegurate de que sw.js tenga los recursos correctos

## 📊 SEO y Meta Tags

El sitio incluye:

Open Graph (Facebook, WhatsApp, LinkedIn)

Twitter Cards (vista previa en Twitter/X)

Schema.org (datos estructurados para Google)

sitemap.xml y robots.txt

Metaetiquetas geo (para búsquedas locales)

Canonical URL (evita duplicados)

## 🧪 Tecnologías utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Mapas** | Leaflet + OpenStreetMap |
| **PWA** | Service Worker, Web App Manifest |
| **Hosting** | GitHub Pages + dominio propio |
| **DNS / Seguridad** | Cloudflare |
| **Publicidad** | Google AdSense |
| **SEO** | Open Graph, Twitter Cards, Schema.org |
| **Control de versiones** | Git + GitHub |
| **Fuentes** | Google Fonts (Bebas Neue, Nunito) |
| **Íconos** | SVG nativos |

---

## 📄 Licencia

Este proyecto está bajo la licencia **CC BY-NC 4.0** (Creative Commons - Atribución - No Comercial).

[![CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](https://creativecommons.org/licenses/by-nc/4.0/)

## 👤 Autor
Pablo Bella

Email: pablo.s.bella@gmail.com

GitHub: @psbella

## 📝 Changelog

**v2.0 (2026-05-03)**

✅ Refactorización completa a arquitectura modular

✅ Separado app.js en 7 módulos especializados

✅ Corregido error de importación de limpiarTelefono

✅ Agregado script de Leaflet JS en index.html

✅ Eliminadas referencias a window.xxx

✅ Mejorada estrategia de caché para JSON

✅ Externalizada fecha base a config.json

✅ Mejorado "Ver todas" para mostrar todas las farmacias

**v1.0 (2026-04-26)**

✅ Lanzamiento inicial

✅ PWA funcional

✅ Mapa interactivo

✅ Modo claro/oscuro

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, abrí un issue primero para discutir qué te gustaría modificar.

Forkeá el proyecto

Creá tu rama (git checkout -b feature/AmazingFeature)

Commitear cambios (git commit -m 'Add some AmazingFeature')

Pushear a la rama (git push origin feature/AmazingFeature)

Abrí un Pull Request

## 💬 Contacto

¿Tenés una farmacia y querés aparecer en el listado? ¿Encontraste un error? ¿Sugerencia?

- 📧 [pablo.s.bella@gmail.com](mailto:pablo.s.bella@gmail.com)
- 🐙 [GitHub: @psbella](https://github.com/psbella)
- 🌐 [farmaciasmdp.com.ar](https://farmaciasmdp.com.ar)

*"El título no hace el código. Las ganas, sí."*
