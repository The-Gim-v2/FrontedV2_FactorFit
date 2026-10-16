<template>
  <HeadingMember>
  <div class="saas-dashboard-wrapper">
    <main class="dashboard-main-container">

      <!-- HEADER / CABECERA CON PERFIL ANTROPOMÉTRICO -->
      <section id="tutorial-1" class="glass-card header-card">
        <div class="header-top-row">
          <span class="gym-badge-tag">{{ t.officialCatalog }} • 1,324 {{ t.exercisesLabel }}</span>
          <div id="tutorial-9" class="athlete-counter-pill">
            <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span class="counter-num">{{ mySavedRoutines.length }}</span>
            <span class="counter-text">{{ t.savedLabel }}</span>
          </div>
        </div>

        <div class="header-titles">
          <h1 class="main-heading">
            {{ t.mainTitle1 }} <span class="highlight-color">{{ t.mainTitle2 }}</span>
          </h1>
          <p class="hero-desc">{{ t.heroDesc }}</p>
        </div>

        <!-- PANEL ANTROPOMÉTRICO -->
        <div id="tutorial-2" class="anthropometric-panel">
          <div class="panel-title-row">
            <span class="panel-title">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ t.profileTitle }}
            </span>
            <div class="badges-row" v-if="calculatedIMC">
              <span class="imc-badge">{{ t.imcLabel }}: <strong>{{ calculatedIMC }}</strong> · {{ imcCategory }}</span>
              <span class="somatotype-badge">{{ t.somatotypeLabel }}: <strong>{{ somatotype }}</strong></span>
            </div>
          </div>

          <div id="tutorial-3" class="anthropometric-grid">
            <div class="input-group">
              <label>{{ t.ageLabel }}</label>
              <input type="number" v-model.number="userProfile.age" min="10" max="100" class="styled-input" />
            </div>
            <div class="input-group">
              <label>{{ t.weightLabel }} (kg)</label>
              <input type="number" v-model.number="userProfile.weight" min="30" max="250" class="styled-input" />
            </div>
            <div class="input-group">
              <label>{{ t.heightLabel }} (cm)</label>
              <input type="number" v-model.number="userProfile.height" min="100" max="230" class="styled-input" />
            </div>
            <div class="input-group">
              <label>{{ t.genderLabel }}</label>
              <select v-model="userProfile.gender" class="styled-select">
                <option value="male">{{ t.genderMale }}</option>
                <option value="female">{{ t.genderFemale }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>{{ t.goalLabel }}</label>
              <select v-model="userProfile.goal" class="styled-select">
                <option value="hypertrophy">{{ t.goalHypertrophy }}</option>
                <option value="strength">{{ t.goalStrength }}</option>
                <option value="endurance">{{ t.goalEndurance }}</option>
                <option value="fat_loss">{{ t.goalFatLoss }}</option>
              </select>
            </div>
          </div>

          <div class="calculate-action-row">
            <button id="tutorial-4" type="button" class="btn-calculate-routines" @click="calculateRoutines">
              <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              {{ t.calculateBtnText }}
            </button>
          </div>
        </div>

        <div class="header-divider"></div>

        <!-- FILTROS -->
        <div id="tutorial-5" class="filters-toolbar">
          <div class="filter-block">
            <span class="filter-block-title">{{ t.bodyPartFilterLabel }}</span>
            <div class="chip-filter-row">
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
          </div>

          <div class="filters-row">
            <div class="filter-block">
              <span class="filter-block-title">{{ t.difficultyLabel }}</span>
              <div class="chip-filter-row">
                <button
                  v-for="opt in levelOptions"
                  :key="opt.value"
                  type="button"
                  class="filter-chip"
                  :class="{ active: activeLevel === opt.value }"
                  @click="activeLevel = opt.value"
                >{{ opt.label }}</button>
              </div>
            </div>

            <div class="filter-block equipment-block">
              <label for="equipment-select" class="filter-block-title">{{ t.equipmentLabel }}</label>
              <select id="equipment-select" v-model="activeEquipment" class="styled-select">
                <option value="all">{{ t.equipmentAll }}</option>
                <option v-for="eq in equipmentList" :key="eq" :value="eq">{{ eq }}</option>
              </select>
            </div>
          </div>
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

const { lang } = useLang();

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
  } else {
    mySavedRoutines.value.push(routine.id);
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
   HEADER
========================================================= */
.header-card { display: flex; flex-direction: column; gap: 22px; }

.header-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--hl), transparent 70%);
}

