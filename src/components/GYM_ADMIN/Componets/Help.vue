<template>
  <div class="form-panel glass-effect">
    <div class="panel-header">
      <div class="title-group">
        <h2 class="form-title">{{ t('helpTitle') }} <span class="highlight">{{ t('helpHighlight') }}</span></h2>
        <p class="form-subtitle">{{ t('helpSubtitle') }}</p>
      </div>
      <button class="close-x" @click="$emit('close')" :aria-label="t('close')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <div class="form-body">
      <div class="help-card">
        <div class="help-icon-wrapper">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <p class="help-text" v-html="t('helpText')"></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';

const emit = defineEmits(['close']);

const settings = reactive({
  idioma: localStorage.getItem('GYM_ADMIN-idioma') || 'es'
});

const translations: Record<string, Record<string, string>> = {
  es: {
    helpTitle: "AYUDA:",
    helpHighlight: "CORTES",
    helpSubtitle: "Guía rápida de configuración",
    close: "Cerrar modal",
    helpText: "Por defecto, el corte corresponde al <strong>día de inscripción</strong>. Utiliza el icono del calendario para crear reglas personalizadas: define un rango de días específicos y el día de corte correspondiente."
  },
  en: {
    helpTitle: "HELP:",
    helpHighlight: "CUTOFFS",
    helpSubtitle: "Quick configuration guide",
    close: "Close modal",
    helpText: "By default, the cutoff corresponds to the <strong>registration day</strong>. Use the calendar icon to create custom rules: define a specific day range and the corresponding cutoff day."
  }
};

const t = (key: string) => {
  return translations[settings.idioma]?.[key] || translations['es']?.[key] || key;
};

onMounted(() => {
  window.addEventListener('idioma-changed', (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail?.idioma) settings.idioma = customEvent.detail.idioma;
  });
});
</script>

<style scoped>
.form-panel { 
  background: var(--bg-cards, #121214); 
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.08)); 
  color: var(--color-texto-general, #f5f5f4); 
  border-radius: var(--app-border-radius, 20px); 
  padding: 24px; 
  width: 95%; 
  max-width: 440px; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.panel-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 20px; 
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-title { 
  font-family: 'Oswald', sans-serif; 
  font-size: 1.15rem; 
  color: var(--color-titulos, #fff); 
  letter-spacing: 0.8px;
  margin: 0;
}

.form-subtitle {
  font-size: 0.78rem;
  color: var(--color-texto-secundario, #888);
  margin: 0;
}

.highlight { 
  color: var(--color-highlight, #3b82f6); 
}

.help-card {
  background: var(--bg-input, #09090b);
  border: 1px solid var(--border-input, rgba(255, 255, 255, 0.04));
  border-radius: var(--app-border-radius, 12px);
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.help-icon-wrapper {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.help-text { 
  font-family: 'Inter', sans-serif; 
  font-size: 0.88rem; 
  line-height: 1.5; 
  color: var(--color-texto-secundario, #d1d5db); 
  margin: 0; 
}

.help-text strong {
  color: var(--color-titulos, #fff);
  font-weight: 600;
}

@media (max-width: 480px) {
  .form-panel { padding: 18px; }
  .form-title { font-size: 1.05rem; }
  .help-card { padding: 14px; }
}

.close-x { 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  color: var(--color-texto-secundario, #aaa); 
  cursor: pointer; 
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-x:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-titulos, #fff);
}
</style>