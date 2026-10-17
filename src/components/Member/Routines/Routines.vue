<template>
  <HeadingMember>
  <NotificationSystem ref="toastRef" />

  <div class="saas-dashboard-wrapper">
    <main class="dashboard-main-container">

      <!-- 1. HERO -->
      <section id="tutorial-1" class="hero">
        <div class="hero-main">
          <div class="hero-top">
            <span class="eyebrow">{{ t.heroEyebrow }}</span>
            <div id="tutorial-9" class="athlete-counter-pill">
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span class="counter-num">{{ mySavedRoutines.length }}</span>
              <span class="counter-text">{{ t.savedLabel }}</span>
            </div>
          </div>

          <h1 class="main-heading">
            {{ t.mainTitle1 }} <span class="highlight-color">{{ t.mainTitle2 }}</span>
          </h1>
          <p class="hero-desc">{{ t.heroDesc }}</p>

          <ul class="hero-facts">
            <li><svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg><b>1,324</b> {{ t.exercisesLabel }}</li>
            <li><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg><b>{{ targetCategoriesKeys.length }}</b> {{ t.zonesLabel }}</li>
            <li><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg><b>{{ equipmentList.length }}</b> {{ t.equipmentsLabel }}</li>
          </ul>
        </div>

        <!-- Tarjeta IMC -->
        <aside class="imc-card" :class="imcTone">
          <span class="imc-card-label">{{ t.imcLabel }}</span>
          <div class="imc-value-row">
            <strong>{{ calculatedIMC }}</strong>
            <span class="imc-chip">{{ imcCategory }}</span>
          </div>

          <div class="imc-gauge" aria-hidden="true">
            <div class="imc-track"></div>
            <i class="imc-marker" :style="{ left: imcPercent + '%' }"></i>
          </div>
          <div class="imc-scale"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>

          <div class="imc-divider"></div>

          <div class="imc-meta">
            <span>{{ t.somatotypeLabel }}</span>
            <strong>{{ somatotype }}</strong>
          </div>
        </aside>
      </section>

      <!-- 2. PERFIL -->
      <section id="tutorial-2" class="profile-card">
        <header class="block-head">
          <div class="block-icon">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h2>{{ t.profileTitle }}</h2>
            <p>{{ t.profileSub }}</p>
          </div>
        </header>

        <div id="tutorial-3" class="metrics-grid">
          <label class="metric-tile">
            <span class="metric-ico"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
            <span class="metric-label">{{ t.ageLabel }}</span>
            <span class="metric-input">
              <input type="number" v-model.number="userProfile.age" min="10" max="100" />
              <small>{{ t.yearsUnit }}</small>
            </span>
          </label>

          <label class="metric-tile">
            <span class="metric-ico"><svg viewBox="0 0 24 24"><path d="M6.5 6.5h11L21 21H3z"/><path d="M8.5 6.5a3.5 3.5 0 0 1 7 0"/></svg></span>
            <span class="metric-label">{{ t.weightLabel }}</span>
            <span class="metric-input">
              <input type="number" v-model.number="userProfile.weight" min="30" max="250" />
              <small>kg</small>
            </span>
          </label>

          <label class="metric-tile">
            <span class="metric-ico"><svg viewBox="0 0 24 24"><path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4"/></svg></span>
            <span class="metric-label">{{ t.heightLabel }}</span>
            <span class="metric-input">
              <input type="number" v-model.number="userProfile.height" min="100" max="230" />
              <small>cm</small>
            </span>
          </label>

          <div class="metric-tile gender-tile">
            <span class="metric-ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></span>
            <span class="metric-label">{{ t.genderLabel }}</span>
            <div class="segmented" role="group">
              <button type="button" :class="{ active: userProfile.gender === 'male' }" @click="userProfile.gender = 'male'">{{ t.genderMale }}</button>
              <button type="button" :class="{ active: userProfile.gender === 'female' }" @click="userProfile.gender = 'female'">{{ t.genderFemale }}</button>
            </div>
          </div>
        </div>

        <div class="goal-block">
          <span class="field-title">{{ t.goalLabel }}</span>
          <div class="goal-grid">
            <button
              v-for="g in goalOptions"
              :key="g.value"
              type="button"
              class="goal-card"
              :class="{ active: userProfile.goal === g.value }"
              :aria-pressed="userProfile.goal === g.value"
              @click="userProfile.goal = g.value"
            >
              <span class="goal-ico"><svg viewBox="0 0 24 24"><path :d="g.icon"/></svg></span>
              <span class="goal-copy">
                <strong>{{ g.label }}</strong>
                <small>{{ g.hint }}</small>
              </span>
              <span class="goal-check"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
            </button>
          </div>
        </div>

        <footer class="profile-footer">
          <p>{{ t.calcHint }}</p>
          <button id="tutorial-4" type="button" class="btn-calculate-routines" @click="calculateRoutines">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            {{ t.calculateBtnText }}
          </button>
        </footer>
      </section>

      <!-- 3. FILTROS -->
      <section id="tutorial-5" class="filters-bar">
        <div class="filters-head">
          <span class="field-title">{{ t.filtersTitle }}</span>
          <button v-if="hasActiveFilters" type="button" class="link-btn" @click="clearFilters">{{ t.clearFilters }} ✕</button>
        </div>

        <div class="chip-filter-row zones-row">
          <button type="button" class="filter-chip" :class="{ active: activeBodyPartFilter === 'all' }" @click="activeBodyPartFilter = 'all'">{{ t.bodyPartAll }}</button>
          <button
            v-for="bp in targetCategoriesKeys"
            :key="bp"
            type="button"
            class="filter-chip"
            :class="{ active: activeBodyPartFilter === bp }"
            @click="activeBodyPartFilter = bp"
          >{{ t.catsShort[bp] }}</button>
        </div>

        <div class="filters-row">
          <div class="segmented level-seg" role="group">
            <button
              v-for="opt in levelOptions"
              :key="opt.value"
              type="button"
              :class="{ active: activeLevel === opt.value }"
              @click="activeLevel = opt.value"
            >{{ opt.label }}</button>
          </div>

          <label class="equipment-field">
            <span class="field-title">{{ t.equipmentLabel }}</span>
            <select id="equipment-select" v-model="activeEquipment" class="styled-select">
              <option value="all">{{ t.equipmentAll }}</option>
              <option v-for="eq in equipmentList" :key="eq" :value="eq">{{ eq }}</option>
            </select>
          </label>
        </div>
      </section>

      <!-- ESPERA -->
      <div v-if="!hasCalculated" class="waiting-calculation-box glass-card">
        <div class="waiting-icon-ring">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <h3>{{ t.waitingTitle }}</h3>
        <p>{{ t.waitingDesc }}</p>
        <button type="button" class="btn-primary-action" @click="calculateRoutines">{{ t.calculateBtnText }}</button>
      </div>

      <!-- CARGA -->
      <div v-else-if="loadingExercises" class="loading-state-box glass-card">
        <span class="loading-spinner"></span>
        <p class="hero-desc">{{ t.loadingText }}</p>
      </div>

      <!-- ZONAS DEL CUERPO (CARRUSEL POR PÁGINAS) -->
      <div v-else class="body-parts-container">

        <section v-for="(catGroup, gi) in categorizedRoutines" :key="catGroup.id" class="body-part-section">

          <header class="category-section-header">
            <div class="cat-head-main">
              <div class="cat-icon">
                <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
              </div>
              <div class="cat-head-copy">
                <h2 :id="gi === 0 ? 'tutorial-6' : null" class="section-category-title">{{ catGroup.name }}</h2>
                <p class="cat-recommendation-note">{{ getBodyPartCustomTip(catGroup.id) }}</p>
              </div>
            </div>

            <div class="cat-head-side">
              <span class="section-count-badge">{{ catGroup.routines.length }} {{ t.resultsLabel }}</span>

              <div v-if="totalPages(catGroup) > 1" class="carousel-nav">
                <span class="range-label">{{ rangeLabel(catGroup) }}</span>
                <button
                  type="button"
                  class="nav-arrow"
                  :disabled="pageOf(catGroup) === 0"
                  :aria-label="t.prevBtn"
                  :title="t.prevBtn"
                  @click="goPage(catGroup, -1)"
                >
                  <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  type="button"
                  class="nav-arrow"
                  :disabled="pageOf(catGroup) >= totalPages(catGroup) - 1"
                  :aria-label="t.nextBtn"
                  :title="t.nextBtn"
                  @click="goPage(catGroup, 1)"
                >
                  <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </header>

          <template v-if="catGroup.routines.length > 0">
            <div
              class="carousel-viewport"
              @touchstart.passive="onTouchStart"
              @touchend.passive="onTouchEnd($event, catGroup)"
            >
              <transition :name="'slide-' + (dirs[catGroup.id] || 'next')" mode="out-in">
                <div :key="pageOf(catGroup)" class="routines-grid" :style="{ '--cols': perPage }">

                  <article
                    v-for="(routine, index) in visibleRoutines(catGroup)"
                    :key="routine.id"
                    class="routine-card"
                    :id="gi === 0 && index === 0 ? 'tutorial-7' : null"
                  >
                    <div class="card-media">
                      <img
                        :src="'/' + routine.image"
                        :alt="routine.name"
                        loading="lazy"
                        @error="(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'; }"
                      />
                      <div class="media-overlay"></div>

                      <div class="badge-container">
                        <span class="badge-level">{{ translateLevel(routine.level) }}</span>
                      </div>

                      <button
                        type="button"
                        class="icon-action-btn"
                        :class="{ 'is-saved': isRoutineSaved(routine.id) }"
                        :aria-pressed="isRoutineSaved(routine.id)"
                        @click="toggleSaveRoutine(routine)"
                      >
                        <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                        {{ isRoutineSaved(routine.id) ? t.savedBtn : t.addBtn }}
                      </button>
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

                      <button
                        :id="gi === 0 && index === 0 ? 'tutorial-8' : null"
                        type="button"
                        class="btn-explore"
                        @click="viewRoutineDetails(routine)"
                      >
                        {{ t.viewDetails }}
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </article>

                </div>
              </transition>
            </div>

            <!-- Progreso del carrusel -->
            <div v-if="totalPages(catGroup) > 1" class="carousel-footer">
              <div class="progress-track" role="progressbar" :aria-valuenow="pageOf(catGroup) + 1" :aria-valuemax="totalPages(catGroup)">
                <i :style="{ width: ((pageOf(catGroup) + 1) / totalPages(catGroup)) * 100 + '%' }"></i>
              </div>
              <span class="page-label">{{ t.pageLabel }} {{ pageOf(catGroup) + 1 }} / {{ totalPages(catGroup) }}</span>
            </div>
          </template>

          <div v-else class="empty-category-box">
            <p>{{ t.noResultsCategory }}</p>
          </div>
        </section>
      </div>

      <RoutineDetailModal
        v-if="selectedRoutine"
        :routine="selectedRoutine"
        :isSaved="isRoutineSaved(selectedRoutine.id)"
        :t="t"
        :description="getRoutineDescription(selectedRoutine)"
        :instructionsList="getRoutineInstructionsList(selectedRoutine)"
        :prescribedSets="getPrescribedSets(selectedRoutine)"
        :prescribedReps="getPrescribedReps(selectedRoutine)"
        :prescribedRest="getPrescribedRest(selectedRoutine)"
        :translateLevel="translateLevel"
        @close="selectedRoutine = null"
        @toggle-save="toggleSaveRoutine"
      />

    </main>
  </div>
  </HeadingMember>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useLang } from '../useLang.js';
