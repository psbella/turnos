# 💊 Farmacias de Turno MDP

**Aplicación web para consultar farmacias de turno en Mar del Plata, Argentina.**

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-blue)](https://pages.github.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8)](https://web.dev/progressive-web-apps/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/es/docs/Web/JavaScript)

---

## 📱 Demo

**Farmacias de Turno MDP** es una aplicación web progresiva (PWA) que permite consultar de forma clara y rápida qué farmacia está de turno en Mar del Plata. Con un mapa interactivo y modo claro/oscuro.

[🌐 Visitar la aplicación](https://farmaciasmdp.com.ar)

---

### ✨ Características principales

- **🗺️ Mapa interactivo**: Ubicación de cada farmacia con marcadores personalizados.
- **🔄 Sistema de turnos automático**: Calcula matemáticamente qué grupo de farmacias está de turno cada día.
- **📱 Totalmente responsive**: Diseño adaptado a celulares, tablets y computadoras.
- **🌙 Modo claro/oscuro**: Cambia el tema según tu preferencia o la hora del día.
- **📲 Instalable (PWA)**: Podés agregar la app a la pantalla de inicio de tu celular.
- **♿ Accesible**: Navegación por teclado y etiquetas ARIA para lectores de pantalla.
- **🔒 Privacidad**: No recopila datos personales. Política de privacidad incluida.

---

## 🚀 Tech Stack

| Categoría | Tecnologías |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Mapas** | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) |
| **PWA** | Service Worker, Web App Manifest |
| **Hosting** | [GitHub Pages](https://pages.github.com/) + Dominio propio |
| **Control de Versiones** | Git + GitHub |
| **IDE** | Phoenix Code / VS Code |
| **Herramientas** | SVG nativos, Google Fonts |

---

## 🧠 ¿Cómo funciona la rotación de turnos?

El Colegio de Farmacéuticos de General Pueyrredon organiza las farmacias en **16 grupos rotativos**. La aplicación replica esta lógica sin hacer scraping:

1.  **Fecha de inicio**: Se define un punto de partida (`FECHA_INICIO_GRUPO_1`).
2.  **Cálculo del ciclo**: Se calculan los días transcurridos desde la fecha de inicio y se determina qué grupo toca cada día.
3.  **Presentación**: La app consulta un archivo `db.json` que contiene todos los grupos y muestra el que corresponde.

Esto asegura que la información funcione siempre, incluso sin conexión a internet (los datos se cachean).

---

## 🛠️ Instalación y pruebas locales (opcional)

Si querés correr el proyecto en tu computadora:

```bash
# 1. Clonar el repositorio
git clone https://github.com/psbella/turnos.git

# 2. Entrar en la carpeta del proyecto
cd turnos

# 3. Abrir el archivo index.html en tu navegador
# (podés usar una extensión como "Live Server" de VS Code)