.header-top-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

.gym-badge-tag {
  padding: 6px 13px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.athlete-counter-pill {
  padding: 7px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 999px;
}

.athlete-counter-pill svg { color: var(--hl); width: 14px; height: 14px; }
.counter-num { color: #fff; font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 700; line-height: 1; }
.counter-text { color: var(--text3); font-size: 11px; font-weight: 700; }

.header-titles { display: flex; flex-direction: column; gap: 10px; }

.main-heading {
  margin: 0;
  color: var(--title);
  font-family: 'Anton', sans-serif;
  font-size: clamp(28px, 3.6vw, 44px);
  font-weight: 400;
  letter-spacing: 0.3px;
  line-height: 1.08;
  text-transform: uppercase;
}

.highlight-color { color: var(--hl); }

.hero-desc { max-width: 620px; margin: 0; color: var(--text2); font-size: 14px; line-height: 1.6; }

/* ---------- Perfil antropométrico ---------- */
.anthropometric-panel {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.panel-title-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }

.panel-title { display: flex; align-items: center; gap: 9px; color: var(--title); font-size: 13px; font-weight: 700; }
.panel-title svg { color: var(--hl); }

.badges-row { display: flex; flex-wrap: wrap; gap: 8px; }

.imc-badge,
.somatotype-badge {
  padding: 6px 11px;
  color: var(--green);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 9px;
  font-size: 12px;
}

.somatotype-badge { color: #93c5fd; background: var(--hl-soft); border-color: var(--hl-line); }

.anthropometric-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }

.input-group { min-width: 0; display: flex; flex-direction: column; gap: 7px; }

.input-group label,
.filter-block-title {
  color: var(--text3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.styled-input,
.styled-select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line2);
  border-radius: 11px;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.styled-input:hover,
.styled-select:hover { border-color: rgba(255, 255, 255, 0.25); }

.styled-input:focus,
.styled-select:focus { border-color: var(--hl); background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 0 3px var(--hl-soft); }

.styled-select {
  padding-right: 34px;
  cursor: pointer;
  appearance: none;
  color-scheme: dark;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.364%22%20height%3D%22292.364%22%3E%3Cpath%20fill%3D%22%2360a5fa%22%20d%3D%22M287.9 69.8c-4.3-4.3-11.3-4.3-15.6 0L146.1 195.8 20 69.8c-4.3-4.3-11.3-4.3-15.6 0s-4.3 11.3 0 15.6l133.4 133.4c4.3 4.3 11.3 4.3 15.6 0l133.5-133.4c4.3-4.3 4.3-11.3 0-15.6z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 9px auto;
}

.styled-select option { background: #15171b; color: #fff; }

.calculate-action-row { display: flex; justify-content: flex-end; }

.btn-calculate-routines,
.btn-primary-action {
  min-height: 44px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, var(--hl));
  border: 0;
  border-radius: 12px;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 25%, transparent);
  font-size: 13px;
  font-weight: 700;
  transition: filter 0.2s ease, transform 0.2s var(--ease);
}

.btn-calculate-routines:hover,
.btn-primary-action:hover { filter: brightness(1.1); transform: translateY(-1px); }

.header-divider { height: 1px; background: var(--line); }

/* ---------- Filtros ---------- */
.filters-toolbar { display: flex; flex-direction: column; gap: 18px; }

.filters-row { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; }

.filter-block { min-width: 0; display: flex; flex-direction: column; gap: 10px; }

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

.equipment-block { width: 260px; }

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
  .anthropometric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .dashboard-main-container { padding: 16px 12px 44px; gap: 20px; }
  .glass-card { padding: 22px 16px; border-radius: 20px; }
  .anthropometric-panel { padding: 16px; }
  .anthropometric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .calculate-action-row { justify-content: stretch; }
  .btn-calculate-routines { width: 100%; }
  .equipment-block { width: 100%; }
  .filters-row { flex-direction: column; align-items: stretch; }

  .chip-filter-row { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 0 16px 2px; scrollbar-width: none; }
  .chip-filter-row::-webkit-scrollbar { display: none; }

  .body-part-section { padding: 18px 14px; border-radius: 20px; }
  .category-section-header { align-items: flex-start; }
  .cat-head-side { width: 100%; justify-content: space-between; }
  .section-category-title { font-size: 19px; }
  .card-media { height: 200px; }
}

@media (max-width: 480px) {
  .anthropometric-grid { grid-template-columns: minmax(0, 1fr); }
  .range-label { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; }
}
</style>