import RoutineDetailModal from '../Modals/RoutineDetailModal.vue';
import HeadingMember from '../HeadingMember.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const { lang } = useLang();

// Notificaciones (mismo componente que Rutinas Semanales)
const toastRef = ref(null);
const notify = (message, type = 'success', duration = 4000) => {
  toastRef.value?.notify(message, type, duration);
};

// PERFIL ANTROPOMÉTRICO
const userProfile = ref({
  age: 28,
  weight: 75,
  height: 175,
  gender: 'male',
  goal: 'hypertrophy'
});

const hasCalculated = ref(false);
const calculationTriggerKey = ref(0);

const calculateRoutines = () => {
  hasCalculated.value = true;
  calculationTriggerKey.value++;
  notify(t.value.calculatedToast, 'success');
};

const calculatedIMC = computed(() => {
  if (!userProfile.value.height || !userProfile.value.weight) return 0;
  const heightM = userProfile.value.height / 100;
  return (userProfile.value.weight / (heightM * heightM)).toFixed(1);
});

const imcCategory = computed(() => {
  const imc = parseFloat(calculatedIMC.value);
  if (!imc) return '';
  if (imc < 18.5) return lang.value === 'es' ? 'Bajo peso' : 'Underweight';
  if (imc < 25) return lang.value === 'es' ? 'Peso normal' : 'Normal weight';
  if (imc < 30) return lang.value === 'es' ? 'Sobrepeso' : 'Overweight';
  return lang.value === 'es' ? 'Obesidad' : 'Obesity';
});

