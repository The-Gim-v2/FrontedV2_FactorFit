<template>
  <div class="agenda-menu-wrap">
    <div class="agenda-menu">
      <div class="agenda-kicker">AGENDA</div>
      <h2>Horarios y Eventos</h2>
      <div class="menu-line"></div>

      <button type="button" class="agenda-option" @click="vista = 'gimnasio'">
        <span class="menu-icon"><i class="bi bi-clock-history"></i></span>
        <span class="menu-text">
          <strong>Añadir Horario</strong>
          <small>Días y horas de apertura del gimnasio</small>
        </span>
        <i class="bi bi-chevron-right menu-arrow"></i>
      </button>

      <button type="button" class="agenda-option" @click="vista = 'eventos'">
        <span class="menu-icon"><i class="bi bi-calendar-plus"></i></span>
        <span class="menu-text">
          <strong>Añadir Eventos</strong>
          <small>Clases, torneos y actividades especiales</small>
        </span>
        <i class="bi bi-chevron-right menu-arrow"></i>
      </button>
    </div>

    <ViewScheduleModal v-if="vista === 'eventos'" @close="vista = null" />
    <GymOpeningHours v-if="vista === 'gimnasio'" @close="vista = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ViewScheduleModal from './ViewScheduleModal.vue';
import GymOpeningHours from './GymOpeningHours.vue';

const vista = ref<'eventos' | 'gimnasio' | null>(null);
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

.agenda-menu-wrap { color: var(--color-texto-general, #eee); font-family: Inter, system-ui, sans-serif; }
.agenda-menu { max-width: 430px; padding: 25px 20px; border: 1px solid #ffffff16; border-radius: 22px; background: var(--bg-cards, #1b1b2b); }
.agenda-kicker { color: var(--color-highlight, #ffac70); font-size: 11px; font-weight: 800; letter-spacing: 1.8px; }
.agenda-menu h2 { margin: 8px 0 17px; font-family: Oswald, Impact, sans-serif; font-size: 21px; }
.menu-line { height: 1px; margin-bottom: 15px; background: #ffffff1b; }
.agenda-option { width: 100%; display: flex; align-items: center; gap: 14px; margin: 10px 0; padding: 16px; text-align: left; color: inherit; cursor: pointer; border: 1px solid #ffffff1d; border-radius: 16px; background: #ffffff05; transition: border-color 0.18s ease, background 0.18s ease; }
.agenda-option:hover { border-color: var(--color-highlight, #ffac70); background: #ffffff0a; }
.menu-icon { width: 45px; height: 45px; flex: none; display: grid; place-items: center; color: var(--color-highlight, #ffac70); font-size: 1.3rem; border: 1px solid #ffac705e; border-radius: 13px; background: #ffac7011; }
.menu-text { min-width: 0; flex: 1; }
.agenda-option strong { display: block; font-family: Oswald, Impact, sans-serif; font-size: 17px; }
.agenda-option small { display: block; margin-top: 5px; color: #aba6bd; font-size: 12px; }
.menu-arrow { color: #999; font-size: 1rem; }
</style>