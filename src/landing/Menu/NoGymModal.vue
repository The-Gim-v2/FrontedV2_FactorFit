<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps<{ rol: 'atleta' | 'entrenador' }>();
const emit = defineEmits<{ (e: 'add'): void; (e: 'close'): void }>();

const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close'); };
onMounted(() => document.addEventListener('keydown', onKey));
onUnmounted(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="ng-overlay" @click.self="emit('close')">
    <div class="ng-modal" role="dialog" aria-modal="true" aria-labelledby="ng-title">

      <button type="button" class="ng-close" aria-label="Cerrar" @click="emit('close')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>

      <!-- Ilustración: ubicación de sucursal con signo + -->
      <div class="ng-art" aria-hidden="true">
        <svg width="132" height="112" viewBox="0 0 132 112" fill="none">
          <defs>
            <linearGradient id="ngPin" x1="66" y1="8" x2="66" y2="84" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ecb892"/>
              <stop offset="1" stop-color="#d4506e"/>
            </linearGradient>
            <radialGradient id="ngGlow" cx="0.5" cy="0.5" r="0.5">
              <stop stop-color="#e04a6d" stop-opacity="0.28"/>
              <stop offset="1" stop-color="#e04a6d" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="66" cy="56" r="54" fill="url(#ngGlow)"/>
          <ellipse cx="66" cy="96" rx="26" ry="6" fill="#000" opacity="0.4"/>
          <ellipse cx="66" cy="96" rx="14" ry="3" stroke="#e9b08a" stroke-opacity="0.55" stroke-width="1.5"/>
          <path d="M66 8c-19.3 0-35 15.2-35 34 0 24 35 54 35 54s35-30 35-54c0-18.8-15.7-34-35-34z" fill="url(#ngPin)"/>
          <circle cx="66" cy="42" r="19" fill="#161726"/>
          <path d="M66 32v20M56 42h20" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
        </svg>
      </div>

      <h3 id="ng-title" class="ng-title">Aún no eliges tu sucursal</h3>
      <p class="ng-text">
        Para {{ rol === 'atleta' ? 'entrenar' : 'trabajar' }} necesitas elegir una sucursal de Factor Fit.
        Búscala ahora y elígela en un par de clics.
      </p>

      <div class="ng-actions">
        <button type="button" class="ng-btn primary" @click="emit('add')">
          Añadir sucursal
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ng-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(10, 10, 18, 0.78); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}

.ng-modal {
  position: relative; width: 100%; max-width: 410px; text-align: center; overflow: hidden;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(224, 74, 109, 0.16) 0%, rgba(224, 74, 109, 0) 65%),
    #1a1b2b;
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px;
  padding: 34px 28px 28px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  color: #f3eee8; font-family: 'Inter', system-ui, sans-serif;
  animation: ng-in 0.28s cubic-bezier(0.2, 0.9, 0.3, 1);
}
@keyframes ng-in { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ng-modal { animation: none; } }

.ng-close {
  position: absolute; top: 14px; right: 14px; width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  color: #bdb9c8; transition: background 0.2s ease, color 0.2s ease;
}
.ng-close:hover { background: rgba(212, 80, 110, 0.25); color: #fff; }

.ng-art { display: flex; justify-content: center; margin: 2px 0 6px; }

.ng-title {
  font-weight: 800; font-size: 24px; line-height: 1.2;
  letter-spacing: -0.5px; margin: 0 0 10px; color: #f3eee8;
}
.ng-text {
  font-size: 14.5px; line-height: 1.6; color: #bdb9c8;
  margin: 0 auto 26px; max-width: 320px;
}

.ng-actions { display: flex; flex-direction: column; gap: 10px; }
.ng-btn {
  width: 100%; min-height: 54px; border-radius: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  font-family: inherit; font-weight: 700; font-size: 14.5px;
  transition: filter 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.ng-btn.primary {
  background: linear-gradient(90deg, #d4506e, #cf4a77); border: none; color: #fff;
  box-shadow: 0 8px 20px rgba(212, 80, 110, 0.22);
}
.ng-btn.primary:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 10px 24px rgba(212, 80, 110, 0.32); }
.ng-btn.primary:active { transform: none; filter: brightness(0.97); }
.ng-btn:focus-visible, .ng-close:focus-visible { outline: 2px solid #e9b08a; outline-offset: 2px; }
</style>