const somatotype = computed(() => {
  const imc = parseFloat(calculatedIMC.value);
  if (!imc) return '';
  if (imc < 20) return lang.value === 'es' ? 'Ectomorfo (Delgado)' : 'Ectomorph';
  if (imc >= 25) return lang.value === 'es' ? 'Endomorfo (Robusto)' : 'Endomorph';
  return lang.value === 'es' ? 'Mesomorfo (Atlético)' : 'Mesomorph';
});

const traducciones = {
  es: {
    officialCatalog: "Catálogo Oficial",
    exercisesLabel: "Ejercicios",
    savedLabel: "Guardados",
    mainTitle1: "Recomendaciones por",
    mainTitle2: "Parte del Cuerpo",
    heroDesc: "Configura tus datos antropométricos y presiona calcular para obtener tu selección personalizada.",
    profileTitle: "Perfil Antropométrico y Objetivo",
    ageLabel: "Edad",
    weightLabel: "Peso",
    heightLabel: "Altura",
    genderLabel: "Género",
    genderMale: "Masculino",
    genderFemale: "Femenino",
    goalLabel: "Objetivo Principal",
    goalHypertrophy: "Hipertrofia (Volumen)",
    goalStrength: "Fuerza Máxima",
    goalEndurance: "Resistencia",
    goalFatLoss: "Definición / Quema grasa",
    imcLabel: "IMC",
    somatotypeLabel: "Somatotipo",
    calculateBtnText: "Calcular Rutinas Recomendadas",
    waitingTitle: "Esperando cálculo de rutina",
    waitingDesc: "Introduce tus datos y haz clic en calcular para mostrar los ejercicios ideales adaptados a tu perfil.",
    bodyPartFilterLabel: "Zona Corporal",
    bodyPartAll: "Todas las zonas",
    difficultyLabel: "Dificultad",
    levelAll: "Todos",
    levelBeginner: "Principiante",
    levelIntermediate: "Intermedio",
    levelAdvanced: "Avanzado",
    equipmentLabel: "Equipamiento",
    equipmentAll: "Todo el equipo",
    loadingText: "Calculando y sincronizando rutinas según tu tipo de cuerpo...",
    resultsLabel: "ejercicios recomendados",
    noResultsCategory: "No hay ejercicios con los filtros actuales para esta zona.",
    savedBtn: "Guardado",
    addBtn: "Añadir",
    muscleLabel: "Músculo",
    viewDetails: "Ver Detalle Completo",
    targetLabel: "Objetivo",
    bodyPartLabel: "Parte del cuerpo",
    instructionsTitle: "Instrucciones Paso a Paso",
    setsLabel: "Series sugeridas",
    repsLabel: "Repeticiones adaptadas",
    restLabel: "Descanso óptimo",
    removeRoutineBtn: "Quitar de mis rutinas",
    addRoutineBtn: "Añadir a mis rutinas",
    closeBtn: "Cerrar",
    heroEyebrow: "ARMA TU RUTINA",
    zonesLabel: "zonas",
    equipmentsLabel: "equipos",
    profileSub: "Con estos datos ajustamos series, repeticiones y ejercicios para ti.",
    yearsUnit: "años",
    calcHint: "Tus datos solo se usan para personalizar la selección. Puedes cambiarlos y recalcular cuando quieras.",
    filtersTitle: "Filtrar catálogo",
    clearFilters: "Limpiar filtros",
    routineSavedToast: "Rutina guardada en tus rutinas.",
    routineRemovedToast: "Rutina quitada de tus guardados.",
    calculatedToast: "Rutinas calculadas según tu perfil.",
    goalHints: {
      hypertrophy: "Más masa muscular",
      strength: "Cargas altas, pocas reps",
      endurance: "Más repeticiones",
      fat_loss: "Quema y definición"
    },
    setsShort: "series",
    repsShort: "repeticiones",
    prevBtn: "Anteriores",
    nextBtn: "Siguientes",
    pageLabel: "Página",
    of: "de",
    cats: {
      chest: "Pecho (Pectorales)",
      back: "Espalda y Dorsales",
      'upper legs': "Piernas Superiores (Cuádriceps / Glúteos)",
      'upper arms': "Brazos (Bíceps y Tríceps)",
      shoulders: "Hombros (Deltoides)",
      waist: "Cintura y Abdomen",
      'lower legs': "Piernas Inferiores (Pantorrillas)"
    },
    catsShort: {
      chest: "Pecho", back: "Espalda", 'upper legs': "Piernas sup.", 'upper arms': "Brazos",
      shoulders: "Hombros", waist: "Abdomen", 'lower legs': "Pantorrillas"
    },
    tips: {
      chest: "Ideal para expansión torácica y desarrollo del empuje horizontal.",
      back: "Enfocado en la tracción para mejorar postura y grosor de espalda.",
      'upper legs': "Zona de alta demanda energética; clave para el metabolismo basal.",
      'upper arms': "Trabajo analítico para bombeo y definición de brazos.",
      shoulders: "Proporciona amplitud visual y estabilidad articular.",
      waist: "Fortalecimiento del core para proteger la zona lumbar.",
      'lower legs': "Ejercicios de alta resistencia para soporte de pantorrillas."
    }
  },
  en: {
    officialCatalog: "Official Catalog",
    exercisesLabel: "Exercises",
    savedLabel: "Saved",
    mainTitle1: "Recommendations by",
    mainTitle2: "Body Part",
    heroDesc: "Set your anthropometric data and click calculate to get your customized selection.",
    profileTitle: "Anthropometric Profile & Goal",
    ageLabel: "Age",
    weightLabel: "Weight",
    heightLabel: "Height",
    genderLabel: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    goalLabel: "Main Goal",
    goalHypertrophy: "Hypertrophy (Growth)",
    goalStrength: "Max Strength",
    goalEndurance: "Endurance",
    goalFatLoss: "Fat Loss / Toning",
    imcLabel: "BMI",
    somatotypeLabel: "Somatotype",
    calculateBtnText: "Calculate Recommended Routines",
    waitingTitle: "Waiting for routine calculation",
    waitingDesc: "Enter your data and click calculate to display the ideal exercises tailored to your profile.",
    bodyPartFilterLabel: "Body Zone",
    bodyPartAll: "All Zones",
    difficultyLabel: "Difficulty",
    levelAll: "All",
    levelBeginner: "Beginner",
    levelIntermediate: "Intermediate",
    levelAdvanced: "Advanced",
    equipmentLabel: "Equipment",
    equipmentAll: "All Equipment",
    loadingText: "Calculating and syncing routines based on your body type...",
    resultsLabel: "recommended exercises",
    noResultsCategory: "No exercises match the current filters for this zone.",
    savedBtn: "Saved",
    addBtn: "Add",
    muscleLabel: "Muscle",
    viewDetails: "View Full Details",
    targetLabel: "Target",
    bodyPartLabel: "Body Part",
    instructionsTitle: "Step-by-Step Instructions",
    setsLabel: "Suggested Sets",
    repsLabel: "Adapted Repetitions",
    restLabel: "Optimal Rest",
    removeRoutineBtn: "Remove from routines",
    addRoutineBtn: "Add to routines",
    closeBtn: "Close",
    heroEyebrow: "BUILD YOUR ROUTINE",
    zonesLabel: "zones",
    equipmentsLabel: "equipment types",
    profileSub: "We use this data to adjust sets, reps and exercises for you.",
    yearsUnit: "years",
    calcHint: "Your data is only used to personalize the selection. Change it and recalculate anytime.",
    filtersTitle: "Filter catalog",
    clearFilters: "Clear filters",
    routineSavedToast: "Routine saved to your routines.",
    routineRemovedToast: "Routine removed from your saved list.",
    calculatedToast: "Routines calculated for your profile.",
    goalHints: {
      hypertrophy: "More muscle mass",
      strength: "Heavy loads, low reps",
      endurance: "Higher repetitions",
      fat_loss: "Burn and definition"
    },
    setsShort: "sets",
    repsShort: "repetitions",
    prevBtn: "Previous",
    nextBtn: "Next",
    pageLabel: "Page",
    of: "of",
    cats: {
      chest: "Chest (Pectorals)",
      back: "Back & Lats",
      'upper legs': "Upper Legs (Quads / Glutes)",
      'upper arms': "Arms (Biceps & Triceps)",
      shoulders: "Shoulders (Deltoids)",
      waist: "Waist & Abs",
      'lower legs': "Lower Legs (Calves)"
    },
    catsShort: {
      chest: "Chest", back: "Back", 'upper legs': "Upper legs", 'upper arms': "Arms",
      shoulders: "Shoulders", waist: "Abs", 'lower legs': "Calves"
    },
    tips: {
      chest: "Great for chest expansion and horizontal pushing power.",
      back: "Focused on pulling movements to improve posture and thickness.",
      'upper legs': "High energy demand zone; critical for basal metabolism.",
      'upper arms': "Targeted work for arm pump and definition.",
      shoulders: "Provides visual width and joint stability.",
      waist: "Core strengthening to protect the lower back.",
      'lower legs': "High endurance exercises for calf support."
    }
  }
};

