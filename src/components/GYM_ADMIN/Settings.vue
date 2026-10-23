<template>
  <HeadingGYM_ADMIN>
    <main class="main-content">
      <div class="header-section">
        <div class="header-titles">
          <h1 class="main-title">{{ t('configPageTitle') }} <span class="highlight">{{ t('configPageHighlight') }}</span></h1>
          <p class="subtitle">{{ t('configPageSubtitle') }}</p>
        </div>
        <button id="btn-guardar-cambios" class="btn-primary" @click="guardarCambios">
          <span>{{ t('saveChangesBtn') }}</span>
        </button>
      </div>

      <section class="form-panel" id="panel-temas">
        <div class="panel-header">
          <h2>{{ t('themesTitle') }}</h2>
          <button id="btn-reset-colores" class="btn-reset-colors" @click="restaurarColoresPorDefecto" :title="t('resetColorsTooltip')">
            {{ t('resetColorsBtn') }}
          </button>
        </div>

        <div class="presets-grid">
          <button
            v-for="(preset, key) in colorPresets"
            :key="key"
            :id="`preset-${key}`"
            class="preset-card"
            :class="{ 'is-active': presetActivo === key }"
            :style="{
              '--accent': preset.colors.highlight,
              '--bg1': preset.colors.tarjetas,
              '--bg2': preset.colors.headingBg,
            }"
            @click="aplicarPreset(key)"
          >
            <span v-if="presetActivo === key" class="preset-check">✓</span>

            <span class="preset-swatches">
              <span class="swatch" :style="{ background: preset.colors.botones }"></span>
              <span class="swatch" :style="{ background: preset.colors.highlight }"></span>
              <span class="swatch" :style="{ background: preset.colors.tarjetas }"></span>
              <span class="swatch" :style="{ background: preset.colors.titulos }"></span>
            </span>

            <span class="preset-label">{{ preset.label }}</span>
          </button>
        </div>
      </section>

      <section class="form-panel" id="panel-general">
        <div class="panel-header">
          <h2>{{ t('generalSectionTitle') }}</h2>
        </div>

        <div class="config-row" id="row-notificaciones">
          <div class="config-info">
            <label for="input-notificaciones">{{ t('notificationsLabel') }}</label>
            <p>{{ t('notificationsDesc') }}</p>
          </div>

          <label
            class="switch-container"
            :title="t('notificationsToggleTitle')"
            for="input-notificaciones"
          >
            <input
              type="checkbox"
              id="input-notificaciones"
              v-model="settings.notificaciones"
              class="toggle-input"
            >
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="config-row" id="row-tutorial">
          <div class="config-info">
            <label for="input-tutorial">{{ t('tutorialLabel') }}</label>
            <p>{{ t('tutorialDesc') }}</p>
          </div>

          <label
            class="switch-container"
            :title="t('tutorialToggleTitle')"
            for="input-tutorial"
          >
            <input
              type="checkbox"
              id="input-tutorial"
              v-model="settings.tutorial"
              class="toggle-input"
            >
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="config-row" id="row-idioma">
          <div class="config-info">
            <label for="select-idioma">{{ t('interfaceLanguageLabel') }}</label>
            <p>{{ t('interfaceLanguageDesc') }}</p>
          </div>

          <div class="select-wrapper">
            <select
              id="select-idioma"
              v-model="settings.idioma"
              @change="cambiarIdioma"
              class="font-select"
            >
              <option value="es">{{ t('spanishOption') }}</option>
              <option value="en">{{ t('englishOption') }}</option>
            </select>
          </div>
        </div>
      </section>

      <section class="form-panel" id="panel-apariencia-avanzada">
        <div class="panel-header">
          <h2>{{ t('advancedAppearanceTitle') }}</h2>
        </div>

        <div class="config-row column-mobile" id="row-paleta-colores">
          <div class="config-info">
            <label>{{ t('detailedPaletteLabel') }}</label>
            <p>{{ t('detailedPaletteDesc') }}</p>
          </div>

          <div class="color-grid">
            <div class="color-card" id="container-color-headingBg">
              <span class="color-label">{{ t('colorHeadingSup') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-headingBg"
                  v-model="settings.colors.headingBg"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.headingBg }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-tablas">
              <span class="color-label">{{ t('colorTablas') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-tablas"
                  v-model="settings.colors.tablas"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.tablas }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-interfaz">
              <span class="color-label">{{ t('colorInterfaz') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-interfaz"
                  v-model="settings.colors.interfaz"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.interfaz }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-botones">
              <span class="color-label">{{ t('colorBotones') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-botones"
                  v-model="settings.colors.botones"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.botones }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-tarjetas">
              <span class="color-label">{{ t('colorTarjetas') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-tarjetas"
                  v-model="settings.colors.tarjetas"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.tarjetas }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-titulos">
              <span class="color-label">{{ t('colorTitulares') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-titulos"
                  v-model="settings.colors.titulos"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.titulos }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-highlight">
              <span class="color-label">{{ t('colorHighlight') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-highlight"
                  v-model="settings.colors.highlight"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.highlight }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-etiquetas">
              <span class="color-label">{{ t('colorEtiquetas') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-etiquetas"
                  v-model="settings.colors.etiquetas"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.etiquetas }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-textoGeneral">
              <span class="color-label">{{ t('colorTextoGeneral') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-textoGeneral"
                  v-model="settings.colors.textoGeneral"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.textoGeneral }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-textoBotones">
              <span class="color-label">{{ t('colorTextoBotones') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-textoBotones"
                  v-model="settings.colors.textoBotones"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.textoBotones }"
                ></div>
              </div>
            </div>

            <div class="color-card" id="container-color-svgColor">
              <span class="color-label">{{ t('colorSvgIcons') }}</span>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  id="color-svgColor"
                  v-model="settings.colors.svgColor"
                >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: settings.colors.svgColor }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="config-row" id="row-densidad">
          <div class="config-info">
            <label for="select-densidad">{{ t('interfaceDensityLabel') }}</label>
            <p>{{ t('interfaceDensityDesc') }}</p>
          </div>

          <div class="select-wrapper">
            <select
              id="select-densidad"
              v-model="settings.densidad"
              class="font-select"
            >
              <option value="espacioso">{{ t('densitySpacious') }}</option>
              <option value="normal">{{ t('densityNormal') }}</option>
              <option value="compacto">{{ t('densityCompact') }}</option>
            </select>
          </div>
        </div>

        <div class="config-row" id="row-border-radius">
          <div class="config-info">
            <label for="select-border-radius">{{ t('borderStyleLabel') }}</label>
            <p>{{ t('borderStyleDesc') }}</p>
          </div>

          <div class="select-wrapper">
            <select
              id="select-border-radius"
              v-model="settings.borderRadius"
              class="font-select"
            >
              <option value="8px">{{ t('borderSquare') }}</option>
              <option value="16px">{{ t('borderSmooth') }}</option>
              <option value="24px">{{ t('borderRounded') }}</option>
            </select>
          </div>
        </div>
      </section>

      <section class="form-panel" id="panel-exportacion">
        <div class="panel-header">
          <h2>{{ t('exportSectionTitle') }}</h2>
        </div>

        <div class="config-row">
          <div class="config-info">
            <label>{{ t('exportFormatLabel') }}</label>
            <p>{{ t('exportFormatDesc') }}</p>
          </div>

          <div class="export-actions">
            <button
              id="btn-export-excel"
              class="btn-export excel"
              @click="exportar('excel')"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="8" y1="13" x2="16" y2="13"></line>
                <line x1="8" y1="17" x2="16" y2="17"></line>
              </svg>
              Excel
            </button>

            <button
              id="btn-export-yml"
              class="btn-export yml"
              @click="exportar('yml')"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              YML
            </button>
          </div>
        </div>
      </section>

      <transition name="fade">
        <div
          v-if="toast.visible"
          id="toast-notification-box"
          class="toast-notification"
        >
          {{ toast.message }}
        </div>
      </transition>
    </main>
  </HeadingGYM_ADMIN>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useLang } from './useLang.js';
import HeadingGYM_ADMIN from './HeadingGYM_ADMIN.vue';

const { setLang } = useLang();

const translations = {
  es: {
    configPageTitle: "Configuración",

    configPageHighlight: "de la Página",
    configPageSubtitle: "Personaliza tu sitio web a tu manera.",
    saveChangesBtn: "Guardar Cambios",
    themesTitle: "Temas y Combinaciones Rápidas (30 Estilos)",
    resetColorsBtn: "Restaurar Originales",
    resetColorsTooltip: "Volver a los colores iniciales",
    generalSectionTitle: "General",
    notificationsLabel: "Notificaciones",
    notificationsDesc: "Configura tus preferencias de notificación.",
    notificationsToggleTitle: "Activar/Desactivar notificaciones",
    tutorialLabel: "Tutorial",
    tutorialDesc: "Aprende a utilizar todas las funcionalidades.",
    tutorialToggleTitle: "Activar/Desactivar tutorial",
    interfaceLanguageLabel: "Idioma de la Interfaz",
    interfaceLanguageDesc: "Selecciona el idioma principal del sistema.",
    spanishOption: "Español",
    englishOption: "English (Inglés)",
    advancedAppearanceTitle: "Apariencia Avanzada",
    detailedPaletteLabel: "Paleta de Colores Detallada",
    detailedPaletteDesc: "Personaliza cada componente de la interfaz y el Heading de forma independiente.",
    colorHeadingSup: "Heading Sup.",
    colorTablas: "Tablas",
    colorInterfaz: "Interfaz",
    colorBotones: "Botones Fondo",
    colorTarjetas: "Tarjetas",
    colorTitulares: "Titulares",
    colorHighlight: "Highlight",
    colorEtiquetas: "Etiquetas",
    colorTextoGeneral: "Textos Gr.",
    colorTextoBotones: "Txt Botones",
    colorSvgIcons: "Iconos SVG",
    interfaceDensityLabel: "Densidad de la Interfaz",
    interfaceDensityDesc: "Elige el espaciado general de los elementos.",
    densitySpacious: "Espacioso (Cómodo)",
    densityNormal: "Normal (Estándar)",
    densityCompact: "Compacto (Más datos)",
    borderStyleLabel: "Estilo de Bordes",
    borderStyleDesc: "Define la curvatura de los paneles y botones.",
    borderSquare: "Cuadrado (Moderno)",
    borderSmooth: "Suave (Estándar)",
    borderRounded: "Muy Redondeado",
    exportSectionTitle: "Exportación de datos",
    exportFormatLabel: "Formato de exportación",
    exportFormatDesc: "Formato al descargar bitácoras y respaldos.",
    toastColorsRestored: "Colores restaurados y guardados.",
    toastPresetApplied: "Tema combinado '{label}' aplicado y guardado.",
    toastGYM_ADMINSaved: "Configuración de GYM_ADMIN guardada globalmente.",
    toastLocalSaved: "Configuración guardada localmente.",
    toastSaveError: "Error al guardar la configuración.",
    toastDownloading: "Descargando archivo {tipo}..."
  },

  en: {
    configPageTitle: "Page",
    configPageHighlight: "Configuration",
    configPageSubtitle: "Customize your website your way.",
    saveChangesBtn: "Save Changes",
    themesTitle: "Themes and Quick Combinations (30 Styles)",
    resetColorsBtn: "Restore Originals",
    resetColorsTooltip: "Return to initial colors",
    generalSectionTitle: "General",
    notificationsLabel: "Notifications",
    notificationsDesc: "Configure your notification preferences.",
    notificationsToggleTitle: "Enable/Disable notifications",
    tutorialLabel: "Tutorial",
    tutorialDesc: "Learn how to use all functionalities.",
    tutorialToggleTitle: "Enable/Disable tutorial",
    interfaceLanguageLabel: "Interface Language",
    interfaceLanguageDesc: "Select the main system language.",
    spanishOption: "Spanish",
    englishOption: "English",
    advancedAppearanceTitle: "Advanced Appearance",
    detailedPaletteLabel: "Detailed Color Palette",
    detailedPaletteDesc: "Customize each interface component and the Heading independently.",
    colorHeadingSup: "Heading Sup.",
    colorTablas: "Tables",
    colorInterfaz: "Interface",
    colorBotones: "Buttons Bg",
    colorTarjetas: "Cards",
    colorTitulares: "Headlines",
    colorHighlight: "Highlight",
    colorEtiquetas: "Tags",
    colorTextoGeneral: "Gen. Text",
    colorTextoBotones: "Btn Text",
    colorSvgIcons: "SVG Icons",
    interfaceDensityLabel: "Interface Density",
    interfaceDensityDesc: "Choose the general spacing of elements.",
    densitySpacious: "Spacious (Comfortable)",
    densityNormal: "Normal (Standard)",
    densityCompact: "Compact (More data)",
    borderStyleLabel: "Border Style",
    borderStyleDesc: "Define the curvature of panels and buttons.",
    borderSquare: "Square (Modern)",
    borderSmooth: "Smooth (Standard)",
    borderRounded: "Fully Rounded",
    exportSectionTitle: "Data Export",
    exportFormatLabel: "Export Format",
    exportFormatDesc: "Format when downloading logs and backups.",
    toastColorsRestored: "Colors restored and saved.",
    toastPresetApplied: "Combined theme '{label}' applied and saved.",
    toastGYM_ADMINSaved: "GYM_ADMIN configuration saved globally.",
    toastLocalSaved: "Configuration saved locally.",
    toastSaveError: "Error saving configuration.",
    toastDownloading: "Downloading {tipo} file..."
  }
};

const t = (key) => {
  return translations[settings.idioma]?.[key] || translations['es'][key] || key;
};

function safeJsonParse(raw, fallback = null) {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn(
      'localStorage corrupto, usando valores por defecto:',
      e
    );
    return fallback;
  }
}

const ROLE_KEY = 'user_role';

const claveColores = () => {
  const rol = (
    localStorage.getItem(ROLE_KEY) || ''
  ).toLowerCase();

  return `app-colors-${rol}`;
};

const claveRadius = () => {
  const rol = (
    localStorage.getItem(ROLE_KEY) || ''
  ).toLowerCase();

  return `app-radius-${rol}`;
};

const claveDensidad = () => {
  const rol = (
    localStorage.getItem(ROLE_KEY) || ''
  ).toLowerCase();

  return `app-densidad-${rol}`;
};

const defaultColors = {
  headingBg:    '#161726',  // --color-heading-bg
  tablas:       '#25283d',  // --color-tablas
  interfaz:     '#12121c',  // --bg-custom (fondo)
  botones:      '#e04a6d',  // --color-botones
  tarjetas:     '#1a1b2b',  // --bg-cards
  titulos:      '#fff7f1',  // --color-titulos
  highlight:    '#ffb27a',  // --color-highlight
  etiquetas:    '#f6e8df',  // --color-etiquetas
  textoGeneral: '#c9c5d3',  // --color-texto-general
  textoBotones: '#ffffff',  // --color-texto-botones
  svgColor:     '#ffc7a1'   // --color-svg
};

const colorPresets = {
  gymFemenino: {
    label: '🌸 Fit Femme (Gym)',
    colors: {
      headingBg: '#1f0d14',
      tablas: '#2a121b',
      interfaz: '#16080e',
      botones: '#db2777',
      tarjetas: '#200b12',
      titulos: '#fff1f2',
      highlight: '#f472b6',
      etiquetas: '#fbcfe8',
      textoGeneral: '#f472b6',
      textoBotones: '#ffffff',
      svgColor: '#f472b6'
    }
  },

  barbieVibe: {
    label: '💖 Barbie Power',
    colors: {
      headingBg: '#240615',
      tablas: '#3b0a22',
      interfaz: '#1c030f',
      botones: '#ec4899',
      tarjetas: '#2c071a',
      titulos: '#fdf2f8',
      highlight: '#f472b6',
      etiquetas: '#fbcfe8',
      textoGeneral: '#f472b6',
      textoBotones: '#ffffff',
      svgColor: '#f472b6'
    }
  },

  gymMasculino: {
    label: '🏋️‍♂️ Iron Masculino',
    colors: {
      headingBg: '#0d0d12',
      tablas: '#181822',
      interfaz: '#09090e',
      botones: '#2563eb',
      tarjetas: '#13131c',
      titulos: '#ffffff',
      highlight: '#3b82f6',
      etiquetas: '#f4f4f5',
      textoGeneral: '#a1a1aa',
      textoBotones: '#ffffff',
      svgColor: '#3b82f6'
    }
  },

  cyberpunk: {
    label: '⚡ Cyberpunk Blue',
    colors: {
      headingBg: '#0a0a14',
      tablas: '#16162b',
      interfaz: '#05050d',
      botones: '#f43f5e',
      tarjetas: '#0f0f1f',
      titulos: '#ffffff',
      highlight: '#f43f5e',
      etiquetas: '#e2e8f0',
      textoGeneral: '#94a3b8',
      textoBotones: '#ffffff',
      svgColor: '#f43f5e'
    }
  },

  emeraldMatrix: {
    label: '🟢 Emerald Matrix',
    colors: {
      headingBg: '#022c22',
      tablas: '#064e3b',
      interfaz: '#021a14',
      botones: '#059669',
      tarjetas: '#042f24',
      titulos: '#ecfdf5',
      highlight: '#34d399',
      etiquetas: '#a7f3d0',
      textoGeneral: '#6ee7b7',
      textoBotones: '#ffffff',
      svgColor: '#34d399'
    }
  },

  sunsetOrange: {
    label: '🌅 Sunset Orange',
    colors: {
      headingBg: '#2c1209',
      tablas: '#431407',
      interfaz: '#1c0b05',
      botones: '#f97316',
      tarjetas: '#260e05',
      titulos: '#fff7ed',
      highlight: '#fb923c',
      etiquetas: '#fed7aa',
      textoGeneral: '#fdba74',
      textoBotones: '#ffffff',
      svgColor: '#fb923c'
    }
  },

  royalPurple: {
    label: '👑 Royal Purple',
    colors: {
      headingBg: '#1e1b4b',
      tablas: '#312e81',
      interfaz: '#0f172a',
      botones: '#7c3aed',
      tarjetas: '#1e293b',
      titulos: '#f8fafc',
      highlight: '#a78bfa',
      etiquetas: '#ddd6fe',
      textoGeneral: '#cbd5e1',
      textoBotones: '#ffffff',
      svgColor: '#a78bfa'
    }
  },

  neonGlow: {
    label: '🧪 Neon Lime',
    colors: {
      headingBg: '#0f172a',
      tablas: '#1e293b',
      interfaz: '#090d16',
      botones: '#84cc16',
      tarjetas: '#111827',
      titulos: '#ffffff',
      highlight: '#a3e635',
      etiquetas: '#ecfccb',
      textoGeneral: '#9ca3af',
      textoBotones: '#000000',
      svgColor: '#a3e635'
    }
  },

  crimsonDark: {
    label: '🩸 Crimson Blood',
    colors: {
      headingBg: '#2b0b0b',
      tablas: '#451010',
      interfaz: '#1a0505',
      botones: '#dc2626',
      tarjetas: '#240a0a',
      titulos: '#fef2f2',
      highlight: '#f87171',
      etiquetas: '#fecaca',
      textoGeneral: '#fca5a5',
      textoBotones: '#ffffff',
      svgColor: '#f87171'
    }
  },

  arcticFrost: {
    label: '❄️ Arctic Frost',
    colors: {
      headingBg: '#082f49',
      tablas: '#0369a1',
      interfaz: '#021524',
      botones: '#0284c7',
      tarjetas: '#0c233b',
      titulos: '#f0f9ff',
      highlight: '#38bdf8',
      etiquetas: '#bae6fd',
      textoGeneral: '#7dd3fc',
      textoBotones: '#ffffff',
      svgColor: '#38bdf8'
    }
  },

  goldenLuxury: {
    label: '✨ Golden Luxury',
    colors: {
      headingBg: '#272007',
      tablas: '#42360a',
      interfaz: '#161203',
      botones: '#d97706',
      tarjetas: '#201a05',
      titulos: '#fefce8',
      highlight: '#fbbf24',
      etiquetas: '#fef08a',
      textoGeneral: '#fde047',
      textoBotones: '#ffffff',
      svgColor: '#fbbf24'
    }
  },

  midnightTeal: {
    label: '🌊 Midnight Teal',
    colors: {
      headingBg: '#042f2e',
      tablas: '#115e59',
      interfaz: '#021a19',
      botones: '#0d9488',
      tarjetas: '#082524',
      titulos: '#f0fdf4',
      highlight: '#2dd4bf',
      etiquetas: '#99f6e4',
      textoGeneral: '#5eead4',
      textoBotones: '#ffffff',
      svgColor: '#2dd4bf'
    }
  },

  cherryBlossom: {
    label: '🌸 Cherry Blossom',
    colors: {
      headingBg: '#2a0813',
      tablas: '#4c0f22',
      interfaz: '#19040b',
      botones: '#e11d48',
      tarjetas: '#220610',
      titulos: '#fff1f2',
      highlight: '#fb7185',
      etiquetas: '#fecdd3',
      textoGeneral: '#fda4af',
      textoBotones: '#ffffff',
      svgColor: '#fb7185'
    }
  },

  coffeeLatte: {
    label: '☕ Coffee Latte',
    colors: {
      headingBg: '#231815',
      tablas: '#3d2b25',
      interfaz: '#140e0c',
      botones: '#b45309',
      tarjetas: '#1c1310',
      titulos: '#fdf8f6',
      highlight: '#d97706',
      etiquetas: '#fde68a',
      textoGeneral: '#d1a18d',
      textoBotones: '#ffffff',
      svgColor: '#d97706'
    }
  },

  matrixHacker: {
    label: '💻 Matrix Hacker',
    colors: {
      headingBg: '#051c0d',
      tablas: '#0a361a',
      interfaz: '#020f07',
      botones: '#16a34a',
      tarjetas: '#06170b',
      titulos: '#f0fdf4',
      highlight: '#22c55e',
      etiquetas: '#bbf7d0',
      textoGeneral: '#4ade80',
      textoBotones: '#ffffff',
      svgColor: '#22c55e'
    }
  },

  deepSpace: {
    label: '🌌 Deep Space',
    colors: {
      headingBg: '#0f172a',
      tablas: '#1e1b4b',
      interfaz: '#090d16',
      botones: '#6366f1',
      tarjetas: '#111827',
      titulos: '#ffffff',
      highlight: '#818cf8',
      etiquetas: '#c7d2fe',
      textoGeneral: '#9ca3af',
      textoBotones: '#ffffff',
      svgColor: '#818cf8'
    }
  },

  neonPink: {
    label: '💖 Neon Synthwave',
    colors: {
      headingBg: '#2e0824',
      tablas: '#4a0d3b',
      interfaz: '#1a0414',
      botones: '#d946ef',
      tarjetas: '#24061c',
      titulos: '#fdf4ff',
      highlight: '#e879f9',
      etiquetas: '#f5d0fe',
      textoGeneral: '#f0abfc',
      textoBotones: '#ffffff',
      svgColor: '#e879f9'
    }
  },

  toxicGreen: {
    label: '☢️ Toxic Hazard',
    colors: {
      headingBg: '#1a2e05',
      tablas: '#2e4d0a',
      interfaz: '#0f1a02',
      botones: '#65a30d',
      tarjetas: '#142203',
      titulos: '#f7fee7',
      highlight: '#84cc16',
      etiquetas: '#d9f99d',
      textoGeneral: '#bef264',
      textoBotones: '#ffffff',
      svgColor: '#84cc16'
    }
  },

  lavenderDream: {
    label: '💜 Lavender Dream',
    colors: {
      headingBg: '#2e1065',
      tablas: '#4c1d95',
      interfaz: '#170838',
      botones: '#8b5cf6',
      tarjetas: '#230c4f',
      titulos: '#f5f3ff',
      highlight: '#a78bfa',
      etiquetas: '#ddd6fe',
      textoGeneral: '#c4b5fd',
      textoBotones: '#ffffff',
      svgColor: '#a78bfa'
    }
  },

  copperRust: {
    label: '🧱 Copper Rust',
    colors: {
      headingBg: '#2c1810',
      tablas: '#4a281b',
      interfaz: '#170d08',
      botones: '#c2410c',
      tarjetas: '#21120b',
      titulos: '#fff7ed',
      highlight: '#ea580c',
      etiquetas: '#ffedd5',
      textoGeneral: '#fdba74',
      textoBotones: '#ffffff',
      svgColor: '#ea580c'
    }
  },

  electricAmber: {
    label: '⚡ Electric Amber',
    colors: {
      headingBg: '#291b03',
      tablas: '#473005',
      interfaz: '#140e01',
      botones: '#f59e0b',
      tarjetas: '#1f1402',
      titulos: '#fffbeb',
      highlight: '#fbbf24',
      etiquetas: '#fef3c7',
      textoGeneral: '#fde68a',
      textoBotones: '#000000',
      svgColor: '#fbbf24'
    }
  },

  steelBlue: {
    label: '🛡️ Steel Blue',
    colors: {
      headingBg: '#0f172a',
      tablas: '#334155',
      interfaz: '#090d16',
      botones: '#475569',
      tarjetas: '#1e293b',
      titulos: '#f8fafc',
      highlight: '#94a3b8',
      etiquetas: '#e2e8f0',
      textoGeneral: '#cbd5e1',
      textoBotones: '#ffffff',
      svgColor: '#94a3b8'
    }
  },

  velvetRuby: {
    label: '🍷 Velvet Ruby',
    colors: {
      headingBg: '#3b0764',
      tablas: '#581c87',
      interfaz: '#1e0333',
      botones: '#9333ea',
      tarjetas: '#2e054d',
      titulos: '#faf5ff',
      highlight: '#c084fc',
      etiquetas: '#e9d5ff',
      textoGeneral: '#d8b4fe',
      textoBotones: '#ffffff',
      svgColor: '#c084fc'
    }
  },

  mintFresh: {
    label: '🍃 Mint Fresh',
    colors: {
      headingBg: '#064e3b',
      tablas: '#065f46',
      interfaz: '#022c22',
      botones: '#10b981',
      tarjetas: '#04382c',
      titulos: '#ecfdf5',
      highlight: '#34d399',
      etiquetas: '#a7f3d0',
      textoGeneral: '#6ee7b7',
      textoBotones: '#ffffff',
      svgColor: '#34d399'
    }
  },

  slateMinimal: {
    label: '✒️ Slate Minimal',
    colors: {
      headingBg: '#18181b',
      tablas: '#27272a',
      interfaz: '#09090b',
      botones: '#52525b',
      tarjetas: '#1c1c1f',
      titulos: '#fafafa',
      highlight: '#a1a1aa',
      etiquetas: '#f4f4f5',
      textoGeneral: '#d4d4d8',
      textoBotones: '#ffffff',
      svgColor: '#a1a1aa'
    }
  },

  neonCyan: {
    label: '🌐 Neon Cyan',
    colors: {
      headingBg: '#082f49',
      tablas: '#075985',
      interfaz: '#031624',
      botones: '#06b6d4',
      tarjetas: '#0b2236',
      titulos: '#ecfeff',
      highlight: '#22d3ee',
      etiquetas: '#cffafe',
      textoGeneral: '#67e8f9',
      textoBotones: '#000000',
      svgColor: '#22d3ee'
    }
  },

  sunsetCoral: {
    label: '🍑 Sunset Coral',
    colors: {
      headingBg: '#311018',
      tablas: '#521b28',
      interfaz: '#1c080d',
      botones: '#f43f5e',
      tarjetas: '#260c13',
      titulos: '#fff1f2',
      highlight: '#fb7185',
      etiquetas: '#fecdd3',
      textoGeneral: '#fda4af',
      textoBotones: '#ffffff',
      svgColor: '#fb7185'
    }
  },

  graphiteOrange: {
    label: '🏎️ Graphite Orange',
    colors: {
      headingBg: '#18181b',
      tablas: '#27272a',
      interfaz: '#09090b',
      botones: '#ea580c',
      tarjetas: '#1c1c1f',
      titulos: '#ffffff',
      highlight: '#f97316',
      etiquetas: '#fed7aa',
      textoGeneral: '#a1a1aa',
      textoBotones: '#ffffff',
      svgColor: '#f97316'
    }
  },

  neonViolet: {
    label: '🔮 Neon Violet',
    colors: {
      headingBg: '#1e1b4b',
      tablas: '#3730a3',
      interfaz: '#0f0e26',
      botones: '#7c3aed',
      tarjetas: '#171536',
      titulos: '#f5f3ff',
      highlight: '#8b5cf6',
      etiquetas: '#ddd6fe',
      textoGeneral: '#a5b4fc',
      textoBotones: '#ffffff',
      svgColor: '#8b5cf6'
    }
  },

  solarFlare: {
    label: '☀️ Solar Flare',
    colors: {
      headingBg: '#3b1c05',
      tablas: '#5c2d08',
      interfaz: '#1c0d02',
      botones: '#ea580c',
      tarjetas: '#2b1403',
      titulos: '#fff7ed',
      highlight: '#fb923c',
      etiquetas: '#ffedd5',
      textoGeneral: '#fdba74',
      textoBotones: '#ffffff',
      svgColor: '#fb923c'
    }
  }
};

const settings = reactive({
  notificaciones: false,
  tutorial:
    localStorage.getItem('tutorialActivo') === 'true',
  idioma:
    localStorage.getItem('GYM_ADMIN-idioma') || 'es',
  densidad:
    localStorage.getItem(claveDensidad()) || 'normal',
  borderRadius:
    localStorage.getItem(claveRadius()) || '16px',
  colors:
    safeJsonParse(
      localStorage.getItem(claveColores())
    ) || { ...defaultColors }
});

const presetActivo = computed(() => {
  const actual = JSON.stringify(settings.colors);

  const key = Object.keys(colorPresets).find(
    (k) =>
      JSON.stringify(colorPresets[k].colors) ===
      actual
  );

  return key || null;
});

const cambiarIdioma = (event) => {
  const nuevoIdioma = event.target.value;

  settings.idioma = nuevoIdioma;
  setLang(nuevoIdioma);
};

const toast = reactive({
  visible: false,
  message: ''
});

const showToast = (msg) => {
  toast.message = msg;
  toast.visible = true;

  setTimeout(() => {
    toast.visible = false;
  }, 3000);
};

const restaurarColoresPorDefecto = () => {
  settings.colors = {
    ...defaultColors
  };

  guardarCambios();

  showToast(
    t('toastColorsRestored')
  );
};

const aplicarPreset = (tipoPreset) => {
  if (colorPresets[tipoPreset]) {
    settings.colors = {
      ...colorPresets[tipoPreset].colors
    };

    localStorage.setItem(
      claveColores(),
      JSON.stringify(settings.colors)
    );

    aplicarEstilos();

    window.dispatchEvent(
      new CustomEvent(
        'app-settings-updated',
        {
          detail: settings
        }
      )
    );

    showToast(
      t('toastPresetApplied').replace(
        '{label}',
        colorPresets[tipoPreset].label
      )
    );
  }
};

const guardarCambios = async () => {
  try {
    const userRole =
      localStorage.getItem(ROLE_KEY) ||
      'GYM_ADMIN';

    localStorage.setItem(
      'tutorialActivo',
      settings.tutorial
    );

    localStorage.setItem(
      'GYM_ADMIN-idioma',
      settings.idioma
    );

    localStorage.setItem(
      claveColores(),
      JSON.stringify(settings.colors)
    );

    localStorage.setItem(
      claveDensidad(),
      settings.densidad
    );

    localStorage.setItem(
      claveRadius(),
      settings.borderRadius
    );

    aplicarEstilos();

    window.dispatchEvent(
      new Event('tutorial-updated')
    );

    window.dispatchEvent(
      new CustomEvent(
        'app-settings-updated',
        {
          detail: settings
        }
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        'idioma-changed',
        {
          detail: {
            idioma: settings.idioma
          }
        }
      )
    );

    if (settings.notificaciones) {
      await fetch(
        '/api/notificaciones/activar',
        {
          method: 'POST'
        }
      ).catch(() => {});
    }

    if (userRole === 'GYM_ADMIN') {
      try {
        await fetch(
          '/api/GYM_ADMIN/configuracion',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              'Authorization':
                `Bearer ${
                  localStorage.getItem(
                    'token'
                  ) || ''
                }`
            },

            body: JSON.stringify({
              idioma:
                settings.idioma,

              densidad:
                settings.densidad,

              borderRadius:
                settings.borderRadius,

              colors:
                settings.colors,

              tutorial:
                settings.tutorial
            })
          }
        );
      } catch (backendError) {
        console.warn(
          'Sincronización en la nube omitida temporalmente:',
          backendError
        );
      }

      showToast(
        t('toastGYM_ADMINSaved')
      );
    } else {
      showToast(
        t('toastLocalSaved')
      );
    }
  } catch (error) {
    console.error(
      'Error al guardar:',
      error
    );

    showToast(
      t('toastSaveError')
    );
  }
};

const aplicarEstilos = () => {
  const root =
    document.documentElement;

  root.style.setProperty(
    '--color-heading-bg',
    settings.colors.headingBg
  );

  root.style.setProperty(
    '--color-tablas',
    settings.colors.tablas
  );

  root.style.setProperty(
    '--color-interfaz',
    settings.colors.interfaz
  );

  root.style.setProperty(
    '--color-botones',
    settings.colors.botones
  );

  root.style.setProperty(
    '--bg-cards',
    settings.colors.tarjetas
  );

  root.style.setProperty(
    '--bg-custom',
    settings.colors.interfaz
  );

  root.style.setProperty(
    '--app-border-radius',
    settings.borderRadius
  );

  root.style.setProperty(
    '--color-titulos',
    settings.colors.titulos
  );

  root.style.setProperty(
    '--color-highlight',
    settings.colors.highlight
  );

  root.style.setProperty(
    '--color-etiquetas',
    settings.colors.etiquetas
  );

  root.style.setProperty(
    '--color-texto-general',
    settings.colors.textoGeneral
  );

  root.style.setProperty(
    '--color-texto-botones',
    settings.colors.textoBotones
  );

  root.style.setProperty(
    '--color-svg',
    settings.colors.svgColor
  );

  if (
    settings.densidad ===
    'compacto'
  ) {
    root.style.setProperty(
      '--panel-padding',
      '16px'
    );

    root.style.setProperty(
      '--row-padding',
      '10px 0'
    );
  } else if (
    settings.densidad ===
    'espacioso'
  ) {
    root.style.setProperty(
      '--panel-padding',
      '38px'
    );

    root.style.setProperty(
      '--row-padding',
      '22px 0'
    );
  } else {
    root.style.setProperty(
      '--panel-padding',
      '30px'
    );

    root.style.setProperty(
      '--row-padding',
      '16px 0'
    );
  }
};

onMounted(async () => {
  aplicarEstilos();

  window.addEventListener(
    'idioma-changed',
    (e) => {
      if (
        e.detail &&
        e.detail.idioma
      ) {
        settings.idioma =
          e.detail.idioma;
      }
    }
  );

  const userRole =
    localStorage.getItem(ROLE_KEY) ||
    'GYM_ADMIN';

  if (userRole === 'GYM_ADMIN') {
    try {
      const res = await fetch(
        '/api/GYM_ADMIN/configuracion',
        {
          headers: {
            'Authorization':
              `Bearer ${
                localStorage.getItem(
                  'token'
                ) || ''
              }`
          }
        }
      );

      if (res.ok) {
        const data =
          await res.json();

        if (
          data &&
          data.idioma
        ) {
          settings.idioma =
            data.idioma;

          localStorage.setItem(
            'GYM_ADMIN-idioma',
            data.idioma
          );
        }
      }
    } catch (e) {
      // Ignorar si no hay red
    }
  }
});

const exportar = async (tipo) => {
  try {
    const endpoint =
      tipo === 'excel'
        ? '/api/exportar/bitacoras'
        : '/api/exportar/basedatos';

    const response =
      await fetch(endpoint);

    const blob =
      await response.blob();

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      tipo === 'excel'
        ? 'bitacora_completa.xlsx'
        : 'backup_db.yml';

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

    showToast(
      t('toastDownloading').replace(
        '{tipo}',
        tipo.toUpperCase()
      )
    );
  } catch (error) {
    console.error(
      `Error al descargar ${tipo}:`,
      error
    );

    showToast(
      t('toastDownloading').replace(
        '{tipo}',
        tipo.toUpperCase()
      ) + ' (Simulado)'
    );
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600&display=swap');

/* ---------- Tokens locales (derivados de tus variables de tema) ---------- */
.main-content {
  --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent);
  --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);
  --surface-2: color-mix(in srgb, var(--color-texto-general, #94a3b8) 6%, transparent);
  --accent: var(--color-highlight, #3b82f6);
  --r: var(--app-border-radius, 16px);
  --r-sm: calc(var(--app-border-radius, 16px) * 0.55);

  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px clamp(16px, 3vw, 40px) 72px;
  color: var(--color-texto-general, #94a3b8);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.main-content *, .main-content *::before, .main-content *::after { box-sizing: border-box; }

/* ---------- Encabezado ---------- */
.header-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 28px;
  padding: 30px 32px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background:
    radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 55%),
    var(--bg-cards, #121212);
}
.header-titles { min-width: 0; }
.main-title {
  margin: 0;
  color: var(--color-titulos, #fff);
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.9rem, 3.4vw, 2.7rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.highlight { color: var(--accent); }
.subtitle {
  max-width: 54ch;
  margin: 10px 0 0;
  font-size: 0.92rem;
  line-height: 1.55;
  opacity: 0.8;
}

/* ---------- Botón principal ---------- */
.btn-primary {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 24px;
  border: 0;
  border-radius: var(--r-sm);
  background: var(--color-botones, #1c4fd6);
  color: var(--color-texto-botones, #fff);
  font: 600 0.88rem 'Inter', sans-serif;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(255,255,255,.18) inset,
              0 10px 24px -8px color-mix(in srgb, var(--color-botones, #1c4fd6) 70%, transparent);
  transition: transform .15s ease, filter .15s ease, box-shadow .15s ease;
}
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0) scale(.98); }

/* ---------- Paneles ---------- */
.form-panel {
  width: 100%;
  margin-bottom: 22px;
  padding: var(--panel-padding, 30px);
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--bg-cards, #121212);
  transition: padding .25s ease, border-radius .25s ease;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}
.panel-header h2 {
  margin: 0;
  color: var(--color-titulos, #fff);
  font-family: 'Oswald', sans-serif;
  font-size: 1.15rem;
  font-weight: 500;
  letter-spacing: .02em;
}

/* ---------- Restaurar ---------- */
.btn-reset-colors {
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--color-texto-general, #94a3b8);
  font: 600 .78rem 'Inter', sans-serif;
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}
.btn-reset-colors:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--color-titulos, #fff);
}

/* ---------- Temas ---------- */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  max-height: 470px;
  padding: 4px 6px 6px 2px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
}
.preset-card {
  position: relative;
  min-height: 108px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: var(--r-sm);
  background: linear-gradient(150deg, var(--bg1), var(--bg2));
  color: #fff;
  font-family: 'Inter', sans-serif;
  text-align: left;
  cursor: pointer;
  transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
}
/* barra de acento inferior: muestra el color principal del tema */
.preset-card::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 3px;
  background: var(--accent);
}
.preset-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 70%, #fff 10%);
  box-shadow: 0 12px 24px -12px rgba(0,0,0,.6);
}
.preset-card.is-active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent), 0 12px 26px -12px var(--accent);
}
.preset-check {
  position: absolute;
  top: 10px; right: 10px;
  width: 22px; height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: .7rem;
  font-weight: 800;
  box-shadow: 0 0 0 2px rgba(0,0,0,.35);
}
.preset-swatches { display: flex; padding-right: 26px; }
.swatch {
  width: 22px; height: 22px;
  margin-left: -7px;
  border: 2px solid rgba(0,0,0,.45);
  border-radius: 50%;
}
.swatch:first-child { margin-left: 0; }
.preset-label {
  width: 100%;
  overflow: hidden;
  font-size: .78rem;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0,0,0,.55);
}

/* ---------- Filas ---------- */
.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  min-height: 72px;
  padding: var(--row-padding, 16px 0);
  border-bottom: 1px solid var(--line-soft);
  transition: padding .25s ease;
}
.config-row:last-child { padding-bottom: 0; border-bottom: 0; }
.config-info { flex: 1; min-width: 0; }
.config-info label {
  display: block;
  margin: 0;
  color: var(--color-etiquetas, #f5f5f4);
  font-size: .95rem;
  font-weight: 600;
  line-height: 1.35;
}
.config-info p {
  max-width: 60ch;
  margin: 4px 0 0;
  font-size: .84rem;
  line-height: 1.5;
  opacity: .78;
}

/* ---------- Switch ---------- */
.switch-container { position: relative; flex: 0 0 auto; width: 48px; height: 28px; display: inline-block; cursor: pointer; }
.toggle-input { position: absolute; width: 0; height: 0; opacity: 0; }
.toggle-slider {
  position: absolute; inset: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-2);
  transition: background .2s ease, border-color .2s ease;
}
.toggle-slider::before {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,.3);
  transition: transform .22s cubic-bezier(.4,0,.2,1);
}
.toggle-input:checked + .toggle-slider { background: var(--accent); border-color: var(--accent); }
.toggle-input:checked + .toggle-slider::before { transform: translateX(20px); }
.toggle-input:focus-visible + .toggle-slider { outline: 2px solid var(--accent); outline-offset: 3px; }

/* ---------- Selects ---------- */
.select-wrapper { position: relative; flex: 0 0 auto; width: min(250px, 100%); }
.select-wrapper::after {
  content: '';
  position: absolute;
  top: 50%; right: 16px;
  width: 7px; height: 7px;
  border-right: 2px solid var(--color-texto-general, #94a3b8);
  border-bottom: 2px solid var(--color-texto-general, #94a3b8);
  pointer-events: none;
  transform: translateY(-70%) rotate(45deg);
}
.font-select {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background: var(--surface-2);
  color: var(--color-etiquetas, #f5f5f4);
  font: 500 .86rem 'Inter', sans-serif;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.font-select:hover { border-color: color-mix(in srgb, var(--color-texto-general, #94a3b8) 35%, transparent); }
.font-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
.font-select option { background: #151515; color: #fff; }

/* ---------- Paleta detallada ---------- */
.column-mobile { align-items: flex-start; flex-direction: column; gap: 20px; }
.column-mobile .config-info { width: 100%; }
.color-grid { width: 100%; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.color-card {
  min-height: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 8px;
  border: 1px solid var(--line-soft);
  border-radius: var(--r-sm);
  background: var(--surface-2);
  transition: border-color .15s, background .15s;
}
.color-card:hover { border-color: var(--accent); }
.color-label {
  width: 100%;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-etiquetas, #d4d4d8);
  font-size: .76rem;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
}
.color-picker-wrapper {
  position: relative;
  width: 44px; height: 44px;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,.22);
  border-radius: 50%;
  cursor: pointer;
  transition: transform .15s, border-color .15s;
}
.color-picker-wrapper:hover { transform: scale(1.06); border-color: var(--accent); }
.color-picker-wrapper input[type='color'] {
  position: absolute; z-index: 2; inset: -10px;
  width: 70px; height: 70px;
  padding: 0; border: 0; opacity: 0; cursor: pointer;
}
.color-preview { position: absolute; z-index: 1; inset: 0; pointer-events: none; }

/* ---------- Exportación ---------- */
.export-actions { flex: 0 0 auto; display: flex; align-items: center; gap: 10px; }
.btn-export {
  min-width: 112px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--surface-2);
  color: var(--color-etiquetas, #f5f5f4);
  font: 600 .84rem 'Inter', sans-serif;
  cursor: pointer;
  transition: transform .15s, border-color .15s, background .15s, color .15s;
}
.btn-export svg { width: 16px; height: 16px; flex-shrink: 0; }
.btn-export:hover { transform: translateY(-1px); }
.btn-export.excel:hover { border-color: rgba(34,197,94,.55); background: rgba(34,197,94,.1); color: #86efac; }
.btn-export.yml:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); }

/* ---------- Toast ---------- */
.toast-notification {
  position: fixed;
  z-index: 9999;
  right: 24px; bottom: 24px;
  max-width: min(400px, calc(100vw - 32px));
  padding: 14px 18px 14px 44px;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: var(--r-sm);
  background: #151517;
  color: #fff;
  font: 500 .86rem/1.45 'Inter', sans-serif;
  box-shadow: 0 18px 44px rgba(0,0,0,.45);
}
.toast-notification::before {
  content: '✓';
  position: absolute;
  top: 50%; left: 14px;
  width: 20px; height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: .68rem;
  font-weight: 800;
  transform: translateY(-50%);
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }

/* ---------- Foco ---------- */
.preset-card:focus-visible,
.btn-primary:focus-visible,
.btn-reset-colors:focus-visible,
.btn-export:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

/* ---------- Responsive ---------- */
@media (max-width: 1100px) {
  .presets-grid, .color-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 850px) {
  .header-section { padding: 24px; }
  .presets-grid, .color-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 650px) {
  .main-content { padding: 20px 12px 40px; }
  .header-section { flex-direction: column; align-items: stretch; gap: 18px; padding: 22px 18px; }
  .btn-primary { width: 100%; }
  .form-panel { padding: 20px 16px; }
  .panel-header { align-items: flex-start; }
  .presets-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; max-height: 440px; }
  .config-row { flex-wrap: wrap; align-items: flex-start; gap: 14px; min-height: auto; }
  .config-info { flex: 1 1 calc(100% - 70px); }
  .select-wrapper { flex: 1 1 100%; width: 100%; }
  .color-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .export-actions { width: 100%; }
  .btn-export { flex: 1; }
  .toast-notification { left: 16px; right: 16px; bottom: 16px; max-width: none; }
}
@media (max-width: 420px) {
  .panel-header { flex-direction: column; gap: 10px; }
  .btn-reset-colors { width: 100%; }
  .color-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .export-actions { flex-direction: column; }
  .btn-export { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .main-content * { transition: none !important; }
}
</style>