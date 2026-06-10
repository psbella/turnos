# Farmacias de Turno MDP

> PWA estática que calcula la rotación diaria de farmacias de turno en Mar del Plata, Argentina, mediante un modelo matemático determinístico. Sin backend, sin scraping, sin dependencias.

[![Version](https://img.shields.io/badge/version-2.0-blue)](https://farmaciasmdp.com.ar/)
[![Stable](https://img.shields.io/badge/stable-%E2%9C%93-brightgreen)](https://github.com/psbella/turnos)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](https://creativecommons.org/licenses/by-nc/4.0/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8)](https://web.dev/progressive-web-apps/)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)](https://github.com/psbella/turnos)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-blue)](https://pages.github.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-DNS-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

**→ [farmaciasmdp.com.ar](https://farmaciasmdp.com.ar)**

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Cómo funciona la rotación](#cómo-funciona-la-rotación)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Stack tecnológico](#stack-tecnológico)
- [Flujo de usuario](#flujo-de-usuario)
- [Modelo de datos](#modelo-de-datos)
- [Estrategia de caché (PWA)](#estrategia-de-caché-pwa)
- [Instalación local](#instalación-local)
- [Proyectos relacionados](#proyectos-relacionados)
- [Licencia](#licencia)

---

## Descripción

El Colegio de Farmacéuticos de General Pueyrredon organiza las farmacias de Mar del Plata en **16 grupos rotativos**. Esta aplicación replica esa lógica de forma completamente local: dado un punto de ancla conocido (`FECHA_INICIO_CICLO_1`) y la fecha actual, se calcula el grupo de turno con una operación de módulo. No hay llamadas a APIs externas para determinar el turno.

La app es instalable como PWA, funciona offline gracias a un Service Worker y está optimizada para SEO con Schema.org, Open Graph y sitemap.

---

## Cómo funciona la rotación

```
grupo_hoy = Math.floor( diasDesde(FECHA_INICIO_CICLO_1, ahora) ) % 16
```

El cambio de turno ocurre a las **09:00 hs (UTC-3)**. Si el usuario consulta antes de esa hora, se usa la fecha del día anterior.

```mermaid
flowchart TD
    A([Usuario abre la app]) --> B[Obtiene fecha y hora actual]
    B --> C[Lee FECHA_INICIO_CICLO_1\ndesde config.json]
    C --> D{¿Hora actual < 09:00?}
    D -- Sí --> E[Retrocede un día]
    D -- No --> F[Usa fecha de hoy]
    E --> G[Calcula días transcurridos\ndesde la fecha ancla]
    F --> G
    G --> H["grupo = Math.floor(días) % 16"]
    H --> I[Lee grupo desde db.json]
    I --> J[Renderiza lista de farmacias]
    I --> K[Renderiza marcadores en mapa]
    J --> L([App lista ✓])
    K --> L
```

---

## Arquitectura del sistema

La aplicación es **100% estática**: no existe servidor de aplicaciones. GitHub Pages sirve los archivos, Cloudflare actúa como CDN y proxy DNS, y toda la lógica de negocio corre en el navegador del usuario.

```mermaid
graph TB
    subgraph user["Cliente"]
        direction TB
        SW["Service Worker\n(caché offline)"]
        APP["JS ES6 Modules\n(lógica de rotación)"]
        MAP["Leaflet\n(mapa interactivo)"]
    end

    subgraph infra["Infraestructura"]
        CF["Cloudflare\nDNS + CDN"]
        GHP["GitHub Pages\n(hosting estático)"]
    end

    subgraph assets["Assets servidos"]
        HTML["index.html"]
        CSS["style.css"]
        JSMOD["js/"]
        DB["db.json"]
        CFG["config.json"]
    end

    subgraph third["Servicios externos"]
        OSM["OpenStreetMap\n(tiles del mapa)"]
        GF["Google Fonts"]
        ADS["Google AdSense"]
    end

    VISITOR([Visitante]) --> CF
    CF --> GHP
    GHP --> assets
    assets --> APP
    APP --> MAP
    MAP --> OSM
    SW -.->|"Cache First"| assets
    APP --> GF
    APP --> ADS
```

---

## Estructura del proyecto

```
turnos/
├── index.html                  # Entry point — contenido SSG para SEO + bootstrap JS
├── style.css                   # Estilos globales con CSS custom properties (dark/light)
├── sw.js                       # Service Worker — estrategia de caché multi-capa
├── manifest.json               # Web App Manifest (PWA)
│
├── config.json                 # Fecha ancla del ciclo
│                               #   { "FECHA_INICIO_CICLO_1": "2026-04-26T09:00:00-03:00" }
│
├── db.json                     # Base de datos de farmacias
│                               #   { "1": [ {nombre, direccion, telefono, lat, lng}, ... ],
│                               #     ...
│                               #    "16": [ ... ] }
│
├── js/
│   └── main.js                 # Módulo principal — inicializa UI, mapa y rotación
│
├── admin-map.html              # Herramienta interna para auditar coordenadas
├── privacidad.html             # Política de privacidad
├── terminos.html               # Términos de uso
│
├── sitemap.xml                 # Sitemap para crawlers
├── robots.txt                  # Directivas de indexación
├── ads.txt                     # Autorización Google AdSense
├── CNAME                       # → farmaciasmdp.com.ar
│
├── icon-16.png
├── icon-32.png
├── icon-48.png
├── icon-96.png
└── icon-512.png                # Ícono PWA splash
```

---

## Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Markup | HTML5 | Contenido SSG inline para SEO; Schema.org embebido |
| Estilos | CSS3 + Custom Properties | Dark/light mode sin JS, mobile-first |
| Lógica | JavaScript ES6+ Modules | Sin frameworks, sin bundler |
| Mapas | Leaflet 1.x + OpenStreetMap | Marcadores SVG personalizados |
| PWA | Service Worker + Web App Manifest | Cache API, instalable |
| Hosting | GitHub Pages | Deploy en cada push a `main` |
| CDN / DNS | Cloudflare | HTTPS, caché edge, analytics |
| SEO | Schema.org · Open Graph · Twitter Cards | Structured data + sitemap.xml |
| Fuentes | Google Fonts | Bebas Neue (display) + Nunito (body) |
| Publicidad | Google AdSense | — |
| Monitoreo | Google Search Console · Cloudflare Analytics | Sin cookies propias |

---

## Flujo de usuario

### Primer acceso (red disponible)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant B as Navegador
    participant SW as Service Worker
    participant CF as Cloudflare / GH Pages

    U->>B: farmaciasmdp.com.ar
    B->>CF: GET index.html
    CF-->>B: 200 OK
    B->>SW: Registro del SW
    SW->>CF: Precachea config.json, db.json, css, js
    CF-->>SW: Assets cacheados ✓
    B->>B: Ejecuta js/main.js
    B->>B: Calcula grupo del día
    B->>B: Renderiza lista + mapa
    B-->>U: App lista
```

### Accesos siguientes (con o sin red)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant B as Navegador
    participant SW as Service Worker

    U->>B: farmaciasmdp.com.ar
    B->>SW: Request interceptado
    SW-->>B: Sirve desde caché ⚡
    B->>B: Calcula grupo del día
    B-->>U: App lista (sin red)
```

---

## Modelo de datos

```mermaid
erDiagram
    CONFIG {
        string FECHA_INICIO_CICLO_1 "ISO 8601 con offset -03:00"
    }

    GRUPO {
        string id "Valores: '1' a '16'"
        int total_farmacias
    }

    FARMACIA {
        string nombre
        string direccion
        string telefono
        float  lat "nullable — sin coordenadas: aparece en lista, no en mapa"
        float  lng "nullable"
    }

    CONFIG ||--o{ GRUPO : "ancla el ciclo de"
    GRUPO  ||--|{ FARMACIA : "contiene"
```

**Notas sobre la calidad de los datos:**

- `MITRE (Colón 2690)` aparece en los 16 grupos — es farmacia de turno permanente.
- Al menos una farmacia tiene `lat: null` (grupo 10) — se muestra en la lista pero no en el mapa.

---

## Estrategia de caché (PWA)

```mermaid
flowchart LR
    REQ([Request]) --> SW{Service Worker}

    SW -->|"HTML · CSS · JS · íconos"| C1["Cache First\n(assets estáticos)"]
    SW -->|"config.json · db.json"| C2["Network First\n(datos)"]
    SW -->|"Tiles OSM"| C3["Stale While Revalidate\n(mapa)"]

    C1 --> RES([Respuesta])
    C2 --> RES
    C3 --> RES
```

El manifest declara `display: standalone` y `start_url: /`, por lo que la app se comporta como nativa una vez instalada desde el navegador.

---


## Instalación local

> **Requisito**: servir con un servidor HTTP local. Los módulos ES6 y el Service Worker no funcionan con `file://`.

```bash
# Clonar el repositorio
git clone https://github.com/psbella/turnos.git
cd turnos

# Opción A — Python (sin instalar nada)
python3 -m http.server 8080

# Opción B — Node.js
npx serve .

# Opción C — VS Code + extensión Live Server
# Clic derecho en index.html → "Open with Live Server"
```

Luego abrir `http://localhost:8080` en el navegador.

---

## Proyectos relacionados

| Proyecto | Descripción |
|---|---|
| [remedi.ar](https://remedi.ar) | Buscador de precios de medicamentos en farmacias de Argentina |

---

## Licencia

Distribuido bajo [Creative Commons BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
Podés usar y adaptar el código con atribución, pero no con fines comerciales.

---

<div align="center">
  Hecho en Mar del Plata, Argentina
</div>