const t = computed(() => traducciones[lang.value] || traducciones.es);

/* ---------- IMC visual ---------- */
const imcPercent = computed(() => {
  const imc = parseFloat(calculatedIMC.value) || 0;
  return Math.min(100, Math.max(0, ((imc - 15) / 25) * 100));
});

const imcTone = computed(() => {
  const imc = parseFloat(calculatedIMC.value) || 0;
  if (imc < 18.5) return 'tone-low';
  if (imc < 25) return 'tone-ok';
  if (imc < 30) return 'tone-over';
  return 'tone-high';
});

/* ---------- Objetivos ---------- */
const goalOptions = computed(() => [
  { value: 'hypertrophy', label: t.value.goalHypertrophy, hint: t.value.goalHints.hypertrophy, icon: 'M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11' },
  { value: 'strength', label: t.value.goalStrength, hint: t.value.goalHints.strength, icon: 'M13 2L3 14h9l-1 8 10-12h-9z' },
  { value: 'endurance', label: t.value.goalEndurance, hint: t.value.goalHints.endurance, icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { value: 'fat_loss', label: t.value.goalFatLoss, hint: t.value.goalHints.fat_loss, icon: 'M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-4 3 0-3-1-6-4-8 0 4-3 6-3 11 0 4 3 7 7 8z' }
]);

const activeEquipment = ref('all');
const activeLevel = ref('Todos');
const activeBodyPartFilter = ref('all');
const selectedRoutine = ref(null);

const levelOptions = computed(() => [
  { value: 'Todos', label: t.value.levelAll },
  { value: 'Principiante', label: t.value.levelBeginner },
  { value: 'Intermedio', label: t.value.levelIntermediate },
  { value: 'Avanzado', label: t.value.levelAdvanced }
]);

const hasActiveFilters = computed(
  () => activeBodyPartFilter.value !== 'all' || activeLevel.value !== 'Todos' || activeEquipment.value !== 'all'
);

const clearFilters = () => {
  activeBodyPartFilter.value = 'all';
  activeLevel.value = 'Todos';
  activeEquipment.value = 'all';
};

const mySavedRoutines = ref([]);
const routineLibrary = ref([]);
const loadingExercises = ref(true);

const equipmentList = [
  'body weight', 'dumbbell', 'cable', 'barbell', 'leverage machine',
  'band', 'smith machine', 'kettlebell', 'weighted'
];

const targetCategoriesKeys = ['chest', 'back', 'upper legs', 'upper arms', 'shoulders', 'waist', 'lower legs'];

/* =========================================================
   CARRUSEL POR PÁGINAS
   Cada zona muestra un bloque de tarjetas (4 en escritorio) y
   los botones avanzan al siguiente bloque.
========================================================= */
const perPage = ref(4);
const pages = reactive({});
const dirs = reactive({});

const calcPerPage = () => {
  const w = window.innerWidth;
  perPage.value = w >= 1200 ? 4 : w >= 900 ? 3 : w >= 620 ? 2 : 1;
};

const totalPages = (g) => Math.max(1, Math.ceil(g.routines.length / perPage.value));
const pageOf = (g) => Math.min(pages[g.id] || 0, totalPages(g) - 1);

const visibleRoutines = (g) => {
  const start = pageOf(g) * perPage.value;
  return g.routines.slice(start, start + perPage.value);
};

const rangeLabel = (g) => {
  const start = pageOf(g) * perPage.value + 1;
  const end = Math.min(start + perPage.value - 1, g.routines.length);
  return `${start}–${end} ${t.value.of} ${g.routines.length}`;
};

const goPage = (g, delta) => {
  const next = pageOf(g) + delta;
  if (next < 0 || next >= totalPages(g)) return;
  dirs[g.id] = delta > 0 ? 'next' : 'prev';
  pages[g.id] = next;
};

// Deslizar con el dedo en móvil
let touchStartX = null;
const onTouchStart = (e) => { touchStartX = e.changedTouches[0].clientX; };
const onTouchEnd = (e, g) => {
  if (touchStartX == null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) > 50) goPage(g, dx < 0 ? 1 : -1);
};

