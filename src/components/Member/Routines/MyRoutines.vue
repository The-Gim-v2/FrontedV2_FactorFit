<template>
  <HeadingMember>
  <NotificationSystem ref="toastRef" />

  <div class="weekly-wrapper">
    <main class="weekly-main">

      <!-- 1. HERO -->
      <section id="tutorial-1" class="hero">
        <div class="hero-main">
          <div class="hero-top">
            <span class="eyebrow">{{ t.planTag }}</span>
          </div>

          <h1 class="main-heading">
            {{ t.mainTitle1 }} <span class="highlight-color">{{ t.mainTitle2 }}</span>
          </h1>
          <p class="hero-desc">{{ t.heroDesc }}</p>

          <div id="tutorial-3" class="hero-actions">
            <button type="button" class="btn-primary-action" @click="saveWeeklyPlan">
              <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
              {{ t.saveBtn }}
            </button>
            <button type="button" class="btn-ghost" @click="openGenerateModal">
              <svg viewBox="0 0 24 24"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>
              {{ t.generateBtn }}
            </button>
          </div>
        </div>

        <!-- Anillo de progreso -->
        <aside class="week-ring-card">
          <div class="ring-wrap">
            <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle class="ring-bg" cx="50" cy="50" r="44"/>
              <circle class="ring-fg" cx="50" cy="50" r="44" :style="{ strokeDashoffset: ringOffset }"/>
            </svg>
            <div class="ring-center">
              <strong>{{ summary.trainingDays }}</strong>
              <span>{{ t.ofSeven }}</span>
            </div>
          </div>
          <div class="ring-copy">
            <strong>{{ t.summaryTrainingDays }}</strong>
            <span>{{ summary.totalExercises }} {{ t.summaryExercises.toLowerCase() }}</span>
          </div>
        </aside>
      </section>

      <!-- 2. INDICADORES -->
      <section id="tutorial-2" class="kpi-grid">
        <article class="kpi-card">
          <div class="kpi-icon accent">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </div>
          <div class="kpi-body">
            <strong>{{ summary.trainingDays }}</strong>
            <span>{{ t.summaryTrainingDays }}</span>
          </div>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon muted">
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </div>
          <div class="kpi-body">
            <strong>{{ summary.restDays }}</strong>
            <span>{{ t.summaryRestDays }}</span>
          </div>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon success">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
          </div>
          <div class="kpi-body">
            <strong>{{ summary.totalExercises }}</strong>
            <span>{{ t.summaryExercises }}</span>
          </div>
        </article>
      </section>

      <!-- 3. TIRA DE LA SEMANA -->
      <section id="tutorial-5" class="week-strip" role="tablist">
        <button
          v-for="day in dayKeys"
          :key="day"
          type="button"
          role="tab"
          :aria-selected="selectedDay === day"
          class="week-day"
          :class="{
            active: selectedDay === day,
            rest: weeklyPlan[day].isRest,
            filled: !weeklyPlan[day].isRest && weeklyPlan[day].routines.length
          }"
          @click="selectedDay = day"
        >
          <span class="wd-name">{{ t.daysShort[day] }}</span>
          <span v-if="day === todayKey" class="wd-today">{{ t.todayLabel }}</span>
          <strong class="wd-count">
            <template v-if="weeklyPlan[day].isRest">—</template>
            <template v-else>{{ weeklyPlan[day].routines.length }}</template>
          </strong>
          <span class="wd-state">
            {{ weeklyPlan[day].isRest ? t.restShort : t.exercisesShort }}
          </span>
        </button>
      </section>

      <!-- 4. BIBLIOTECA + DÍA -->
      <div class="planner-layout">

        <!-- BIBLIOTECA -->
        <aside id="tutorial-4" class="panel library-panel">
          <header class="panel-head">
            <div class="block-icon">
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h3>{{ t.libraryTitle }}</h3>
              <p>{{ props.savedRoutines.length }} · {{ t.libraryDesc }}</p>
            </div>
          </header>

          <label class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" v-model="libraryFilterText" :placeholder="t.searchPlaceholder" />
          </label>

          <div class="library-list custom-scrollbar">
            <div
              v-for="routine in filteredLibraryRoutines"
              :key="routine.id"
              class="mini-routine-card"
              draggable="true"
              @dragstart="onDragStart($event, routine, { type: 'library' })"
              @click="viewRoutineDetails(routine)"
            >
              <img
                class="mini-thumb"
                :src="getRoutineMediaSrc(routine)"
                :alt="routine.name"
                loading="lazy"
                @error="(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200'; }"
              />

              <div class="mini-info">
                <span class="mini-name">{{ routine.name }}</span>
                <div class="mini-badges-row">
                  <span class="mini-level-badge">{{ translateLevel(routine.level) }}</span>
                  <span class="mini-cat-badge">{{ t.cats[routine.category] || routine.category }}</span>
                </div>
              </div>

              <div class="mini-card-actions" @click.stop>
                <button type="button" class="add-to-day-btn" :title="t.addToDayBtn" @click="toggleAddMenu(routine.id, $event)">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                <div class="add-day-dropdown" v-if="openAddMenuId === routine.id">
                  <button v-for="day in dayKeys" :key="day" type="button" @click="addRoutineToDay(day, routine)">
                    {{ t.daysShort[day] }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="!filteredLibraryRoutines.length" class="empty-hint">
              <p>{{ props.savedRoutines.length ? t.noMatchFilter : t.noSavedRoutines }}</p>
            </div>
          </div>
        </aside>

        <!-- PANEL DEL DÍA -->
        <section
          id="tutorial-6"
          class="panel day-detail-card"
          :class="{ 'is-drop-target': draggingItem }"
          @dragover.prevent
          @drop="onDropToDay($event, selectedDay)"
        >
          <header class="day-detail-header">
            <div class="day-title-group">
              <div class="block-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div>
                <span class="section-eyebrow">{{ selectedDay === todayKey ? t.todayLabel.toUpperCase() : t.daysShort[selectedDay].toUpperCase() }}</span>
                <h2 class="day-detail-title">{{ t.days[selectedDay] }}</h2>
              </div>
              <span class="count-pill" v-if="!weeklyPlan[selectedDay].isRest">
                {{ weeklyPlan[selectedDay].routines.length }} {{ t.resultsLabel }}
              </span>
            </div>

            <div class="day-detail-actions">
              <label class="rest-toggle">
                <span class="switch">
                  <input type="checkbox" v-model="weeklyPlan[selectedDay].isRest" @change="onToggleRest(selectedDay)" />
                  <i></i>
                </span>
                <span>{{ t.restDayLabel }}</span>
              </label>

              <button
                v-if="!weeklyPlan[selectedDay].isRest && weeklyPlan[selectedDay].routines.length"
                type="button"
                class="clear-day-btn"
                :title="t.clearDayBtn"
                :aria-label="t.clearDayBtn"
                @click="clearDay(selectedDay)"
              >
                <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </header>

          <div v-if="weeklyPlan[selectedDay].isRest" class="state-box">
            <div class="waiting-icon-ring">
              <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <h3>{{ t.restDayBoxTitle }}</h3>
            <p>{{ t.restDayBoxText }}</p>
          </div>

          <div v-else-if="!weeklyPlan[selectedDay].routines.length" class="state-box dashed">
            <div class="waiting-icon-ring">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <p>{{ t.dropHint }}</p>
          </div>

          <div v-else id="tutorial-7" class="routines-grid">
            <article
              v-for="(routine, idx) in weeklyPlan[selectedDay].routines"
              :key="routine.instanceId || routine.id"
              class="routine-card"
              draggable="true"
              @dragstart="onDragStart($event, routine, { type: 'day', day: selectedDay, index: idx })"
            >
              <div class="card-media">
                <img
                  :src="getRoutineMediaSrc(routine)"
                  :alt="routine.name"
                  loading="lazy"
                  @error="(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'; }"
                />
                <div class="media-overlay"></div>

                <div class="badge-container">
                  <span class="badge-level">{{ translateLevel(routine.level) }}</span>
                  <span class="badge-order">#{{ idx + 1 }}</span>
                </div>

                <div class="media-actions">
                  <div class="move-wrap" @click.stop>
                    <button
                      type="button"
                      class="icon-action-btn move-btn"
                      :title="t.moveTitle"
                      :aria-label="t.moveTitle"
                      @click="toggleMoveMenu(routine.instanceId || routine.id, $event)"
                    >
                      <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </button>
                    <div class="add-day-dropdown move-dropdown" v-if="openMoveMenuId === (routine.instanceId || routine.id)">
                      <button v-for="day in dayKeys" :key="day" type="button" @click="moveRoutineToDay(selectedDay, idx, day, routine)">
                        {{ t.daysShort[day] }}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="icon-action-btn delete-btn"
                    :title="t.removeTitle"
                    :aria-label="t.removeTitle"
                    @click="removeRoutineFromDay(selectedDay, idx)"
                  >
                    <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <h3 class="card-title-routine">{{ routine.name }}</h3>
                <span class="muscle-tag">{{ t.muscleLabel }}: <strong>{{ routine.target }}</strong></span>
                <p class="routine-desc">{{ getRoutineDescription(routine) }}</p>

                <div class="quick-prescription-pill">
                  <div class="pill-item">
                    <span class="pill-value">{{ getPrescribedSets(routine) }}</span>
                    <span class="pill-label">{{ t.setsShort }}</span>
                  </div>
                  <div class="pill-divider"></div>
                  <div class="pill-item">
                    <span class="pill-value">{{ getPrescribedReps(routine) }}</span>
                    <span class="pill-label">{{ t.repsShort }}</span>
                  </div>
                </div>

                <button type="button" class="btn-explore" @click="viewRoutineDetails(routine)">
                  {{ t.viewDetails }}
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- ESTADO VACÍO GLOBAL -->
      <div id="tutorial-8" v-if="!props.savedRoutines.length" class="panel global-empty">
        <div class="waiting-icon-ring">
          <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3>{{ t.emptyGlobalTitle }}</h3>
        <p>{{ t.emptyGlobalDesc }}</p>
      </div>

    </main>

    <!-- MODAL: GENERAR SEMANA -->
    <transition name="pop">
      <div class="modal-backdrop" v-if="showGenerateModal" @click.self="showGenerateModal = false">
        <div class="modal-content custom-scrollbar" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <span class="section-eyebrow">{{ t.planTag.toUpperCase() }}</span>
              <h2>{{ t.modalGenerateTitle }}</h2>
            </div>
            <button type="button" class="close-btn" @click="showGenerateModal = false">&times;</button>
          </div>

          <p class="modal-desc">{{ t.modalGenerateDesc }}</p>

          <div class="gen-section">
            <span class="gen-section-title">{{ t.chooseDaysLabel }}</span>
            <div class="day-chips-row">
              <button
                v-for="day in dayKeys"
                :key="day"
                type="button"
                class="day-chip"
                :class="{ active: genSelectedDays.includes(day) }"
                @click="toggleGenDay(day)"
              >{{ t.daysShort[day] }}</button>
            </div>
            <p class="gen-hint">{{ t.chooseDaysHint(genSelectedDays.length) }}</p>
          </div>

          <div class="gen-section">
            <span class="gen-section-title">{{ t.sourceLabel }}</span>
            <div class="source-options-row">
              <label class="source-option" :class="{ active: genSource === 'saved' }">
                <input type="radio" value="saved" v-model="genSource" />{{ t.sourceSaved }}
              </label>
              <label class="source-option" :class="{ active: genSource === 'library' }">
                <input type="radio" value="library" v-model="genSource" />{{ t.sourceLibrary }}
              </label>
              <label class="source-option" :class="{ active: genSource === 'both' }">
                <input type="radio" value="both" v-model="genSource" />{{ t.sourceBoth }}
              </label>
            </div>
          </div>

          <div class="gen-section">
            <span class="gen-section-title">{{ t.goalPerDay }}</span>
            <div class="day-goal-list">
              <div v-for="day in genSelectedDays" :key="day" class="day-goal-row">
                <span class="day-goal-name">{{ t.days[day] }}</span>
                <select v-model="dayGoals[day]" class="styled-select day-goal-select">
                  <option value="hypertrophy">{{ t.goals.hypertrophy }}</option>
                  <option value="strength">{{ t.goals.strength }}</option>
                  <option value="endurance">{{ t.goals.endurance }}</option>
                  <option value="fat_loss">{{ t.goals.fat_loss }}</option>
                </select>
              </div>
              <p v-if="!genSelectedDays.length" class="gen-hint">{{ t.selectDaysFirst }}</p>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showGenerateModal = false">{{ t.cancelBtn }}</button>
            <button type="button" class="btn-primary-action" :disabled="!genSelectedDays.length" @click="generateWeeklyPlan">
              {{ t.generateConfirmBtn }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- MODAL DE DETALLES -->
    <RoutineDetailModal
      v-if="selectedRoutine"
      :routine="selectedRoutine"
      :isSaved="isRoutineSaved(selectedRoutine)"
      :t="t"
      :description="getRoutineDescription(selectedRoutine)"
      :instructionsList="getRoutineInstructionsList(selectedRoutine)"
      :prescribedSets="getPrescribedSets(selectedRoutine)"
      :prescribedReps="getPrescribedReps(selectedRoutine)"
      :prescribedRest="getPrescribedRest(selectedRoutine)"
      :translateLevel="translateLevel"
      @close="selectedRoutine = null"
      @toggle-save="(r) => emit('toggle-save-routine', r)"
    />

  </div>
  </HeadingMember>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useLang } from '../useLang.js';
import RoutineDetailModal from '../Modals/RoutineDetailModal.vue';
import HeadingMember from '../HeadingMember.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const { lang } = useLang();

const props = defineProps({
  savedRoutines: { type: Array, default: () => [] },
  routineLibrary: { type: Array, default: () => [] },
  userProfile: {
    type: Object,
    default: () => ({ age: 28, weight: 75, height: 175, gender: 'male', goal: 'hypertrophy' })
  },
  initialWeeklyPlan: { type: Object, default: null }
});

const emit = defineEmits(['save-weekly-plan', 'toggle-save-routine']);

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Notificaciones (mismo componente que usa el registro de clientes)
const toastRef = ref(null);
const notify = (message, type = 'success', duration = 4000) => {
  toastRef.value?.notify(message, type, duration);
};

// Día actual (para marcar "Hoy" en la tira de la semana)
const todayKey = dayKeys[(new Date().getDay() + 6) % 7];

// -------------------- TRADUCCIONES --------------------
const traducciones = {
  es: {
    planTag: 'Mi Plan Semanal',
    savedToast: 'Plan semanal guardado correctamente.',
    generatedToast: 'Semana generada correctamente.',
    addedToast: (day) => `Rutina añadida al ${day}.`,
    movedToast: (day) => `Rutina movida al ${day}.`,
    removedToast: 'Rutina quitada del día.',
    clearedToast: 'Día vaciado correctamente.',
    mainTitle1: 'Rutinas',
    mainTitle2: 'Semanales',
    heroDesc: 'Elige un día, revisa o arma su rutina, y muévela a otro día cuando quieras.',
    summaryTrainingDays: 'Días de entrenamiento',
    summaryRestDays: 'Días de descanso',
    summaryExercises: 'Ejercicios asignados',
    ofSeven: 'de 7 días',
    todayLabel: 'Hoy',
    restShort: 'descanso',
    generateBtn: 'Generar Semana Automática',
    saveBtn: 'Guardar Plan Semanal',
    libraryTitle: 'Mis Rutinas Guardadas',
    libraryDesc: 'Arrastra una al día o usa +',
    searchPlaceholder: 'Buscar rutina...',
    addToDayBtn: 'Añadir a día',
    moveTitle: 'Mover a otro día',
    removeTitle: 'Quitar de este día',
    noSavedRoutines: 'Aún no has guardado rutinas del catálogo.',
    noMatchFilter: 'Ninguna rutina coincide con la búsqueda.',
    exercisesShort: 'ejerc.',
    resultsLabel: 'ejercicios programados',
    restDayLabel: 'Día de descanso',
    restDayBoxTitle: 'Día de descanso',
    restDayBoxText: 'No hay ejercicios programados para este día. El cuerpo también entrena descansando.',
    dropHint: 'Arrastra una rutina desde la biblioteca o usa el botón + para llenar este día.',
    clearDayBtn: 'Vaciar día',
    emptyGlobalTitle: 'Todavía no tienes rutinas guardadas',
    emptyGlobalDesc: 'Ve al catálogo, calcula tus rutinas recomendadas y guarda las que quieras entrenar. Aparecerán aquí para armar tu semana.',
    modalGenerateTitle: 'Generar Semana Automática',
    modalGenerateDesc: 'Elige qué días quieres entrenar; el resto se marcarán como descanso. El sistema arma una rutina balanceada según tu perfil.',
    chooseDaysLabel: 'Días de entrenamiento',
    chooseDaysHint: (n) => n === 0 ? 'Selecciona al menos un día.' : `${n} día(s) de entrenamiento, ${7 - n} de descanso.`,
    sourceLabel: 'Fuente de ejercicios',
    sourceSaved: 'Solo mis guardados',
    sourceLibrary: 'Todo el catálogo',
    sourceBoth: 'Ambos',
    goalPerDay: 'Objetivo por día',
    selectDaysFirst: 'Selecciona días de entrenamiento arriba para configurar sus objetivos.',
    generateConfirmBtn: 'Generar Rutina',
    cancelBtn: 'Cancelar',
    setsLabel: 'Series sugeridas',
    repsLabel: 'Repeticiones adaptadas',
    restLabel: 'Descanso óptimo',
    instructionsTitle: 'Instrucciones Paso a Paso',
    closeBtn: 'Cerrar',
    viewDetails: 'Ver Detalle Completo',
    muscleLabel: 'Músculo',
    setsShort: 'series',
    repsShort: 'repeticiones',
    days: { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' },
    daysShort: { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' },
    levelBeginner: 'Principiante',
    levelIntermediate: 'Intermedio',
    levelAdvanced: 'Avanzado',
    goals: {
      hypertrophy: 'Hipertrofia (Volumen)',
      strength: 'Fuerza Máxima',
      endurance: 'Resistencia',
      fat_loss: 'Definición / Quema grasa'
    },
    cats: {
      chest: 'Pecho', back: 'Espalda', 'upper legs': 'Piernas Sup.', 'upper arms': 'Brazos',
      shoulders: 'Hombros', waist: 'Cintura', 'lower legs': 'Piernas Inf.'
    }
  },
  en: {
    planTag: 'My Weekly Plan',
    savedToast: 'Weekly plan saved successfully.',
    generatedToast: 'Week generated successfully.',
    addedToast: (day) => `Routine added to ${day}.`,
    movedToast: (day) => `Routine moved to ${day}.`,
    removedToast: 'Routine removed from the day.',
    clearedToast: 'Day cleared successfully.',
    mainTitle1: 'Weekly',
    mainTitle2: 'Routines',
    heroDesc: 'Pick a day, review or build its routine, and move it to another day anytime.',
    summaryTrainingDays: 'Training days',
    summaryRestDays: 'Rest days',
    summaryExercises: 'Assigned exercises',
    ofSeven: 'of 7 days',
    todayLabel: 'Today',
    restShort: 'rest',
    generateBtn: 'Auto-Generate Week',
    saveBtn: 'Save Weekly Plan',
    libraryTitle: 'My Saved Routines',
    libraryDesc: 'Drag one to a day or use +',
    searchPlaceholder: 'Search routine...',
    addToDayBtn: 'Add to day',
    moveTitle: 'Move to another day',
    removeTitle: 'Remove from this day',
    noSavedRoutines: "You haven't saved any routines from the catalog yet.",
    noMatchFilter: 'No routines match your search.',
    exercisesShort: 'ex.',
    resultsLabel: 'scheduled exercises',
    restDayLabel: 'Rest day',
    restDayBoxTitle: 'Rest day',
    restDayBoxText: 'No exercises scheduled for this day. The body trains by resting too.',
    dropHint: 'Drag a routine from the library or use the + button to fill this day.',
    clearDayBtn: 'Clear day',
    emptyGlobalTitle: "You don't have any saved routines yet",
    emptyGlobalDesc: 'Go to the catalog, calculate your recommended routines and save the ones you want to train. They will show up here to build your week.',
    modalGenerateTitle: 'Auto-Generate Week',
    modalGenerateDesc: 'Pick which days you want to train; the rest will be marked as rest days. The system builds a balanced routine based on your profile.',
    chooseDaysLabel: 'Training days',
    chooseDaysHint: (n) => n === 0 ? 'Select at least one day.' : `${n} training day(s), ${7 - n} rest day(s).`,
    sourceLabel: 'Exercise source',
    sourceSaved: 'Saved only',
    sourceLibrary: 'Full catalog',
    sourceBoth: 'Both',
    goalPerDay: 'Goal per day',
    selectDaysFirst: 'Select training days above to set their goals.',
    generateConfirmBtn: 'Generate Routine',
    cancelBtn: 'Cancel',
    setsLabel: 'Suggested Sets',
    repsLabel: 'Adapted Repetitions',
    restLabel: 'Optimal Rest',
    instructionsTitle: 'Step-by-Step Instructions',
    closeBtn: 'Close',
    viewDetails: 'View Full Details',
    muscleLabel: 'Muscle',
    setsShort: 'sets',
    repsShort: 'repetitions',
    days: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
    daysShort: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
    levelBeginner: 'Beginner',
    levelIntermediate: 'Intermediate',
    levelAdvanced: 'Advanced',
    goals: {
      hypertrophy: 'Hypertrophy (Growth)',
      strength: 'Max Strength',
      endurance: 'Endurance',
      fat_loss: 'Fat Loss / Toning'
    },
    cats: {
      chest: 'Chest', back: 'Back', 'upper legs': 'Upper Legs', 'upper arms': 'Arms',
      shoulders: 'Shoulders', waist: 'Waist', 'lower legs': 'Lower Legs'
    }
  }
};

const selectedRoutine = ref(null);

const viewRoutineDetails = (routine) => {
  selectedRoutine.value = routine;
};

const translateLevel = (level) => {
  if (level === 'Principiante') return t.value.levelBeginner;
  if (level === 'Intermedio') return t.value.levelIntermediate;
  if (level === 'Avanzado') return t.value.levelAdvanced;
  return level;
};

const getPrescribedSets = (routine) => {
  const age = props.userProfile?.age || 28;
  const goal = props.userProfile?.goal || 'hypertrophy';
  if (age < 15 || age >= 60) return '2 - 3';
  if (goal === 'strength') return '4 - 5';
  if (routine.category === 'cardio' || routine.category === 'waist') return '3';
  return '3 - 4';
};

const getPrescribedReps = (routine) => {
  const goal = props.userProfile?.goal || 'hypertrophy';
  const cat = routine.category;
  const eq = routine.equipment;
  if (goal === 'strength') {
    if (cat === 'upper legs' || cat === 'chest' || cat === 'back') {
      return eq === 'body weight' ? '10 - 12 reps' : '4 - 6 reps';
    }
    return '6 - 8 reps';
  }
  if (goal === 'endurance' || goal === 'fat_loss') {
    if (cat === 'waist' || cat === 'lower legs') return '20 - 25 reps';
    return '15 - 20 reps';
  }
  if (cat === 'upper arms' || cat === 'shoulders') return '12 - 15 reps';
  if (cat === 'lower legs') return '15 - 20 reps';
  if (cat === 'upper legs') return eq === 'barbell' ? '8 - 10 reps' : '10 - 12 reps';
  return '10 - 12 reps';
};

const getPrescribedRest = (routine) => {
  const goal = props.userProfile?.goal || 'hypertrophy';
  if (goal === 'strength') return '120s - 180s';
  if (goal === 'fat_loss') return '30s - 45s';
  if (routine.category === 'upper legs') return '90s - 120s';
  return '60s - 90s';
};

const getRoutineDescription = (routine) => {
  const currentLang = lang.value;
  if (routine.instructions && routine.instructions[currentLang]) {
    return routine.instructions[currentLang];
  }
  return routine.instructions?.es || routine.instructions?.en || 'Realiza el movimiento de forma controlada.';
};

const getRoutineInstructionsList = (routine) => {
  const currentLang = lang.value;
  if (routine.instruction_steps && routine.instruction_steps[currentLang]) {
    return routine.instruction_steps[currentLang];
  }
  if (routine.instruction_steps && routine.instruction_steps.es) {
    return routine.instruction_steps.es;
  }
  return [getRoutineDescription(routine)];
};

const getRoutineMediaSrc = (routine) => {
  if (!routine) return '';
  const rawPath = routine.gif_url || routine.gifUrl || routine.image || routine.img;
  if (!rawPath) return '';
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }
  return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
};

const t = computed(() => traducciones[lang.value] || traducciones.es);

// -------------------- ESTADO DEL PLAN --------------------
const createEmptyPlan = () => {
  const plan = {};
  dayKeys.forEach((d) => { plan[d] = { isRest: true, routines: [] }; });
  return plan;
};

const weeklyPlan = reactive(
  props.initialWeeklyPlan ? JSON.parse(JSON.stringify(props.initialWeeklyPlan)) : createEmptyPlan()
);

const selectedDay = ref('mon');

const showGenerateModal = ref(false);
const genSelectedDays = ref(['mon', 'wed', 'fri']);
const genSource = ref('saved');
const dayGoals = reactive({
  mon: 'hypertrophy', tue: 'hypertrophy', wed: 'hypertrophy', thu: 'hypertrophy', fri: 'hypertrophy', sat: 'hypertrophy', sun: 'hypertrophy'
});

const simulatedSavedRoutines = computed(() => {
  return props.savedRoutines.length ? props.savedRoutines.slice(0, 3) : [
    { id: 'sim1', name: 'Rutina de Pecho Base', category: 'chest', level: 'Intermedio', target: 'chest', image: 'images/chest.jpg', instructions: { es: 'Instrucciones de prueba', en: 'Test instructions' } }
  ];
});

const openGenerateModal = () => { showGenerateModal.value = true; };

const toggleGenDay = (day) => {
  const index = genSelectedDays.value.indexOf(day);
  if (index > -1) genSelectedDays.value.splice(index, 1);
  else genSelectedDays.value.push(day);
};

const generateWeeklyPlan = () => {
  dayKeys.forEach(day => {
    if (genSelectedDays.value.includes(day)) {
      weeklyPlan[day].isRest = false;
      let pool = [];
      if (genSource.value === 'saved' || genSource.value === 'both') pool = pool.concat(props.savedRoutines);
      if (genSource.value === 'library' || genSource.value === 'both') pool = pool.concat(props.routineLibrary);
      if (!pool.length) pool = simulatedSavedRoutines.value;

      if (pool.length) {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selectedSlice = shuffled.slice(0, 3);
        weeklyPlan[day].routines = selectedSlice.map(routine => ({
          ...routine,
          instanceId: makeInstanceId(routine)
        }));
      }
    } else {
      weeklyPlan[day].isRest = true;
      weeklyPlan[day].routines = [];
    }
  });
  showGenerateModal.value = false;
  notify(t.value.generatedToast, 'success');
};

const saveWeeklyPlan = () => {
  emit('save-weekly-plan', JSON.parse(JSON.stringify(weeklyPlan)));
  notify(t.value.savedToast, 'success');
};

const summary = computed(() => {
  let trainingDays = 0, restDays = 0, totalExercises = 0;
  dayKeys.forEach((d) => {
    if (weeklyPlan[d].isRest) restDays++; else trainingDays++;
    totalExercises += weeklyPlan[d].routines.length;
  });
  return { trainingDays, restDays, totalExercises };
});

// Anillo de progreso (circunferencia con r = 44)
const RING_LENGTH = 2 * Math.PI * 44;
const ringOffset = computed(() => RING_LENGTH * (1 - summary.value.trainingDays / 7));

// -------------------- BIBLIOTECA / FILTRO --------------------
const libraryFilterText = ref('');
const filteredLibraryRoutines = computed(() => {
  return props.savedRoutines.filter((r) => {
    if (!libraryFilterText.value) return true;
    return r.name.toLowerCase().includes(libraryFilterText.value.toLowerCase());
  });
});

const openAddMenuId = ref(null);
const openMoveMenuId = ref(null);

const toggleAddMenu = (id, event) => {
  event.stopPropagation();
  openMoveMenuId.value = null;
  openAddMenuId.value = openAddMenuId.value === id ? null : id;
};

const toggleMoveMenu = (instanceId, event) => {
  event.stopPropagation();
  openAddMenuId.value = null;
  openMoveMenuId.value = openMoveMenuId.value === instanceId ? null : instanceId;
};

const closeMenus = () => { openAddMenuId.value = null; openMoveMenuId.value = null; };
onMounted(() => window.addEventListener('click', closeMenus));
onUnmounted(() => window.removeEventListener('click', closeMenus));

const makeInstanceId = (routine) => `${routine.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const addRoutineToDay = (day, routine) => {
  weeklyPlan[day].isRest = false;
  weeklyPlan[day].routines.push({ ...routine, instanceId: makeInstanceId(routine) });
  openAddMenuId.value = null;
  selectedDay.value = day;
  notify(t.value.addedToast(t.value.days[day]), 'success');
};

// --- BORRAR Y MOVER RUTINA DENTRO DEL PLAN ---
const removeRoutineFromDay = (day, index) => {
  weeklyPlan[day].routines.splice(index, 1);
  notify(t.value.removedToast, 'info');
};

const moveRoutineToDay = (fromDay, index, targetDay, routine) => {
  if (fromDay === targetDay) { openMoveMenuId.value = null; return; }
  weeklyPlan[fromDay].routines.splice(index, 1);
  weeklyPlan[targetDay].isRest = false;
  weeklyPlan[targetDay].routines.push(routine);
  openMoveMenuId.value = null;
  selectedDay.value = targetDay;
  notify(t.value.movedToast(t.value.days[targetDay]), 'info');
};

const clearDay = (day) => {
  weeklyPlan[day].routines = [];
  notify(t.value.clearedToast, 'info');
};
const onToggleRest = (day) => { if (weeklyPlan[day].isRest) weeklyPlan[day].routines = []; };

// -------------------- DRAG & DROP --------------------
const draggingItem = ref(null);
const onDragStart = (event, routine, source) => {
  draggingItem.value = { routine, source };
  event.dataTransfer.effectAllowed = 'move';
};

const onDropToDay = (event, day) => {
  if (!draggingItem.value) return;
  const { routine, source } = draggingItem.value;
  if (source.type === 'day' && source.day === day) { draggingItem.value = null; return; }
  weeklyPlan[day].isRest = false;
  if (source.type === 'day') {
    weeklyPlan[source.day].routines.splice(source.index, 1);
    weeklyPlan[day].routines.push(routine);
  } else {
    weeklyPlan[day].routines.push({ ...routine, instanceId: makeInstanceId(routine) });
  }
  draggingItem.value = null;
};

const isRoutineSaved = (routine) => {
  return props.savedRoutines.some(r => r.id === routine.id);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button, input, select { font: inherit; }

svg {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   BASE
========================================================= */
.weekly-wrapper {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: color-mix(in srgb, var(--hl) 11%, transparent);
  --hl-mid: color-mix(in srgb, var(--hl) 22%, transparent);
  --hl-line: color-mix(in srgb, var(--hl) 45%, transparent);
  --card: var(--bg-cards, #121212);
  --line: rgba(255, 255, 255, 0.07);
  --line2: rgba(255, 255, 255, 0.13);
  --title: var(--color-titulos, #fff);
  --text2: rgba(245, 245, 244, 0.66);
  --text3: rgba(245, 245, 244, 0.45);
  --surface: rgba(255, 255, 255, 0.03);
  --surface-hover: rgba(255, 255, 255, 0.055);
  --green: #34d399;
  --amber: #fbbf24;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, #090909);
}

.weekly-main {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px clamp(14px, 3vw, 32px) 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }

.panel {
  min-width: 0;
  padding: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.eyebrow,
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--hl);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.eyebrow::before,
.section-eyebrow::before { content: ''; width: 14px; height: 2px; border-radius: 2px; background: currentColor; }

.block-icon {
  width: 44px;
  height: 44px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
}

.block-icon svg { width: 20px; height: 20px; }

/* =========================================================
   BOTONES
========================================================= */
.btn-primary-action,
.btn-ghost {
  min-height: 46px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  cursor: pointer;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: filter 0.2s ease, transform 0.2s var(--ease), background 0.2s ease, border-color 0.2s ease;
}

.btn-primary-action {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
  box-shadow: 0 10px 26px color-mix(in srgb, var(--hl) 30%, transparent);
}

.btn-primary-action:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); }
.btn-primary-action:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

.btn-ghost { color: var(--title); background: var(--surface); border: 1px solid var(--line2); }
.btn-ghost:hover { background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-2px); }

/* =========================================================
   HERO
========================================================= */
.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: center;
  gap: 28px;
  padding: 36px;
  background:
    radial-gradient(520px 260px at 100% 0%, var(--hl-mid), transparent 70%),
    linear-gradient(135deg, color-mix(in srgb, var(--card) 92%, white), var(--card) 55%, rgba(10, 10, 10, 0.96));
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse at 100% 0%, #000, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 100% 0%, #000, transparent 70%);
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  right: -70px;
  bottom: -190px;
  width: 320px;
  height: 320px;
  border: 1px solid var(--hl-mid);
  border-radius: 50%;
  box-shadow: 0 0 0 38px var(--hl-soft), 0 0 0 39px var(--hl-soft);
  pointer-events: none;
}

.hero-main,
.week-ring-card { position: relative; z-index: 1; }

.hero-main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

.hero-top { min-height: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }

.main-heading {
  margin: 0;
  color: var(--title);
  font-family: 'Anton', sans-serif;
  font-size: clamp(30px, 4vw, 50px);
  font-weight: 400;
  letter-spacing: 0.3px;
  line-height: 1.05;
  text-transform: uppercase;
}

.highlight-color { color: var(--hl); text-shadow: 0 0 36px var(--hl-line); }

.hero-desc { max-width: 560px; margin: 0; color: var(--text2); font-size: 14px; line-height: 1.6; }

.hero-actions { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px; }

/* Anillo */
.week-ring-card {
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid var(--line2);
  border-radius: 22px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.ring-wrap {
  position: relative;
  width: 104px;
  height: 104px;
  flex: none;
  background: transparent;
  border: 0;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.ring {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: transparent;
  border: 0;
  outline: none;
  box-shadow: none;
  stroke: none;
  transform: rotate(-90deg);
}

.ring:focus,
.ring:focus-visible,
.ring-wrap:focus,
.ring-wrap:focus-visible,
.week-ring-card:focus,
.week-ring-card:focus-visible { outline: none; box-shadow: none; }

.ring circle { fill: none; stroke-width: 8; }
.ring-bg { stroke: rgba(255, 255, 255, 0.08); }

.ring-fg {
  stroke: var(--hl);
  stroke-dasharray: 276.46;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s var(--ease);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.ring-center strong { color: #fff; font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 600; line-height: 1; }
.ring-center span { color: var(--text3); font-size: 10px; font-weight: 700; }

.ring-copy { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.ring-copy strong { color: #fff; font-size: 13.5px; line-height: 1.3; }
.ring-copy span { color: var(--text3); font-size: 12px; line-height: 1.4; }

/* =========================================================
   INDICADORES
========================================================= */
.kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }

.kpi-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  background:
    radial-gradient(180px 90px at 0% 0%, var(--hl-soft), transparent 75%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 60%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 22px;
  right: 22px;
  height: 2px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--hl), transparent);
  opacity: 0.85;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 14px;
}

.kpi-icon svg { width: 21px; height: 21px; }
.kpi-icon.muted { color: var(--text2); background: rgba(255, 255, 255, 0.05); border-color: var(--line2); }
.kpi-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }

.kpi-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }

.kpi-body strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 600; line-height: 1; }

.kpi-body span { color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase; }

/* =========================================================
   TIRA DE LA SEMANA
========================================================= */
.week-strip {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  background: color-mix(in srgb, var(--card) 92%, transparent);
  border: 1px solid var(--line2);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26);
}

.week-day {
  position: relative;
  min-width: 0;
  padding: 14px 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.week-day:hover { background: var(--surface-hover); transform: translateY(-2px); }

.wd-name { font-size: 11.5px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; }

.wd-today {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  overflow: hidden;
  color: transparent;
  background: var(--amber);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--amber);
}

.wd-count { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 600; line-height: 1.1; }
.wd-state { color: var(--text3); font-size: 10.5px; font-weight: 700; }

.week-day.rest .wd-count { color: var(--text3); }
.week-day.filled { border-color: rgba(16, 185, 129, 0.25); }
.week-day.filled .wd-state { color: var(--green); }

.week-day.active { background: var(--hl-soft); border-color: var(--hl); box-shadow: 0 0 0 1px var(--hl-soft), 0 10px 24px rgba(0, 0, 0, 0.25); }
.week-day.active .wd-name { color: var(--hl); }

/* =========================================================
   LAYOUT
========================================================= */
.planner-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 22px; align-items: start; }

/* ---------- Biblioteca ---------- */
.library-panel { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 24px; }

.panel-head { display: flex; align-items: center; gap: 13px; }
.panel-head h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; }
.panel-head p { margin: 3px 0 0; color: var(--text3); font-size: 11.5px; line-height: 1.4; }

.search-box {
  height: 44px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:focus-within { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.search-box svg { color: var(--text3); }

.search-box input {
  min-width: 0;
  flex: 1;
  height: 100%;
  color: #fff;
  font-size: 13.5px;
  background: transparent;
  border: 0;
  outline: none;
}

.search-box input::placeholder { color: var(--text3); }

.library-list { display: flex; flex-direction: column; gap: 10px; max-height: 620px; overflow-y: auto; padding: 2px 4px 60px 0; margin-bottom: -50px; }

.mini-routine-card {
  position: relative;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: grab;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 15px;
  transition: border-color 0.2s ease, transform 0.2s var(--ease), background 0.2s ease;
}

.mini-routine-card:hover { background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-1px); }
.mini-routine-card:active { cursor: grabbing; }

.mini-thumb { width: 52px; height: 52px; flex: none; object-fit: contain; background: #060606; border: 1px solid var(--line); border-radius: 11px; }

.mini-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 6px; }

.mini-name { overflow: hidden; color: var(--title); font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }

.mini-badges-row { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }

.mini-level-badge {
  padding: 2px 8px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.mini-cat-badge { color: var(--text3); font-size: 11px; font-weight: 600; }

.mini-card-actions { position: relative; flex: none; }

.add-to-day-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--hl);
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 11px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s var(--ease);
}

.add-to-day-btn:hover { color: #fff; background: var(--color-botones, var(--hl)); transform: scale(1.06); }

.add-day-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 30;
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  min-width: 184px;
  background: #17181c;
  border: 1px solid var(--line2);
  border-radius: 13px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);
}

.add-day-dropdown button {
  padding: 8px 4px;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  transition: background 0.2s ease;
}

.add-day-dropdown button:hover { background: var(--hl); border-color: var(--hl); }

.empty-hint { padding: 22px 8px; color: var(--text3); font-size: 12.5px; text-align: center; }
.empty-hint p { margin: 0; }

/* ---------- Panel del día ---------- */
.day-detail-card { display: flex; flex-direction: column; gap: 22px; min-height: 440px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }

.day-detail-card.is-drop-target { border-color: var(--hl); box-shadow: 0 0 0 4px var(--hl-soft), 0 16px 38px rgba(0, 0, 0, 0.24); }

.day-detail-header {
  padding-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  border-bottom: 1px solid var(--line);
}

.day-title-group { min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }

.day-detail-title { margin: 3px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 600; line-height: 1.1; }

.count-pill {
  padding: 7px 13px;
  color: var(--hl);
  white-space: nowrap;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
}

.day-detail-actions { display: flex; align-items: center; gap: 14px; }

.rest-toggle { display: flex; align-items: center; gap: 10px; color: var(--text2); font-size: 12.5px; font-weight: 600; cursor: pointer; user-select: none; }

.switch { position: relative; width: 40px; height: 22px; flex: none; display: inline-block; }
.switch input { position: absolute; width: 0; height: 0; opacity: 0; }

.switch i {
  position: absolute;
  inset: 0;
  background: #303030;
  border-radius: 999px;
  transition: background 0.2s ease;
}

.switch i::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 16px;
  height: 16px;
  background: #aaa;
  border-radius: 50%;
  transition: transform 0.2s var(--ease), background 0.2s ease;
}

.switch input:checked + i { background: var(--hl); }
.switch input:checked + i::before { transform: translateX(18px); background: #fff; }
.switch input:focus-visible + i { box-shadow: 0 0 0 3px var(--hl-soft); }

.clear-day-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 11px;
  transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.clear-day-btn:hover { color: #f87171; border-color: rgba(248, 113, 113, 0.4); transform: translateY(-1px); }

/* Estados */
.state-box {
  flex: 1;
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text3);
  text-align: center;
  border: 1.5px solid transparent;
  border-radius: 18px;
}

.state-box.dashed { background: var(--surface); border: 1.5px dashed var(--line2); }

.waiting-icon-ring {
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 20px;
}

.waiting-icon-ring svg { width: 28px; height: 28px; }

.state-box h3,
.global-empty h3 { margin: 4px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 21px; font-weight: 600; }

.state-box p,
.global-empty p { max-width: 380px; margin: 0; font-size: 13.5px; line-height: 1.6; }

.global-empty { padding: 50px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text2); text-align: center; }

/* ---------- Tarjetas de rutina ---------- */
.routines-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }

.routine-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  cursor: grab;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), #0f0f0f;
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  transition: transform 0.3s var(--ease), border-color 0.25s ease, box-shadow 0.3s ease;
}

.routine-card:hover { transform: translateY(-4px); border-color: var(--hl-line); box-shadow: 0 20px 44px rgba(0, 0, 0, 0.4); }
.routine-card:active { cursor: grabbing; }

.card-media {
  position: relative;
  height: 170px;
  flex: none;
  display: grid;
  place-items: center;
  background: #060606;
  border-radius: 20px 20px 0 0;
}

.card-media img { width: 100%; height: 100%; padding: 14px; object-fit: contain; border-radius: 20px 20px 0 0; transition: transform 0.5s var(--ease); }
.routine-card:hover .card-media img { transform: scale(1.05); }

.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2), transparent 40%, rgba(15, 15, 15, 0.9));
  border-radius: 20px 20px 0 0;
  pointer-events: none;
}

.badge-container { position: absolute; top: 12px; left: 12px; z-index: 2; display: flex; align-items: center; gap: 6px; }

.badge-level {
  padding: 5px 10px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
}

.badge-order {
  padding: 5px 9px;
  color: var(--text2);
  background: rgba(10, 10, 10, 0.78);
  border: 1px solid var(--line2);
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
}

.media-actions { position: absolute; top: 10px; right: 10px; z-index: 3; display: flex; gap: 6px; }

.move-wrap { position: relative; }

.icon-action-btn {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: #fff;
  cursor: pointer;
  background: rgba(10, 10, 10, 0.78);
  border: 1px solid var(--line2);
  border-radius: 10px;
  backdrop-filter: blur(8px);
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.icon-action-btn svg { width: 14px; height: 14px; }
.icon-action-btn:hover { transform: translateY(-1px); border-color: transparent; }
.icon-action-btn.move-btn:hover { background: var(--hl); }
.icon-action-btn.delete-btn:hover { background: #ef4444; }

.move-dropdown { right: 0; left: auto; }

.card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 11px; }

.card-title-routine {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.muscle-tag { color: var(--text3); font-size: 11.5px; font-weight: 600; }
.muscle-tag strong { color: var(--hl); font-weight: 700; }

.routine-desc {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  color: var(--text2);
  font-size: 12.5px;
  line-height: 1.55;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.quick-prescription-pill {
  margin-top: auto;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line);
  border-radius: 13px;
}

.pill-item { min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
.pill-value { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 15px; font-weight: 600; line-height: 1.1; }
.pill-label { color: var(--text3); font-size: 10px; font-weight: 700; }
.pill-divider { width: 1px; height: 28px; background: var(--line2); }

.btn-explore {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, var(--hl));
  border: 0;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  transition: filter 0.2s ease, transform 0.2s var(--ease);
}

.btn-explore svg { width: 15px; height: 15px; }
.btn-explore:hover { filter: brightness(1.1); transform: translateY(-1px); }

/* =========================================================
   MODAL GENERAR
========================================================= */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.modal-content {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line2);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

.pop-enter-active, .pop-leave-active { transition: opacity 0.22s ease; }
.pop-enter-active .modal-content, .pop-leave-active .modal-content { transition: transform 0.25s var(--ease), opacity 0.22s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }
.pop-enter-from .modal-content, .pop-leave-to .modal-content { opacity: 0; transform: translateY(14px) scale(0.97); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.18); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--hl); }

.modal-header { margin-bottom: 14px; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }

.modal-header h2 { margin: 6px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 600; }

.close-btn {
  width: 36px;
  height: 36px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 11px;
  font-size: 20px;
  line-height: 1;
  transition: color 0.2s ease, background 0.2s ease;
}

.close-btn:hover { color: #fff; background: var(--surface-hover); }

.modal-desc { margin: 0 0 22px; color: var(--text2); font-size: 13.5px; line-height: 1.6; }

.gen-section { margin-bottom: 22px; display: flex; flex-direction: column; gap: 10px; }

.gen-section-title { color: var(--text3); font-size: 11px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; }

.day-chips-row { display: flex; flex-wrap: wrap; gap: 8px; }

.day-chip {
  height: 38px;
  padding: 0 16px;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.day-chip:hover { color: #fff; background: var(--surface-hover); }
.day-chip.active { color: #fff; background: var(--hl-mid); border-color: var(--hl-line); }

.gen-hint { margin: 0; color: var(--text3); font-size: 12px; }

.source-options-row { display: flex; flex-wrap: wrap; gap: 8px; }

.source-option {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.source-option input { accent-color: var(--hl); }
.source-option:hover { border-color: var(--hl-line); }
.source-option.active { color: #fff; background: var(--hl-soft); border-color: var(--hl); }

.day-goal-list { display: flex; flex-direction: column; gap: 8px; }

.day-goal-row {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.day-goal-name { width: 90px; flex: none; color: var(--title); font-size: 13px; font-weight: 700; }

.styled-select {
  height: 40px;
  padding: 0 32px 0 12px;
  color: #fff;
  cursor: pointer;
  appearance: none;
  color-scheme: dark;
  background-color: rgba(0, 0, 0, 0.28);
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.364%22%20height%3D%22292.364%22%3E%3Cpath%20fill%3D%22%2360a5fa%22%20d%3D%22M287.9 69.8c-4.3-4.3-11.3-4.3-15.6 0L146.1 195.8 20 69.8c-4.3-4.3-11.3-4.3-15.6 0s-4.3 11.3 0 15.6l133.4 133.4c4.3 4.3 11.3 4.3 15.6 0l133.5-133.4c4.3-4.3 4.3-11.3 0-15.6z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 9px auto;
  border: 1px solid var(--line2);
  border-radius: 11px;
  outline: none;
  font-size: 12.5px;
  font-weight: 600;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-select:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.styled-select option { background: #15171b; color: #fff; }

.day-goal-select { flex: 1; min-width: 0; max-width: 250px; }

.modal-footer { padding-top: 20px; display: flex; gap: 10px; border-top: 1px solid var(--line); }
.modal-footer .btn-primary-action,
.modal-footer .btn-ghost { flex: 1; }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .hero { grid-template-columns: minmax(0, 1fr); }
  .week-ring-card { max-width: 420px; }
  .planner-layout { grid-template-columns: minmax(0, 1fr); }
  .library-panel { position: static; }
  .library-list { max-height: 380px; }
}

@media (max-width: 768px) {
  .weekly-main { padding: 16px 12px 44px; gap: 16px; }

  .hero { padding: 22px 16px; border-radius: 20px; gap: 18px; }
  .hero::after { right: -120px; bottom: -210px; }
  .hero-actions { flex-direction: column; }
  .hero-actions > * { width: 100%; }
  .week-ring-card { max-width: none; }

  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .kpi-card:last-child { grid-column: 1 / -1; }
  .kpi-card { padding: 14px 16px; gap: 12px; border-radius: 17px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body strong { font-size: 26px; }

  /* La tira de la semana se desplaza de lado */
  .week-strip { display: flex; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; padding: 8px; border-radius: 17px; }
  .week-strip::-webkit-scrollbar { display: none; }
  .week-day { min-width: 72px; flex: none; scroll-snap-align: start; }

  .panel { padding: 18px 14px; border-radius: 20px; }
  .day-detail-card { min-height: 0; }
  .day-detail-header { align-items: flex-start; }
  .day-detail-title { font-size: 22px; }
  .routines-grid { grid-template-columns: minmax(0, 1fr); }

  .modal-backdrop { padding: 10px; }
  .modal-content { padding: 22px 16px; border-radius: 20px; }

  .day-chips-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
  .day-chip { padding: 0 2px; text-align: center; font-size: 12px; }

  .source-options-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .source-option:last-child:nth-child(odd) { grid-column: span 2; }

  .day-goal-row { flex-wrap: wrap; }
  .day-goal-select { width: 100%; max-width: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; }
}
</style>