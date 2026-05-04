# 💊 Farmacias de Turno MDP

**Aplicación web para consultar farmacias de turno en Mar del Plata, Argentina.**

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

**Farmacias de Turno MDP** es una aplicación web progresiva (PWA) que permite consultar de forma clara y rápida qué farmacia está de turno en Mar del Plata. Con un mapa interactivo, modo claro/oscuro y diseño responsive.

[🌐 Visitar la aplicación](https://farmaciasmdp.com.ar)

---

### ✨ Características principales

- **🗺️ Mapa interactivo**: Ubicación de cada farmacia con marcadores personalizados (Leaflet + OpenStreetMap)
- **🔄 Sistema de turnos automático**: Calcula matemáticamente qué grupo de farmacias está de turno cada día
- **📱 Totalmente responsive**: Diseño adaptado a celulares, tablets y computadoras
- **🌙 Modo claro/oscuro**: Cambia el tema según tu preferencia o la hora del día
- **📲 Instalable (PWA)**: Podés agregar la app a la pantalla de inicio de tu celular
- **♿ Accesible**: Navegación por teclado y etiquetas ARIA para lectores de pantalla
- **🔒 Privacidad**: No recopila datos personales. Política de privacidad y términos incluidos
- **📊 SEO optimizado**: Open Graph, Twitter Cards, Schema.org, sitemap y robots.txt

---

## 🚀 Tech Stack

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Mapas** | Leaflet + OpenStreetMap |
| **PWA** | Service Worker, Web App Manifest |
| **Hosting** | GitHub Pages + dominio propio |
| **DNS / Seguridad** | Cloudflare |
| **Publicidad** | Google AdSense |
| **SEO** | Open Graph, Twitter Cards, Schema.org, sitemap.xml, robots.txt |
| **Automatización** | GitHub Actions |
| **Control de versiones** | Git + GitHub |
| **IDE** | Phoenix Code / VS Code / Notepad++ |
| **Fuentes** | Google Fonts (Bebas Neue, Nunito) |
| **Íconos** | SVG nativos |
| **Estructura de datos** | JSON (manual + lógica de ciclos) |
| **Monitoreo** | Cloudflare Analytics, Google Search Console, Bing Webmaster Tools |
| **Herramientas** | Consola de desarrollador, Lighthouse |

---

## 🛠️ Herramientas utilizadas

| Herramienta | Uso |
|-------------|-----|
| **GitHub Actions** | Monitoreo automático de actividad sospechosa (scraping) |
| **Consola de desarrollador** | Depuración y pruebas de lógica de ciclos |
| **Google Search Console** | Verificación de indexación y SEO |
| **Bing Webmaster Tools** | Monitoreo en buscadores alternativos |
| **Cloudflare Analytics** | Estadísticas de visitas (privacy-first) |
| **Lighthouse** | Auditoría de rendimiento y buenas prácticas |

---

## 📐 Metodologías y prácticas

- **Accesibilidad**: Roles ARIA, navegación por teclado (WCAG AAA)
- **Diseño responsive**: Mobile-first, breakpoints adaptables
- **SEO optimizado**: Meta tags, datos estructurados (Schema.org)
- **Rendimiento**: Caché multi-capa con Service Worker
- **Privacidad**: Sin cookies propias, cumplimiento RGPD

---

## 🧠 ¿Cómo funciona la rotación de turnos?

El Colegio de Farmacéuticos de General Pueyrredon organiza las farmacias en **16 grupos rotativos**. La aplicación replica esta lógica sin hacer scraping:

1. **Fecha de inicio**: Se define un punto de partida (`FECHA_INICIO_CICLO_1 = 26 de abril de 2026`)
2. **Cálculo del ciclo**: Se calculan los días transcurridos desde la fecha de inicio y se determina qué grupo toca cada día
3. **Presentación**: La app consulta un archivo `db.json` que contiene todos los grupos y muestra el que corresponde

Esto asegura que la información funcione siempre, incluso sin conexión a internet (los datos se cachean).

---

## 🛠️ Instalación y pruebas locales

Si querés correr el proyecto en tu computadora:

```bash
# 1. Clonar el repositorio
git clone https://github.com/psbella/turnos.git

# 2. Entrar en la carpeta del proyecto
cd turnos

# 3. Abrir el archivo index.html en tu navegador
# (podés usar una extensión como "Live Server" de VS Code)