// Al cambiar filtros o recalcular, todas las zonas vuelven a la primera página
watch([activeBodyPartFilter, activeLevel, activeEquipment, calculationTriggerKey], () => {
  Object.keys(pages).forEach((k) => delete pages[k]);
});

onMounted(() => {
  calcPerPage();
  window.addEventListener('resize', calcPerPage);
});

onUnmounted(() => {
  window.removeEventListener('resize', calcPerPage);
});

/* ---------- Carga de datos ---------- */
onMounted(async () => {
  try {
    const response = await fetch('/data/exercises.json');
    if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');
    const data = await response.json();

    routineLibrary.value = data.map((item, index) => {
      let assignedLevel = 'Intermedio';
      if (item.equipment === 'body weight' || index % 3 === 0) assignedLevel = 'Principiante';
      else if (item.equipment === 'barbell' || item.equipment === 'leverage machine' || index % 5 === 0) assignedLevel = 'Avanzado';

      return {
        id: item.id || String(index + 1),
        name: item.name || 'Ejercicio sin nombre',
        category: item.category || 'other',
        body_part: item.body_part || 'general',
        equipment: item.equipment || 'other',
        target: item.target || 'general',
        level: assignedLevel,
        image: item.image || '',
        gif_url: item.gif_url || '',
        instructions: item.instructions || {},
        instruction_steps: item.instruction_steps || {}
      };
    });
  } catch (error) {
    console.error('Error al cargar exercises.json:', error);
  } finally {
    loadingExercises.value = false;
  }
});

const translateLevel = (level) => {
  if (level === 'Principiante') return t.value.levelBeginner;
  if (level === 'Intermedio') return t.value.levelIntermediate;
  if (level === 'Avanzado') return t.value.levelAdvanced;
  return level;
};

const getPrescribedSets = (routine) => {
  const age = userProfile.value.age;
  const goal = userProfile.value.goal;

  if (age < 15 || age >= 60) return '2 - 3';
  if (goal === 'strength') return '4 - 5';
  if (routine.category === 'cardio' || routine.category === 'waist') return '3';
  return '3 - 4';
};

const getPrescribedReps = (routine) => {
  const goal = userProfile.value.goal;
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
  const goal = userProfile.value.goal;
  if (goal === 'strength') return '120s - 180s';
  if (goal === 'fat_loss') return '30s - 45s';
  if (routine.category === 'upper legs') return '90s - 120s';
  return '60s - 90s';
};

const getBodyPartCustomTip = (catId) => {
  return t.value.tips[catId] || 'Rutina recomendada para desarrollo equilibrado.';
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

const categorizedRoutines = computed(() => {
  const _trigger = calculationTriggerKey.value;
  const profile = userProfile.value;
  const imc = parseFloat(calculatedIMC.value) || 21;

  const categoriesToProcess = activeBodyPartFilter.value === 'all'
    ? targetCategoriesKeys
    : [activeBodyPartFilter.value];

  return categoriesToProcess.map(catKey => {
    const matchingRoutines = routineLibrary.value.filter(routine => {
      const matchesCategory = routine.category === catKey;
      const matchesEquipment = activeEquipment.value === 'all' || routine.equipment === activeEquipment.value;
      const matchesLevel = activeLevel.value === 'Todos' || routine.level === activeLevel.value;

      if (!matchesCategory || !matchesEquipment || !matchesLevel) return false;

      if (profile.age < 16 && routine.equipment === 'barbell' && routine.level === 'Avanzado') {
        return false;
      }

      if (imc < 18.5 && profile.goal === 'fat_loss') {
        if (routine.equipment === 'leverage machine' && routine.level === 'Avanzado') return false;
      }

      return true;
    });

    return {
      id: catKey,
      name: t.value.cats[catKey] || catKey,
      routines: matchingRoutines
    };
  });
});

const isRoutineSaved = (id) => mySavedRoutines.value.includes(id);

const toggleSaveRoutine = (routine) => {
  const index = mySavedRoutines.value.indexOf(routine.id);
  if (index > -1) {
    mySavedRoutines.value.splice(index, 1);
    notify(t.value.routineRemovedToast, 'info');
  } else {
    mySavedRoutines.value.push(routine.id);
    notify(t.value.routineSavedToast, 'success');
  }
};

const viewRoutineDetails = (routine) => {
  selectedRoutine.value = routine;
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
.saas-dashboard-wrapper {
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

.dashboard-main-container {
  flex: 1;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 30px clamp(14px, 3vw, 32px) 64px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 2px solid var(--hl);
  outline-offset: 2px;
}

.glass-card {
  position: relative;
  overflow: hidden;
  padding: 30px 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line2);
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32);
}

/* =========================================================
   HERO
========================================================= */
.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--hl);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.eyebrow::before { content: ''; width: 14px; height: 2px; border-radius: 2px; background: currentColor; }

.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
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
.imc-card { position: relative; z-index: 1; }

.hero-main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

.hero-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }

.athlete-counter-pill {
  padding: 7px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 10, 10, 0.55);
  border: 1px solid var(--line2);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.athlete-counter-pill svg { color: var(--hl); width: 14px; height: 14px; }
.counter-num { color: #fff; font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 700; line-height: 1; }
.counter-text { color: var(--text3); font-size: 11px; font-weight: 700; }

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

.hero-facts { margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; list-style: none; }

.hero-facts li {
  padding: 8px 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text2);
  background: rgba(10, 10, 10, 0.5);
  border: 1px solid var(--line2);
  border-radius: 999px;
  font-size: 12px;
}

.hero-facts li svg { width: 14px; height: 14px; color: var(--hl); }
.hero-facts li b { color: #fff; font-weight: 800; }

/* ---------- Tarjeta IMC ---------- */
.imc-card {
  --tone: var(--green);

  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid var(--line2);
  border-radius: 22px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.imc-card.tone-low { --tone: #60a5fa; }
.imc-card.tone-ok { --tone: var(--green); }
.imc-card.tone-over { --tone: #fbbf24; }
.imc-card.tone-high { --tone: #f87171; }

.imc-card-label { color: var(--text3); font-size: 11px; font-weight: 800; letter-spacing: 1px; }

.imc-value-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }

.imc-value-row strong {
  color: #fff;
  font-family: 'Oswald', sans-serif;
  font-size: 52px;
  font-weight: 600;
  line-height: 1;
  text-shadow: 0 0 30px color-mix(in srgb, var(--tone) 50%, transparent);
}

.imc-chip {
  padding: 6px 12px;
  color: var(--tone);
  white-space: nowrap;
  background: color-mix(in srgb, var(--tone) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
}

.imc-gauge { position: relative; height: 12px; margin-top: 4px; }

.imc-track {
  position: absolute;
  inset: 3px 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa 0%, #60a5fa 14%, #34d399 14%, #34d399 40%, #fbbf24 40%, #fbbf24 60%, #f87171 60%);
  opacity: 0.85;
}

.imc-marker {
  position: absolute;
  top: 0;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  background: #fff;
  border: 3px solid var(--tone);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--tone);
  transition: left 0.5s var(--ease);
}

.imc-scale { display: flex; justify-content: space-between; color: var(--text3); font-size: 10px; font-weight: 700; }

.imc-divider { height: 1px; background: var(--line); }

.imc-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.imc-meta span { color: var(--text3); font-size: 11.5px; font-weight: 700; }
.imc-meta strong { color: #fff; font-size: 13px; text-align: right; }

/* =========================================================
   PERFIL
========================================================= */
.profile-card {
  padding: 28px 30px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.block-head { display: flex; align-items: center; gap: 14px; }

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

.block-head h2 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; }
.block-head p { margin: 3px 0 0; color: var(--text3); font-size: 12.5px; }

.field-title { color: var(--text3); font-size: 11px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; }

.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }

.metric-tile {
  --ico: var(--hl);

  position: relative;
  min-width: 0;
  padding: 16px 16px 14px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  grid-template-areas: 'ico label' 'val val';
  align-items: center;
  gap: 10px 10px;
  cursor: text;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.metric-tile:hover { border-color: var(--line2); }
.metric-tile:focus-within { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }

.metric-ico {
  grid-area: ico;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
}

.metric-ico svg { width: 16px; height: 16px; }

.metric-label { grid-area: label; color: var(--text2); font-size: 12px; font-weight: 700; }

.metric-input { grid-area: val; display: flex; align-items: baseline; gap: 8px; }

.metric-input input {
  width: 100%;
  min-width: 0;
  padding: 0;
  color: #fff;
  background: transparent;
  border: 0;
  outline: none;
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1.1;
  -moz-appearance: textfield;
}

.metric-input input::-webkit-outer-spin-button,
.metric-input input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.metric-input small { color: var(--text3); font-size: 12px; font-weight: 700; }

.gender-tile { cursor: default; }
.gender-tile .segmented { grid-area: val; }

.segmented {
  padding: 4px;
  display: flex;
  gap: 3px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line2);
  border-radius: 13px;
}

.segmented button {
  height: 34px;
  padding: 0 14px;
  flex: 1;
  color: var(--text2);
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease;
}

.segmented button:hover { color: #fff; }
.segmented button.active { color: #fff; background: var(--hl); }

/* ---------- Objetivo ---------- */
.goal-block { display: flex; flex-direction: column; gap: 12px; }

.goal-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }

.goal-card {
  position: relative;
  min-width: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 13px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.goal-card:hover { background: var(--surface-hover); transform: translateY(-2px); }

.goal-card.active { background: var(--hl-soft); border-color: var(--hl); box-shadow: 0 0 0 1px var(--hl-soft), 0 12px 26px rgba(0, 0, 0, 0.25); }

.goal-ico {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--text2);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.goal-ico svg { width: 18px; height: 18px; }

.goal-card.active .goal-ico { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }

.goal-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.goal-copy strong { color: var(--title); font-size: 13px; font-weight: 700; line-height: 1.25; }
.goal-copy small { color: var(--text3); font-size: 11px; line-height: 1.35; }

.goal-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--hl);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.2s ease, transform 0.2s var(--ease);
}

.goal-check svg { width: 11px; height: 11px; stroke-width: 3; }
.goal-card.active .goal-check { opacity: 1; transform: scale(1); }

.profile-footer {
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  border-top: 1px solid var(--line);
}

.profile-footer p { max-width: 460px; margin: 0; color: var(--text3); font-size: 12.5px; line-height: 1.55; }

.btn-calculate-routines,
.btn-primary-action {
  min-height: 48px;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, var(--hl));
  border: 0;
  border-radius: 14px;
  box-shadow: 0 10px 26px color-mix(in srgb, var(--hl) 30%, transparent);
  font-size: 13.5px;
  font-weight: 700;
  transition: filter 0.2s ease, transform 0.2s var(--ease), box-shadow 0.2s ease;
}

.btn-calculate-routines svg { width: 17px; height: 17px; }

.btn-calculate-routines:hover,
.btn-primary-action:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 16px 34px color-mix(in srgb, var(--hl) 38%, transparent); }

/* =========================================================
   FILTROS
========================================================= */
.filters-bar {
  position: sticky;
  top: 82px;
  z-index: 30;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: color-mix(in srgb, var(--card) 92%, transparent);
  border: 1px solid var(--line2);
  border-radius: 20px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
}

.filters-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }

.link-btn {
  padding: 6px 12px;
  color: var(--hl);
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.link-btn:hover { background: var(--hl-mid); border-color: var(--hl-line); }

.chip-filter-row { display: flex; flex-wrap: wrap; gap: 8px; }

.filter-chip {
  height: 36px;
  padding: 0 15px;
  color: var(--text2);
  white-space: nowrap;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.filter-chip:hover { color: #fff; background: var(--surface-hover); }
.filter-chip.active { color: #fff; background: var(--hl-mid); border-color: var(--hl-line); }

.filters-row { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; }

.level-seg { flex: none; }

.equipment-field { width: 260px; display: flex; flex-direction: column; gap: 7px; }

.styled-select {
  width: 100%;
  height: 44px;
  padding: 0 34px 0 14px;
  color: #fff;
  cursor: pointer;
  appearance: none;
  color-scheme: dark;
  background-color: rgba(0, 0, 0, 0.28);
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.364%22%20height%3D%22292.364%22%3E%3Cpath%20fill%3D%22%2360a5fa%22%20d%3D%22M287.9 69.8c-4.3-4.3-11.3-4.3-15.6 0L146.1 195.8 20 69.8c-4.3-4.3-11.3-4.3-15.6 0s-4.3 11.3 0 15.6l133.4 133.4c4.3 4.3 11.3 4.3 15.6 0l133.5-133.4c4.3-4.3 4.3-11.3 0-15.6z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 9px auto;
  border: 1px solid var(--line2);
  border-radius: 12px;
  outline: none;
  font-size: 13.5px;
  font-weight: 600;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-select:hover { border-color: rgba(255, 255, 255, 0.25); }
.styled-select:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.styled-select option { background: #15171b; color: #fff; }

/* =========================================================
   ESTADOS
========================================================= */
.waiting-calculation-box {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--text2);
  text-align: center;
}

.waiting-icon-ring {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 20px;
}

.waiting-icon-ring svg { width: 30px; height: 30px; }

.waiting-calculation-box h3 { margin: 4px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; }
.waiting-calculation-box p { max-width: 420px; margin: 0 0 8px; font-size: 13.5px; line-height: 1.6; }

.loading-state-box { padding: 50px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--hl-mid);
  border-top-color: var(--hl);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* =========================================================
   ZONAS / CARRUSEL
========================================================= */
.body-parts-container { display: flex; flex-direction: column; gap: 22px; }

.body-part-section {
  min-width: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 30%), var(--card);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.category-section-header {
  padding-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  border-bottom: 1px solid var(--line);
}

.cat-head-main { min-width: 0; display: flex; align-items: center; gap: 14px; flex: 1; }

.cat-icon {
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

.cat-icon svg { width: 20px; height: 20px; }

.cat-head-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.section-category-title {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.cat-recommendation-note { margin: 0; color: var(--text3); font-size: 12.5px; line-height: 1.5; }

.cat-head-side { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }

.section-count-badge {
  padding: 7px 13px;
  color: var(--hl);
  white-space: nowrap;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
}

.carousel-nav { display: flex; align-items: center; gap: 8px; }

.range-label { margin-right: 4px; color: var(--text3); font-size: 12px; font-weight: 600; white-space: nowrap; }

.nav-arrow {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--title);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 12px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s var(--ease);
}

.nav-arrow svg { width: 18px; height: 18px; }

.nav-arrow:hover:not(:disabled) {
  color: #fff;
  background: var(--color-botones, var(--hl));
  border-color: transparent;
  transform: translateY(-1px);
}

.nav-arrow:disabled { opacity: 0.35; cursor: not-allowed; }

.carousel-viewport { min-width: 0; overflow: hidden; touch-action: pan-y; }

.routines-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
  gap: 18px;
}

/* Transición de página */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active { transition: opacity 0.22s ease, transform 0.22s var(--ease); }

.slide-next-leave-to { opacity: 0; transform: translateX(-28px); }
.slide-next-enter-from { opacity: 0; transform: translateX(28px); }
.slide-prev-leave-to { opacity: 0; transform: translateX(28px); }
.slide-prev-enter-from { opacity: 0; transform: translateX(-28px); }

.carousel-footer { display: flex; align-items: center; gap: 14px; }

.progress-track { flex: 1; height: 4px; overflow: hidden; background: rgba(255, 255, 255, 0.07); border-radius: 999px; }

.progress-track i { display: block; height: 100%; background: var(--hl); border-radius: 999px; transition: width 0.35s var(--ease); }

.page-label { flex: none; color: var(--text3); font-size: 11.5px; font-weight: 700; }

.empty-category-box {
  padding: 28px;
  color: var(--text3);
  font-size: 13px;
  text-align: center;
  background: var(--surface);
  border: 1.5px dashed var(--line2);
  border-radius: 16px;
}

.empty-category-box p { margin: 0; }

/* =========================================================
   TARJETA DE RUTINA
========================================================= */
.routine-card {
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), #0f0f0f;
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  transition: transform 0.3s var(--ease), border-color 0.25s ease, box-shadow 0.3s ease;
}

.routine-card:hover { transform: translateY(-4px); border-color: var(--hl-line); box-shadow: 0 20px 44px rgba(0, 0, 0, 0.4); }

.card-media {
  position: relative;
  height: 180px;
  flex: none;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #060606;
}

.card-media img {
  width: 100%;
  height: 100%;
  padding: 14px;
  object-fit: contain;
  transition: transform 0.5s var(--ease);
}

.routine-card:hover .card-media img { transform: scale(1.05); }

.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2), transparent 40%, rgba(15, 15, 15, 0.9));
  pointer-events: none;
}

.badge-container { position: absolute; top: 12px; left: 12px; z-index: 2; }

.badge-level {
  padding: 5px 10px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
}

.icon-action-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  height: 32px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  cursor: pointer;
  background: rgba(10, 10, 10, 0.78);
  border: 1px solid var(--line2);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 700;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.icon-action-btn svg { width: 13px; height: 13px; }
.icon-action-btn:hover { background: var(--hl); border-color: transparent; transform: translateY(-1px); }
.icon-action-btn.is-saved { background: #10b981; border-color: #10b981; }

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
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .hero { grid-template-columns: minmax(0, 1fr); }
  .imc-card { max-width: 420px; }
  .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .goal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .filters-bar { top: 76px; }
}

@media (max-width: 768px) {
  .dashboard-main-container { padding: 16px 12px 44px; gap: 18px; }
  .glass-card { padding: 22px 16px; border-radius: 20px; }

  .hero { padding: 22px 16px; border-radius: 20px; gap: 18px; }
  .hero::after { right: -120px; bottom: -210px; }
  .imc-card { max-width: none; }
  .imc-value-row strong { font-size: 44px; }

  .profile-card { padding: 20px 16px; border-radius: 20px; }
  .metric-input input { font-size: 28px; }
  .profile-footer { flex-direction: column; align-items: stretch; }
  .btn-calculate-routines { width: 100%; }

  .filters-bar { top: 70px; padding: 12px; border-radius: 17px; }
  .zones-row { flex-wrap: nowrap; overflow-x: auto; margin: 0 -12px; padding: 0 12px 2px; scrollbar-width: none; }
  .zones-row::-webkit-scrollbar { display: none; }
  .filters-row { flex-direction: column; align-items: stretch; }
  .level-seg { overflow-x: auto; scrollbar-width: none; }
  .equipment-field { width: 100%; }

  .body-part-section { padding: 18px 14px; border-radius: 20px; }
  .category-section-header { align-items: flex-start; }
  .cat-head-side { width: 100%; justify-content: space-between; }
  .section-category-title { font-size: 19px; }
  .card-media { height: 200px; }
}

@media (max-width: 520px) {
  .metrics-grid { grid-template-columns: minmax(0, 1fr); }
  .goal-grid { grid-template-columns: minmax(0, 1fr); }
  .range-label { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; }
}
</style>