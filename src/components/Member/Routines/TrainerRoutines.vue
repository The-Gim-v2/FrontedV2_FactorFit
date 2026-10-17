<template>
  <HeadingMember>
    <NotificationSystem ref="toastRef" />

    <div class="trainers-page">
      <main class="trainers-container">

        <!-- =====================================================
             VISTA 1: LISTADO DE ENTRENADORES
        ====================================================== -->
        <template v-if="!selectedTrainer">

          <!-- 1. ENCABEZADO (#tutorial-1) -->
          <section id="tutorial-1" class="hero">
            <div class="hero-main">
              <span class="eyebrow">{{ t.trainerPlanTag }}</span>

              <h1>
                {{ t.trainerMainTitle1 }} <span>{{ t.trainerMainTitle2 }}</span>
              </h1>

              <p>{{ t.trainerHeroDesc }}</p>

              <div class="hero-actions">
                <button v-if="assignedTrainer" type="button" class="btn-primary" @click="selectTrainer(assignedTrainer)">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {{ t.viewRoutinesBtn }}
                </button>
                <button type="button" class="btn-ghost" @click="scrollToOthers">
                  <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {{ t.otherTrainersTitle }}
                </button>
              </div>
            </div>

            <!-- Tu entrenador -->
            <button v-if="assignedTrainer" type="button" class="hero-base" @click="selectTrainer(assignedTrainer)">
              <span class="hero-base-img">
                <img :src="assignedTrainer.avatar" :alt="assignedTrainer.name" />
              </span>
              <span class="hero-base-copy">
                <small>{{ t.myAssignedTrainerTitle }}</small>
                <strong>{{ assignedTrainer.name }}</strong>
                <span class="hero-base-meta">
                  <i class="dot open"></i>
                  {{ assignedTrainer.specialty }}
                </span>
              </span>
              <svg class="hero-base-arrow" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </section>

          <!-- 2. INDICADORES -->
          <section class="kpi-grid">
            <article class="kpi-card">
              <div class="kpi-icon accent">
                <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>
              </div>
              <div class="kpi-body">
                <strong class="highlight">{{ kpiTotal }}</strong>
                <span>{{ t.kpiTrainers }}</span>
              </div>
            </article>

            <article class="kpi-card">
              <div class="kpi-icon success">
                <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
              </div>
              <div class="kpi-body">
                <strong>{{ kpiAccessible }}</strong>
                <span>{{ t.kpiAccessible }}</span>
              </div>
            </article>

            <article class="kpi-card">
              <div class="kpi-icon">
                <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
              </div>
              <div class="kpi-body">
                <strong>{{ kpiRoutines }}</strong>
                <span>{{ t.kpiRoutines }}</span>
              </div>
            </article>

            <article class="kpi-card">
              <div class="kpi-icon warning">
                <svg viewBox="0 0 24 24"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
              </div>
              <div class="kpi-body">
                <strong>{{ kpiSpecialties }}</strong>
                <span>{{ t.kpiSpecialties }}</span>
              </div>
            </article>
          </section>

          <!-- 3. BARRA DE EXPLORACIÓN -->
          <section class="toolbar">
            <div class="toolbar-row">
              <label class="search-box">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  v-model="searchQuery"
                  type="search"
                  :placeholder="t.searchTrainerPlaceholder"
                  :aria-label="t.searchTrainerPlaceholder"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="clear-search"
                  :aria-label="t.clearSearch"
                  @click="searchQuery = ''"
                >&times;</button>
              </label>

              <label class="select-box">
                <span>{{ t.sortBy }}</span>
                <select v-model="sortBy">
                  <option value="relevance">{{ t.sortRelevance }}</option>
                  <option value="name">{{ t.sortName }}</option>
                  <option value="routines">{{ t.sortRoutines }}</option>
                </select>
              </label>

              <div class="view-toggle" role="group">
                <button type="button" :class="{ active: viewMode === 'grid' }" :title="t.viewGrid" :aria-label="t.viewGrid" @click="viewMode = 'grid'">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                </button>
                <button type="button" :class="{ active: viewMode === 'list' }" :title="t.viewList" :aria-label="t.viewList" @click="viewMode = 'list'">
                  <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
              </div>
            </div>

            <div class="toolbar-row chips-row">
              <div class="chips">
                <button type="button" class="chip" :class="{ active: onlyWithRoutines }" @click="onlyWithRoutines = !onlyWithRoutines">
                  <i class="dot open"></i>{{ t.filterWithRoutines }}
                </button>
                <button
                  v-if="!hasActiveMembership"
                  type="button"
                  class="chip"
                  :class="{ active: onlyAvailable }"
                  @click="onlyAvailable = !onlyAvailable"
                >
                  <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                  {{ t.filterAvailable }}
                </button>
              </div>
            </div>
          </section>

          <!-- Resultados -->
          <div class="results-bar">
            <span><b>{{ resultsCount }}</b> {{ resultsCount === 1 ? t.result : t.results }}</span>
            <button v-if="hasActiveFilters" type="button" class="link-btn" @click="clearFilters">
              {{ t.clearFilters }} ✕
            </button>
          </div>

          <!-- 4. MI ENTRENADOR ASIGNADO (#tutorial-2) -->
          <section v-if="showAssigned" id="tutorial-2" class="block">
            <header class="block-head">
              <div>
                <span class="section-eyebrow">{{ t.assignedBadge }}</span>
                <h2>{{ t.myAssignedTrainerTitle }}</h2>
                <p>{{ t.assignedSub }}</p>
              </div>
            </header>

            <article
              class="home-card"
              tabindex="0"
              role="link"
              @click="selectTrainer(assignedTrainer)"
              @keydown.enter="selectTrainer(assignedTrainer)"
            >
              <div class="home-media">
                <img :src="assignedTrainer.avatar" :alt="assignedTrainer.name" />
                <span class="open-badge open"><i></i>{{ t.assignedBadge }}</span>
              </div>

              <div class="home-body">
                <div class="home-title">
                  <h3>{{ assignedTrainer.name }}</h3>
                  <span class="base-badge">{{ assignedTrainer.specialty }}</span>
                </div>

                <p v-if="assignedTrainer.bio" class="bio-text">{{ assignedTrainer.bio }}</p>

                <ul class="meta">
                  <li v-if="assignedTrainer.phone">
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                    <span>{{ assignedTrainer.phone }}</span>
                  </li>
                  <li v-if="assignedTrainer.email">
                    <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg>
                    <span>{{ assignedTrainer.email }}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
                    <span>{{ routinesCount(assignedTrainer) }} {{ t.routinesWord }}</span>
                  </li>
                </ul>

                <div class="gym-actions">
                  <button type="button" class="btn-primary" @click.stop="selectTrainer(assignedTrainer)">{{ t.viewRoutinesBtn }}</button>
                  <a v-if="assignedTrainer.phone" class="btn-ghost icon-only" :href="telUrl(assignedTrainer)" :title="t.call" :aria-label="t.call" @click.stop>
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                  <a v-if="assignedTrainer.email" class="btn-ghost icon-only" :href="`mailto:${assignedTrainer.email}`" :title="t.emailLabel" :aria-label="t.emailLabel" @click.stop>
                    <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg>
                  </a>
                </div>
              </div>
            </article>
          </section>

          <!-- 5. OTROS ENTRENADORES (#tutorial-3) -->
          <section v-if="filteredOthers.length" id="tutorial-3" class="block">
            <header class="block-head">
              <div>
                <span class="section-eyebrow">{{ t.trainerPlanTag }}</span>
                <h2>{{ t.otherTrainersTitle }}</h2>
                <p>{{ hasActiveMembership ? t.othersSubUnlocked : t.othersSubLocked }}</p>
              </div>
              <span class="count-pill">{{ filteredOthers.length }}</span>
            </header>

            <div class="trainers-grid" :class="viewMode">
              <article
                v-for="trainer in pagedOthers"
                :key="trainer.id"
                class="trainer-card"
                :class="{ locked: !hasActiveMembership }"
                tabindex="0"
                role="link"
                @click="handleTrainerClick(trainer)"
                @keydown.enter="handleTrainerClick(trainer)"
              >
                <div class="trainer-media">
                  <img :src="trainer.avatar" :alt="trainer.name" loading="lazy" />

                  <span v-if="!hasActiveMembership" class="plus-badge">
                    <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    {{ t.lockedBtnText }}
                  </span>

                  <span class="loc-badge">
                    <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
                    {{ routinesCount(trainer) }} {{ t.routinesWord }}
                  </span>
                </div>

                <div class="trainer-body">
                  <h3>{{ trainer.name }}</h3>
                  <p class="trainer-specialty">{{ trainer.specialty }}</p>
                  <p v-if="trainer.bio" class="bio-text clamp">{{ trainer.bio }}</p>

                  <ul class="meta">
                    <li v-if="trainer.phone">
                      <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                      <span>{{ trainer.phone }}</span>
                    </li>
                  </ul>

                  <div class="gym-actions">
                    <button v-if="hasActiveMembership" type="button" class="btn-primary" @click.stop="handleTrainerClick(trainer)">
                      {{ t.viewRoutinesBtn }}
                    </button>
                    <button v-else type="button" class="btn-lock" @click.stop="handleTrainerClick(trainer)">
                      <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                      {{ t.membershipRequiredShort }}
                    </button>
                    <a v-if="hasActiveMembership && trainer.phone" class="btn-ghost icon-only" :href="telUrl(trainer)" :title="t.call" :aria-label="t.call" @click.stop>
                      <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                  </div>
                </div>
              </article>
            </div>

            <!-- Paginación: aparece cuando hay más de 40 entrenadores -->
            <nav v-if="filteredOthers.length > PAGE_SIZE" class="pager" :aria-label="t.pagination">
              <span class="pager-range">{{ rangeStart }}–{{ rangeEnd }} {{ t.pagerOf }} {{ filteredOthers.length }}</span>
              <div class="pager-btns">
                <button type="button" :disabled="page === 1" :title="t.prevPage" :aria-label="t.prevPage" @click="goPage(page - 1)">
                  <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button type="button" :disabled="page === totalPages" :title="t.nextPage" :aria-label="t.nextPage" @click="goPage(page + 1)">
                  <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </nav>
          </section>

          <!-- ESTADO VACÍO -->
          <div v-if="resultsCount === 0" class="empty-state">
            <span class="empty-icon">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <h3>{{ t.noResultsTitle }}</h3>
            <p>{{ t.noResultsDesc }}</p>
            <button type="button" class="btn-primary" @click="clearFilters">{{ t.clearFilters }}</button>
          </div>
        </template>

        <!-- =====================================================
             VISTA 2: PLANIFICADOR SEMANAL
        ====================================================== -->
        <template v-else>

          <div class="top-bar">
            <button type="button" class="back-btn" @click="selectedTrainer = null">
              <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {{ t.backToTrainersBtn }}
            </button>
          </div>

          <!-- HERO (#tutorial-1) -->
          <section id="tutorial-1" class="trainer-hero-card">
            <div class="hero-bg" :style="{ backgroundImage: `url(${selectedTrainer.avatar})` }"></div>
            <div class="hero-overlay"></div>

            <div class="hero-content-flex">
              <div class="trainer-logo-box">
                <img :src="selectedTrainer.avatar" :alt="selectedTrainer.name" />
              </div>

              <div class="hero-texts">
                <div class="badge-row">
                  <span class="badge">{{ selectedTrainer.specialty }}</span>
                  <span v-if="isSelectedAssigned" class="status-badge open"><i></i>{{ t.assignedBadge }}</span>
                </div>

                <h1>{{ selectedTrainer.name }}</h1>

                <p class="hero-address">{{ t.trainerSelectedDesc }}</p>
              </div>
            </div>
          </section>

          <!-- INDICADORES -->
          <section class="kpi-grid three">
            <article class="kpi-card">
              <div class="kpi-icon accent">
                <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
              </div>
              <div class="kpi-body">
                <strong>{{ selectedTrainer.routines ? selectedTrainer.routines.length : 0 }}</strong>
                <span>{{ t.kpiLibrary }}</span>
              </div>
            </article>

            <article class="kpi-card">
              <div class="kpi-icon success">
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div class="kpi-body">
                <strong>{{ activeDays }}</strong>
                <span>{{ t.kpiActiveDays }}</span>
              </div>
            </article>

            <article class="kpi-card">
              <div class="kpi-icon warning">
                <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
              </div>
              <div class="kpi-body">
                <strong>{{ completedCount }}/{{ plannedCount }}</strong>
                <span>{{ t.kpiCompleted }}</span>
              </div>
            </article>
          </section>

          <div class="dashboard-grid">

            <!-- IZQUIERDA: PLAN SEMANAL -->
            <div class="left-column">

              <!-- SELECTOR DE DÍAS (#tutorial-5) -->
              <section id="tutorial-5" class="panel-box day-selector-box">
                <header class="card-header">
                  <div class="card-header-icon">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </div>
                  <div class="card-header-copy">
                    <span class="card-eyebrow">{{ selectedTrainer.name }}</span>
                    <h3>{{ t.weekPlanTitle }}</h3>
                  </div>
                </header>

                <div class="day-chips-strip">
                  <button
                    v-for="day in dayKeys"
                    :key="day"
                    type="button"
                    class="day-strip-chip"
                    :class="{ active: selectedDay === day, 'is-rest': weeklyPlan[day].isRest, 'has-routines': !weeklyPlan[day].isRest && weeklyPlan[day].routines.length }"
                    @click="selectedDay = day"
                  >
                    <span class="strip-day-label">{{ t.daysShort[day] || day }}</span>
                    <span class="strip-dot"></span>
                  </button>
                </div>
              </section>

              <!-- DETALLE DEL DÍA -->
              <section
                class="panel-box day-detail-card"
                :class="{ 'is-drop-target': draggingItem }"
                @dragover.prevent
                @drop="onDropToDay($event, selectedDay)"
              >
                <!-- HEADER (#tutorial-6) -->
                <header id="tutorial-6" class="card-header day-detail-header">
                  <div class="card-header-icon success">
                    <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
                  </div>
                  <div class="card-header-copy">
                    <h3>{{ t.days[selectedDay] || selectedDay }}</h3>
                  </div>

                  <label class="rest-toggle" :class="{ on: weeklyPlan[selectedDay].isRest }">
                    <input type="checkbox" v-model="weeklyPlan[selectedDay].isRest" @change="onToggleRest(selectedDay)" />
                    <span>{{ t.restDayLabel }}</span>
                  </label>
                </header>

                <!-- DESCANSO (#tutorial-8) -->
                <div id="tutorial-8" v-if="weeklyPlan[selectedDay].isRest" class="state-box">
                  <span class="empty-icon">
                    <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  </span>
                  <h3>{{ t.restDayBoxTitle }}</h3>
                  <p>{{ t.restDayBoxText }}</p>
                </div>

                <div v-else-if="!weeklyPlan[selectedDay].routines.length" class="state-box dashed">
                  <span class="empty-icon">
                    <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  <p>{{ t.dropHint }}</p>
                </div>

                <!-- RUTINAS DEL DÍA (#tutorial-7) -->
                <div id="tutorial-7" v-else class="routines-grid">
                  <article
                    v-for="routine in weeklyPlan[selectedDay].routines"
                    :key="routine.instanceId || routine.id"
                    class="routine-card"
                    :class="{ 'completed-routine': routine.completed }"
                  >
                    <div class="card-media">
                      <img :src="getRoutineMediaSrc(routine)" :alt="routine.name" loading="lazy" @error="onImgError($event, 800)" />
                      <div class="media-overlay"></div>
                      <div class="badge-container">
                        <span class="badge-level">{{ translateLevel(routine.level) }}</span>
                        <span class="badge-goal">{{ routine.target }}</span>
                      </div>
                      <div v-if="routine.completed" class="status-badge-overlay">
                        <span>✓ {{ t.completedLabel }}</span>
                      </div>
                    </div>

                    <div class="card-body">
                      <h3 class="card-title-routine">{{ routine.name }}</h3>
                      <p class="routine-desc">{{ getRoutineDescription(routine) }}</p>

                      <div class="card-footer-actions">
                        <button type="button" class="btn-explore" @click="viewRoutineDetails(routine)">
                          {{ t.viewDetails }}
                        </button>

                        <label class="complete-checkbox-label" @click.stop>
                          <input type="checkbox" v-model="routine.completed" />
                          <span>{{ routine.completed ? t.doneLabel : t.completeLabel }}</span>
                        </label>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            </div>

            <!-- DERECHA: ENTRENADOR + BIBLIOTECA (#tutorial-4) -->
            <aside id="tutorial-4" class="right-column">

              <section class="panel-box contact-card">
                <header class="card-header">
                  <div class="card-header-icon">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
                  </div>
                  <div class="card-header-copy">
                    <span class="card-eyebrow">{{ t.contactTag }}</span>
                    <h3>{{ selectedTrainer.name }}</h3>
                  </div>
                </header>

                <p v-if="selectedTrainer.bio" class="bio-text">{{ selectedTrainer.bio }}</p>

                <ul v-if="selectedTrainer.phone || selectedTrainer.email" class="contact-list">
                  <li v-if="selectedTrainer.phone">
                    <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg></span>
                    <div>
                      <small>{{ t.phone }}</small>
                      <a :href="telUrl(selectedTrainer)">{{ selectedTrainer.phone }}</a>
                    </div>
                  </li>
                  <li v-if="selectedTrainer.email">
                    <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg></span>
                    <div>
                      <small>{{ t.emailLabel }}</small>
                      <a :href="`mailto:${selectedTrainer.email}`">{{ selectedTrainer.email }}</a>
                    </div>
                  </li>
                </ul>
              </section>

              <section class="panel-box library-panel">
                <header class="card-header">
                  <div class="card-header-icon warning">
                    <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg>
                  </div>
                  <div class="card-header-copy">
                    <h3>{{ t.libraryTitle }}</h3>
                    <p class="box-sub">{{ t.librarySub }}</p>
                  </div>
                </header>

                <label class="search-box small">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input v-model="trainerFilterText" type="search" :placeholder="t.searchPlaceholder" :aria-label="t.searchPlaceholder" />
                </label>

                <div class="library-list custom-scrollbar">
                  <div
                    v-for="routine in filteredTrainerRoutines"
                    :key="routine.id"
                    class="mini-routine-card"
                    draggable="true"
                    @dragstart="onDragStart($event, routine)"
                    @dragend="draggingItem = null"
                    @click="viewRoutineDetails(routine)"
                  >
                    <img
                      class="mini-thumb"
                      :src="getRoutineMediaSrc(routine)"
                      :alt="routine.name"
                      loading="lazy"
                      @error="onImgError($event, 200)"
                    />
                    <div class="mini-info">
                      <span class="mini-name" :title="routine.name">{{ routine.name }}</span>
                      <div class="mini-badges-row">
                        <span class="mini-level-badge">{{ translateLevel(routine.level) }}</span>
                        <span class="mini-cat-badge">{{ routine.target }}</span>
                      </div>
                    </div>

                    <button type="button" class="add-to-day-btn" :class="{ open: openAddMenuId === routine.id }" @click="toggleAddMenu(routine.id, $event)">
                      <span>{{ t.addToDayBtn }}</span>
                      <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                    </button>

                    <div v-if="openAddMenuId === routine.id" class="add-day-row" @click.stop>
                      <button v-for="day in dayKeys" :key="day" type="button" :disabled="weeklyPlan[day].isRest" @click="addRoutineToDay(day, routine)">
                        {{ t.daysShort[day] || day }}
                      </button>
                    </div>
                  </div>

                  <div v-if="!filteredTrainerRoutines.length" class="empty-hint">
                    <p>{{ t.noTrainerRoutines }}</p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </template>

      </main>
    </div>
  </HeadingMember>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useLang } from '../useLang.js';
import HeadingMember from '../HeadingMember.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const { lang } = useLang();

/* =========================================================
   NOTIFICACIONES
========================================================= */
const toastRef = ref(null);
const notify = (message, type = 'success', duration = 4000) => {
  toastRef.value?.notify(message, type, duration);
};

/* =========================================================
   IDIOMA
========================================================= */
const traducciones = {
  es: {
    trainerPlanTag: "Entrenadores",
    trainerMainTitle1: "Rutinas de",
    trainerMainTitle2: "Entrenadores",
    trainerHeroDesc: "Selecciona a tu entrenador asignado o explora otros profesionales para ver sus programas.",
    trainerSelectedDesc: "Visualiza el programa y la distribución semanal asignada por este profesional.",
    backToTrainersBtn: "Volver a Entrenadores",
    myAssignedTrainerTitle: "Tu Entrenador Asignado",
    assignedSub: "Tu entrenador principal: aquí encuentras el programa pensado para ti.",
    assignedBadge: "Principal",
    otherTrainersTitle: "Otros Entrenadores",
    othersSubUnlocked: "Explora los programas de otros profesionales con tu membresía activa.",
    othersSubLocked: "Activa tu mensualidad para ver los programas de otros profesionales.",
    viewRoutinesBtn: "Ver Rutinas",
    lockedBtnText: "Bloqueado",
    membershipRequiredMsg: "Bloqueado: Requiere mensualidad activa",
    membershipRequiredShort: "Requiere mensualidad",
    searchPlaceholder: "Buscar rutina...",
    searchTrainerPlaceholder: "Busca por nombre, especialidad o descripción…",
    clearSearch: "Limpiar búsqueda",
    sortBy: "Ordenar",
    sortRelevance: "Relevancia",
    sortName: "Nombre (A-Z)",
    sortRoutines: "Más rutinas",
    viewGrid: "Cuadrícula",
    viewList: "Lista",
    filterWithRoutines: "Con rutinas",
    filterAvailable: "Disponibles para mí",
    clearFilters: "Limpiar filtros",
    results: "resultados",
    result: "resultado",
    noResultsTitle: "No encontramos entrenadores con ese criterio",
    noResultsDesc: "Prueba con otro nombre o especialidad, o quita algunos filtros.",
    kpiTrainers: "ENTRENADORES",
    kpiAccessible: "DISPONIBLES PARA TI",
    kpiRoutines: "RUTINAS EN TOTAL",
    kpiSpecialties: "ESPECIALIDADES",
    kpiLibrary: "RUTINAS DEL ENTRENADOR",
    kpiActiveDays: "DÍAS CON ENTRENAMIENTO",
    kpiCompleted: "RUTINAS COMPLETADAS",
    routinesWord: "rutinas",
    call: "Llamar",
    emailLabel: "Correo",
    phone: "Teléfono",
    contactTag: "Tu entrenador",
    weekPlanTitle: "Planificador semanal",
    libraryTitle: "Biblioteca de rutinas",
    librarySub: "Arrastra una rutina al día o usa \"Añadir\"",
    pagination: "Paginación de entrenadores",
    pagerOf: "de",
    prevPage: "Página anterior",
    nextPage: "Página siguiente",
    restDayLabel: "Día de descanso",
    restDayBoxTitle: "Día de descanso",
    restDayBoxText: "No hay ejercicios programados para hoy.",
    dropHint: "Arrastra una rutina aquí o usa \"Añadir\"",
    viewDetails: "Ver Detalles",
    addToDayBtn: "Añadir",
    addedOk: "Rutina añadida al",
    noTrainerRoutines: "Este entrenador no tiene rutinas disponibles.",
    completedLabel: "Completado",
    doneLabel: "Hecho",
    completeLabel: "Completar",
    days: { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' },
    daysShort: { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom' }
  },
  en: {
    trainerPlanTag: "Trainers",
    trainerMainTitle1: "Trainer",
    trainerMainTitle2: "Routines",
    trainerHeroDesc: "Select your assigned trainer or explore other professionals to view their programs.",
    trainerSelectedDesc: "View the program and weekly schedule assigned by this professional.",
    backToTrainersBtn: "Back to Trainers",
    myAssignedTrainerTitle: "Your Assigned Trainer",
    assignedSub: "Your main trainer: find the program designed for you here.",
    assignedBadge: "Main",
    otherTrainersTitle: "Other Trainers",
    othersSubUnlocked: "Explore other professionals' programs with your active membership.",
    othersSubLocked: "Activate your membership to see other professionals' programs.",
    viewRoutinesBtn: "View Routines",
    lockedBtnText: "Locked",
    membershipRequiredMsg: "Locked: Requires active membership",
    membershipRequiredShort: "Membership required",
    searchPlaceholder: "Search routine...",
    searchTrainerPlaceholder: "Search by name, specialty or description…",
    clearSearch: "Clear search",
    sortBy: "Sort",
    sortRelevance: "Relevance",
    sortName: "Name (A-Z)",
    sortRoutines: "Most routines",
    viewGrid: "Grid",
    viewList: "List",
    filterWithRoutines: "With routines",
    filterAvailable: "Available to me",
    clearFilters: "Clear filters",
    results: "results",
    result: "result",
    noResultsTitle: "We couldn't find any trainers matching that",
    noResultsDesc: "Try a different name or specialty, or remove some filters.",
    kpiTrainers: "TRAINERS",
    kpiAccessible: "AVAILABLE TO YOU",
    kpiRoutines: "TOTAL ROUTINES",
    kpiSpecialties: "SPECIALTIES",
    kpiLibrary: "TRAINER ROUTINES",
    kpiActiveDays: "TRAINING DAYS",
    kpiCompleted: "ROUTINES COMPLETED",
    routinesWord: "routines",
    call: "Call",
    emailLabel: "Email",
    phone: "Phone",
    contactTag: "Your trainer",
    weekPlanTitle: "Weekly planner",
    libraryTitle: "Routine library",
    librarySub: "Drag a routine to a day or use \"Add\"",
    pagination: "Trainers pagination",
    pagerOf: "of",
    prevPage: "Previous page",
    nextPage: "Next page",
    restDayLabel: "Rest day",
    restDayBoxTitle: "Rest day",
    restDayBoxText: "No exercises scheduled for today.",
    dropHint: "Drag a routine here or use \"Add\"",
    viewDetails: "View Details",
    addToDayBtn: "Add",
    addedOk: "Routine added to",
    noTrainerRoutines: "This trainer has no routines available.",
    completedLabel: "Completed",
    doneLabel: "Done",
    completeLabel: "Complete",
    days: { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' },
    daysShort: { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }
  }
};

const t = computed(() => traducciones[lang.value] || traducciones.es);

/* =========================================================
   PROPS
========================================================= */
const props = defineProps({
  assignedTrainer: {
    type: Object,
    default: () => ({
      id: 1,
      name: "Carlos Mendoza",
      specialty: "Hipertrofia y Fuerza",
      bio: "Especialista en acondicionamiento físico avanzado y optimización biomecánica.",
      phone: "+52 55 1234 5678",
      email: "carlos.mendoza@gym.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      routines: [
        { id: 101, name: "Rutina Base Hipertrofia A", level: "Intermedio", target: "Pecho y Tríceps", description: "Enfoque en tensión mecánica.", mediaUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", completed: false }
      ]
    })
  },
  trainersList: {
    type: Array,
    default: () => [
      {
        id: 1,
        name: "Carlos Mendoza",
        specialty: "Hipertrofia y Fuerza",
        bio: "Especialista en acondicionamiento físico avanzado.",
        phone: "+52 55 1234 5678",
        email: "carlos.mendoza@gym.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        routines: [{ id: 101, name: "Rutina Base Hipertrofia A", level: "Intermedio", target: "Pecho y Tríceps", description: "Enfoque en tensión mecánica.", mediaUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", completed: false }]
      },
      {
        id: 2,
        name: "Ana Sofía Valdés",
        specialty: "Pérdida de Grasa y Funcional",
        bio: "Entrenadora certificada en circuitos de alta intensidad.",
        phone: "+52 55 8765 4321",
        email: "ana.valdes@gym.com",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
        routines: [{ id: 201, name: "Fullbody Quema Total", level: "Principiante", target: "Cuerpo Completo", description: "Circuito dinámico metabólico.", mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800", completed: false }]
      }
    ]
  },
  hasActiveMembership: {
    type: Boolean,
    default: false
  },
  getRoutineMediaSrc: { type: Function, default: (r) => r.mediaUrl },
  getRoutineDescription: { type: Function, default: (r) => r.description },
  translateLevel: { type: Function, default: (l) => l },
  viewRoutineDetails: { type: Function, default: (r) => console.log(r) }
});

/* =========================================================
   ESTADO: LISTADO
========================================================= */
const PAGE_SIZE = 40;

const searchQuery = ref('');
const sortBy = ref('relevance');          /* relevance | name | routines */
const onlyWithRoutines = ref(false);
const onlyAvailable = ref(false);
const viewMode = ref(localStorage.getItem('member-trainers-view') === 'list' ? 'list' : 'grid');
const page = ref(1);

watch(viewMode, (v) => localStorage.setItem('member-trainers-view', v));

const normalize = (str) =>
  (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const query = computed(() => normalize(searchQuery.value.trim()));

const matchesQuery = (trainer) =>
  !query.value ||
  normalize(trainer.name).includes(query.value) ||
  normalize(trainer.specialty).includes(query.value) ||
  normalize(trainer.bio).includes(query.value);

const routinesCount = (trainer) => (trainer?.routines ? trainer.routines.length : 0);

const otherTrainers = computed(() => {
  if (!props.assignedTrainer) return props.trainersList;
  return props.trainersList.filter((tr) => tr.id !== props.assignedTrainer.id);
});

const showAssigned = computed(
  () =>
    !!props.assignedTrainer &&
    matchesQuery(props.assignedTrainer) &&
    (!onlyWithRoutines.value || routinesCount(props.assignedTrainer) > 0)
);

const filteredOthers = computed(() => {
  if (onlyAvailable.value && !props.hasActiveMembership) return [];

  const list = otherTrainers.value.filter(
    (tr) => matchesQuery(tr) && (!onlyWithRoutines.value || routinesCount(tr) > 0)
  );

  if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'routines') {
    list.sort((a, b) => routinesCount(b) - routinesCount(a));
  }

  return list;
});

const hasActiveFilters = computed(
  () => !!query.value || onlyWithRoutines.value || onlyAvailable.value || sortBy.value !== 'relevance'
);

const clearFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'relevance';
  onlyWithRoutines.value = false;
  onlyAvailable.value = false;
};

const resultsCount = computed(() => (showAssigned.value ? 1 : 0) + filteredOthers.value.length);

/* ---------- Paginación ---------- */
const totalPages = computed(() => Math.max(1, Math.ceil(filteredOthers.value.length / PAGE_SIZE)));

const pagedOthers = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredOthers.value.slice(start, start + PAGE_SIZE);
});

const rangeStart = computed(() => (filteredOthers.value.length ? (page.value - 1) * PAGE_SIZE + 1 : 0));
const rangeEnd = computed(() => Math.min(page.value * PAGE_SIZE, filteredOthers.value.length));

watch([searchQuery, sortBy, onlyWithRoutines, onlyAvailable], () => {
  page.value = 1;
});

watch(totalPages, (n) => {
  if (page.value > n) page.value = n;
});

const scrollToOthers = () => {
  nextTick(() => {
    document.getElementById('tutorial-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const goPage = (n) => {
  page.value = Math.min(Math.max(1, n), totalPages.value);
  scrollToOthers();
};

/* ---------- Indicadores ---------- */
const allTrainers = computed(() => [
  ...(props.assignedTrainer ? [props.assignedTrainer] : []),
  ...otherTrainers.value
]);

const kpiTotal = computed(() => allTrainers.value.length);
const kpiAccessible = computed(() =>
  props.hasActiveMembership ? allTrainers.value.length : (props.assignedTrainer ? 1 : 0)
);
const kpiRoutines = computed(() => allTrainers.value.reduce((sum, tr) => sum + routinesCount(tr), 0));
const kpiSpecialties = computed(() => new Set(allTrainers.value.map((tr) => tr.specialty).filter(Boolean)).size);

const telUrl = (trainer) => `tel:${String(trainer.phone || '').replace(/[^\d+]/g, '')}`;

/* =========================================================
   ESTADO: PLANIFICADOR
========================================================= */
const selectedTrainer = ref(null);
const trainerFilterText = ref('');
const openAddMenuId = ref(null);
const selectedDay = ref('monday');
const draggingItem = ref(null);

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const weeklyPlan = reactive({
  monday: { isRest: false, routines: [] },
  tuesday: { isRest: false, routines: [] },
  wednesday: { isRest: false, routines: [] },
  thursday: { isRest: false, routines: [] },
  friday: { isRest: false, routines: [] },
  saturday: { isRest: true, routines: [] },
  sunday: { isRest: true, routines: [] }
});

const isSelectedAssigned = computed(
  () => !!props.assignedTrainer && selectedTrainer.value?.id === props.assignedTrainer.id
);

const filteredTrainerRoutines = computed(() => {
  if (!selectedTrainer.value || !selectedTrainer.value.routines) return [];
  return selectedTrainer.value.routines.filter((r) =>
    r.name.toLowerCase().includes(trainerFilterText.value.toLowerCase())
  );
});

const activeDays = computed(
  () => dayKeys.filter((d) => !weeklyPlan[d].isRest && weeklyPlan[d].routines.length).length
);
const plannedCount = computed(() => dayKeys.reduce((sum, d) => sum + weeklyPlan[d].routines.length, 0));
const completedCount = computed(() =>
  dayKeys.reduce((sum, d) => sum + weeklyPlan[d].routines.filter((r) => r.completed).length, 0)
);

const selectTrainer = (trainer) => {
  selectedTrainer.value = trainer;
  trainerFilterText.value = '';
  openAddMenuId.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleTrainerClick = (trainer) => {
  if (!props.hasActiveMembership) {
    notify(t.value.membershipRequiredMsg, 'error');
    return;
  }
  selectTrainer(trainer);
};

const toggleAddMenu = (id, event) => {
  event.stopPropagation();
  openAddMenuId.value = openAddMenuId.value === id ? null : id;
};

const addRoutineToDay = (day, routine) => {
  weeklyPlan[day].routines.push({ ...routine, instanceId: Date.now() + Math.random(), completed: false });
  openAddMenuId.value = null;
  notify(`${t.value.addedOk} ${t.value.days[day] || day}`, 'success', 2500);
};

const onToggleRest = (day) => {
  if (weeklyPlan[day].isRest) {
    weeklyPlan[day].routines = [];
  }
};

const onDragStart = (event, routine) => {
  draggingItem.value = routine;
  event.dataTransfer.setData('text/plain', JSON.stringify(routine));
};

const onDropToDay = (event, day) => {
  event.preventDefault();
  if (draggingItem.value && !weeklyPlan[day].isRest) {
    addRoutineToDay(day, draggingItem.value);
  }
  draggingItem.value = null;
};

const onImgError = (event, width) => {
  event.target.src = `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=${width}`;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button, input, select { font: inherit; }

svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   BASE
========================================================= */
.trainers-page {
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
  --red: #f87171;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: calc(100vh - 72px);
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.trainers-container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 30px 32px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.eyebrow,
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  color: var(--hl);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}

.eyebrow::before,
.section-eyebrow::before {
  content: '';
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
}

.highlight { color: var(--hl) !important; }

.dot {
  width: 7px;
  height: 7px;
  flex: none;
  display: inline-block;
  border-radius: 50%;
  background: var(--text3);
}

.dot.open { background: var(--green); box-shadow: 0 0 8px var(--green); }

/* =========================================================
   BOTONES
========================================================= */
.btn-primary,
.btn-ghost,
.btn-lock {
  min-height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 0.2s ease, transform 0.2s var(--ease), background 0.2s ease, border-color 0.2s ease;
}

.btn-primary svg,
.btn-ghost svg,
.btn-lock svg { width: 16px; height: 16px; flex: none; }

.btn-primary {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 22%, transparent);
}

.btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }

.btn-ghost {
  color: var(--title);
  background: var(--surface);
  border: 1px solid var(--line2);
}

.btn-ghost:hover { background: var(--surface-hover); transform: translateY(-1px); }
.btn-ghost.icon-only { width: 42px; padding: 0; }

.btn-lock {
  width: 100%;
  color: var(--amber);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.32);
}

.btn-lock:hover { background: rgba(245, 158, 11, 0.18); transform: translateY(-1px); }

.link-btn {
  padding: 7px 12px;
  color: var(--hl);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.link-btn:hover { background: var(--hl-mid); border-color: var(--hl-line); }

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
[role='link']:focus-visible {
  outline: 2px solid var(--hl);
  outline-offset: 2px;
}

/* =========================================================
   HERO (LISTADO)
========================================================= */
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
.hero-base { position: relative; z-index: 1; }

.hero-main h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(28px, 3.8vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.5px;
}

.hero-main h1 span {
  color: var(--hl);
  text-shadow: 0 0 36px var(--hl-line);
}

.hero-main p {
  max-width: 560px;
  margin: 14px 0 0;
  color: var(--text2);
  font-size: 14px;
  line-height: 1.6;
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-base {
  width: 100%;
  padding: 10px 14px 10px 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid var(--line2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s var(--ease), border-color 0.2s ease;
}

.hero-base:hover { transform: translateY(-3px); border-color: var(--hl-line); }

.hero-base-img {
  width: 68px;
  height: 68px;
  flex: none;
  overflow: hidden;
  border: 1px solid var(--line2);
  border-radius: 15px;
}

.hero-base-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero-base-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }

.hero-base-copy small {
  color: var(--hl);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.hero-base-copy strong {
  overflow: hidden;
  color: #fff;
  font-size: 14.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-base-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text2);
  font-size: 11.5px;
}

.hero-base-arrow { width: 18px; height: 18px; flex: none; color: var(--text3); }

/* =========================================================
   INDICADORES
========================================================= */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.kpi-card {
  --tint: rgba(255, 255, 255, 0.7);

  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  background:
    radial-gradient(180px 90px at 0% 0%, color-mix(in srgb, var(--tint) 12%, transparent), transparent 75%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 60%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
  transition: transform 0.25s var(--ease), border-color 0.25s ease, box-shadow 0.25s ease;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 22px;
  right: 22px;
  height: 2px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--tint), transparent);
  opacity: 0.85;
}

.kpi-card:nth-child(1) { --tint: var(--hl); }
.kpi-card:nth-child(2) { --tint: #34d399; }
.kpi-card:nth-child(4),
.kpi-grid.three .kpi-card:nth-child(3) { --tint: #f59e0b; }

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--tint) 40%, transparent);
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.34);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line);
  border-radius: 15px;
}

.kpi-icon.accent { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }
.kpi-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.kpi-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.28); }
.kpi-icon svg { width: 22px; height: 22px; stroke-width: 1.8; }

.kpi-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }

.kpi-body strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.3px;
}

.kpi-body span {
  color: var(--text3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
  line-height: 1.3;
  text-transform: uppercase;
}

/* =========================================================
   BARRA DE EXPLORACIÓN
========================================================= */
.toolbar {
  position: sticky;
  top: 82px;
  z-index: 30;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: color-mix(in srgb, var(--card) 92%, transparent);
  border: 1px solid var(--line2);
  border-radius: 20px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
}

.toolbar-row { display: flex; align-items: center; gap: 10px; }

.search-box {
  min-width: 0;
  height: 46px;
  flex: 1;
  padding: 0 8px 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box.small { height: 42px; flex: none; }

.search-box:focus-within {
  border-color: var(--hl);
  box-shadow: 0 0 0 3px var(--hl-soft);
}

.search-box > svg { width: 18px; height: 18px; flex: none; color: var(--text3); }

.search-box input {
  min-width: 0;
  flex: 1;
  height: 100%;
  color: #fff;
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: none;
}

.search-box.small input { font-size: 13px; }
.search-box input::placeholder { color: var(--text3); }
.search-box input::-webkit-search-cancel-button { display: none; }

.clear-search {
  width: 28px;
  height: 28px;
  flex: none;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border: 0;
  border-radius: 50%;
}

.clear-search:hover { background: rgba(255, 255, 255, 0.16); }

.select-box {
  height: 46px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
}

.select-box span {
  color: var(--text3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.select-box select {
  height: 100%;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  background: transparent;
  border: 0;
  outline: none;
  cursor: pointer;
  color-scheme: dark;
}

.select-box select option { background: #15171b; }

.view-toggle {
  height: 46px;
  padding: 4px;
  display: flex;
  gap: 3px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
}

.view-toggle button {
  width: 38px;
  display: grid;
  place-items: center;
  color: var(--text3);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;
  transition: background 0.2s ease, color 0.2s ease;
}

.view-toggle button svg { width: 17px; height: 17px; }
.view-toggle button:hover { color: #fff; }
.view-toggle button.active { color: #fff; background: var(--hl); }

.chips {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text2);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.chip svg { width: 14px; height: 14px; }
.chip:hover { color: #fff; background: var(--surface-hover); }
.chip.active { color: #fff; background: var(--hl-mid); border-color: var(--hl-line); }

.results-bar {
  margin: -6px 2px -4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text2);
  font-size: 12.5px;
}

.results-bar b { color: #fff; }

/* =========================================================
   BLOQUES
========================================================= */
.block { display: flex; flex-direction: column; gap: 18px; }

.block-head {
  padding-bottom: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.block-head .section-eyebrow { margin-bottom: 5px; font-size: 9.5px; }

.block-head h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.block-head p { margin: 5px 0 0; color: var(--text3); font-size: 12.5px; }

.count-pill {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 800;
}

/* =========================================================
   TARJETA: ENTRENADOR ASIGNADO
========================================================= */
.home-card {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%), var(--card);
  border: 1px solid var(--hl-line);
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32), 0 0 0 1px var(--hl-soft);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--hl-mid);
}

.home-media { position: relative; min-height: 300px; overflow: hidden; }

.home-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.home-card:hover .home-media img { transform: scale(1.04); }

.home-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 55%, var(--card)), linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.home-body { padding: 28px; display: flex; flex-direction: column; gap: 16px; }

.home-title { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.home-title h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 26px;
  font-weight: 600;
}

.base-badge {
  padding: 5px 11px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.bio-text { margin: 0; color: var(--text2); font-size: 13px; line-height: 1.65; }

.bio-text.clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================================================
   TARJETAS DE ENTRENADORES
========================================================= */
.trainers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trainer-card {
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
  transition: transform 0.3s var(--ease), border-color 0.25s ease, box-shadow 0.3s ease;
}

.trainer-card:hover {
  transform: translateY(-5px);
  border-color: var(--hl-line);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38);
}

.trainer-card.locked:hover { border-color: rgba(245, 158, 11, 0.4); }

.trainer-media { position: relative; height: 190px; flex: none; overflow: hidden; }

.trainer-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s var(--ease), filter 0.3s ease;
}

.trainer-card:hover .trainer-media img { transform: scale(1.06); }
.trainer-card.locked .trainer-media img { filter: brightness(0.7) saturate(0.85); }

.trainer-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.7));
  pointer-events: none;
}

.open-badge,
.loc-badge,
.plus-badge {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.open-badge {
  top: 12px;
  right: 12px;
  padding: 5px 11px;
  color: #fff;
  background: rgba(16, 185, 129, 0.92);
}

.open-badge i {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff;
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
}

.loc-badge {
  left: 12px;
  bottom: 12px;
  max-width: calc(100% - 24px);
  padding: 5px 11px;
  color: #93c5fd;
  background: rgba(10, 10, 10, 0.75);
  border: 1px solid var(--hl-line);
}

.loc-badge svg { width: 12px; height: 12px; flex: none; }

.plus-badge {
  top: 12px;
  right: 12px;
  padding: 5px 11px;
  color: var(--amber);
  background: rgba(10, 10, 10, 0.78);
  border: 1px solid rgba(245, 158, 11, 0.45);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.plus-badge svg { width: 12px; height: 12px; }

.trainer-body {
  min-width: 0;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trainer-body h3 {
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trainer-specialty { margin: -6px 0 0; color: var(--hl); font-size: 12.5px; font-weight: 700; }

.meta {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.meta li {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text2);
  font-size: 12.5px;
  line-height: 1.45;
}

.meta li svg { width: 15px; height: 15px; margin-top: 1px; flex: none; color: var(--hl); }
.meta li span { min-width: 0; overflow-wrap: anywhere; }

.gym-actions { margin-top: auto; display: flex; gap: 8px; }
.gym-actions .btn-primary { flex: 1; }

/* Lista */
.trainers-grid.list { grid-template-columns: 1fr; gap: 14px; }
.trainers-grid.list .trainer-card { flex-direction: row; }
.trainers-grid.list .trainer-media { width: 260px; height: auto; min-height: 170px; }
.trainers-grid.list .trainer-body { padding: 18px 20px; }
.trainers-grid.list .gym-actions { max-width: 360px; }

/* =========================================================
   PAGINACIÓN
========================================================= */
.pager {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.pager-range {
  color: var(--text3);
  font-size: 12.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pager-btns { display: flex; gap: 10px; }

.pager-btns button {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: #fff;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 12px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.pager-btns button svg { width: 17px; height: 17px; }
.pager-btns button:hover:not(:disabled) { background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-1px); }
.pager-btns button:disabled { color: var(--text3); cursor: not-allowed; opacity: 0.55; }

/* =========================================================
   VACÍO
========================================================= */
.empty-state,
.state-box {
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  background: var(--surface);
  border: 1.5px dashed var(--line2);
  border-radius: 22px;
}

.state-box { padding: 48px 20px; border-style: solid; border-color: var(--line); }
.state-box.dashed { border-style: dashed; border-color: var(--line2); }

.empty-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 20px;
}

.empty-icon svg { width: 28px; height: 28px; }

.empty-state h3,
.state-box h3 {
  margin: 4px 0 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p,
.state-box p {
  max-width: 360px;
  margin: 0 0 4px;
  color: var(--text2);
  font-size: 13px;
  line-height: 1.6;
}

/* =========================================================
   VISTA 2: BARRA SUPERIOR + HERO
========================================================= */
.top-bar { display: flex; align-items: center; justify-content: space-between; }

.back-btn {
  height: 40px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--title);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.2s var(--ease), border-color 0.2s ease;
}

.back-btn svg { width: 16px; height: 16px; }
.back-btn:hover { background: var(--surface-hover); border-color: var(--hl-line); transform: translateX(-2px); }

.trainer-hero-card {
  position: relative;
  min-height: 240px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 32px;
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.trainer-hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3;
  background: linear-gradient(90deg, var(--hl), transparent 70%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.5) saturate(1.05) blur(6px);
  transform: scale(1.1);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(520px 260px at 100% 0%, var(--hl-mid), transparent 70%),
    linear-gradient(180deg, rgba(9, 9, 9, 0.1) 10%, rgba(9, 9, 9, 0.94) 100%);
}

.hero-content-flex {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 22px;
}

.trainer-logo-box {
  width: 96px;
  height: 96px;
  flex: none;
  overflow: hidden;
  background: #141418;
  border: 2px solid rgba(255, 255, 255, 0.22);
  border-radius: 24px;
  box-shadow: 0 0 0 5px var(--hl-soft), 0 14px 30px rgba(0, 0, 0, 0.6);
}

.trainer-logo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero-texts { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 10px; }

.badge-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.badge {
  padding: 5px 12px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.status-badge {
  padding: 5px 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #fff;
  background: rgba(239, 68, 68, 0.88);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 800;
}

.status-badge.open { background: rgba(16, 185, 129, 0.92); }

.status-badge i {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff;
  animation: pulse 1.6s ease-in-out infinite;
}

.hero-texts h1 {
  margin: 0;
  color: #fff;
  font-family: 'Anton', sans-serif;
  font-size: clamp(28px, 3.6vw, 46px);
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.hero-address { margin: 0; color: rgba(255, 255, 255, 0.78); font-size: 13.5px; line-height: 1.5; }

/* =========================================================
   VISTA 2: DASHBOARD
========================================================= */
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 22px;
  align-items: start;
}

.left-column,
.right-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

@media (min-width: 1101px) {
  .right-column { position: sticky; top: 88px; }
}

.panel-box {
  min-width: 0;
  padding: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
  transition: border-color 0.2s ease;
}

.panel-box:hover { border-color: var(--line2); }

.card-header { margin-bottom: 18px; display: flex; align-items: center; gap: 13px; }

.card-header-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
}

.card-header-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.card-header-icon.warning { color: var(--amber); background: rgba(245, 158, 11, 0.09); border-color: rgba(245, 158, 11, 0.28); }
.card-header-icon svg { width: 19px; height: 19px; }

.card-header-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }

.card-eyebrow {
  overflow: hidden;
  color: var(--hl);
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-header h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.box-sub { margin: 0; color: var(--text3); font-size: 12px; }

/* Selector de días */
.day-chips-strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  width: 100%;
}

.day-strip-chip {
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--text2);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 12px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s var(--ease);
}

.day-strip-chip:hover { color: #fff; background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-1px); }

.day-strip-chip.active {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-color: var(--color-botones, var(--hl));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 25%, transparent);
}

.strip-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.25; }
.day-strip-chip.has-routines .strip-dot { background: var(--green); opacity: 1; box-shadow: 0 0 6px var(--green); }
.day-strip-chip.is-rest { opacity: 0.6; }
.day-strip-chip.is-rest.active { opacity: 1; }

/* Detalle del día */
.day-detail-card { min-height: 320px; }
.day-detail-card.is-drop-target { border-color: var(--hl-line); box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24), 0 0 0 3px var(--hl-soft); }

.rest-toggle {
  padding: 8px 13px;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.rest-toggle:hover { background: var(--surface-hover); }
.rest-toggle.on { color: #fff; background: var(--hl-mid); border-color: var(--hl-line); }
.rest-toggle input { accent-color: var(--hl); }

.routines-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }

.routine-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  transition: border-color 0.2s ease, transform 0.3s var(--ease);
}

.routine-card:hover { border-color: var(--hl-line); transform: translateY(-3px); }
.routine-card.completed-routine { border-color: rgba(34, 197, 94, 0.4); }
.routine-card.completed-routine .card-media img { filter: grayscale(0.4) brightness(0.8); }

.card-media { position: relative; height: 130px; width: 100%; background: #000; }
.card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.media-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(18, 18, 18, 0.85) 100%); }
.badge-container { position: absolute; top: 8px; left: 8px; display: flex; flex-wrap: wrap; gap: 4px; }

.badge-level {
  padding: 3px 8px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
}

.badge-goal {
  padding: 3px 8px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
}

.status-badge-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 9px;
  color: #fff;
  background: rgba(16, 185, 129, 0.92);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between; }

.card-title-routine {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.routine-desc { margin: 0; color: var(--text2); font-size: 12px; line-height: 1.5; }

.card-footer-actions {
  margin-top: 4px;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid var(--line);
}

.btn-explore {
  padding: 0;
  color: var(--hl);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.btn-explore:hover { text-decoration: underline; }

.complete-checkbox-label { display: flex; align-items: center; gap: 6px; color: var(--text2); font-size: 12px; font-weight: 600; cursor: pointer; }
.complete-checkbox-label input { accent-color: #22c55e; }

/* Contacto */
.contact-card { border-color: var(--hl-line); box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--hl-soft); }
.contact-card .bio-text { margin-bottom: 14px; }

.contact-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }

.contact-list li {
  padding: 11px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.contact-list li:first-child { padding-top: 0; }
.contact-list li:last-child { padding-bottom: 0; border-bottom: 0; }

.contact-ico {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.contact-ico svg { width: 15px; height: 15px; }

.contact-list li > div { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.contact-list small { color: var(--text3); font-size: 10.5px; font-weight: 700; }

.contact-list a {
  overflow: hidden;
  color: var(--title);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-list a:hover { color: var(--hl); }

/* Biblioteca */
.library-panel { display: flex; flex-direction: column; }
.library-panel .search-box { margin-bottom: 14px; }

.library-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 46vh;
  padding-right: 4px;
  overflow-y: auto;
}

.custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--line2) transparent; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 999px; }

.mini-routine-card {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  cursor: grab;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.mini-routine-card:hover { background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-1px); }
.mini-routine-card:active { cursor: grabbing; }

.mini-thumb { width: 46px; height: 46px; flex: none; object-fit: cover; background: #000; border-radius: 10px; }

.mini-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }

.mini-name {
  display: block;
  overflow: hidden;
  color: var(--title);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-badges-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }

.mini-level-badge {
  padding: 1px 7px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.mini-cat-badge { color: var(--hl); font-size: 11px; font-weight: 700; }

.add-to-day-btn {
  height: 32px;
  padding: 0 11px;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--hl);
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 9px;
  transition: background 0.2s ease;
}

.add-to-day-btn svg { width: 12px; height: 12px; transition: transform 0.2s ease; }
.add-to-day-btn.open svg { transform: rotate(180deg); }
.add-to-day-btn:hover { background: var(--hl-mid); }

.add-day-row { width: 100%; padding-top: 10px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; border-top: 1px solid var(--line); }

.add-day-row button {
  height: 32px;
  color: var(--title);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 8px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.add-day-row button:hover:not(:disabled) { background: var(--hl); border-color: var(--hl); color: #fff; }
.add-day-row button:disabled { color: var(--text3); cursor: not-allowed; opacity: 0.45; }

.empty-hint { padding: 22px 0; color: var(--text3); font-size: 12.5px; text-align: center; }
.empty-hint p { margin: 0; }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .hero { grid-template-columns: 1fr; }
  .hero-base { max-width: 420px; }
  .home-card { grid-template-columns: 1fr; }
  .home-media { min-height: 240px; }
  .home-media::after { background: linear-gradient(180deg, transparent 55%, var(--card)); }
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); }
  .right-column { position: static; }
}

@media (max-width: 900px) {
  .toolbar { top: 76px; }
  .kpi-card { padding: 18px; gap: 13px; }
}

@media (max-width: 860px) {
  .hero-content-flex { flex-wrap: wrap; align-items: flex-start; }
}

@media (max-width: 760px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
}

@media (max-width: 680px) {
  .trainers-container { padding: 14px 12px 44px; gap: 16px; }

  .hero { padding: 20px 16px; border-radius: 20px; gap: 18px; }
  .hero::after { right: -120px; bottom: -210px; }
  .hero-main p { font-size: 13px; }
  .hero-actions { margin-top: 16px; }
  .hero-actions > * { flex: 1; }
  .hero-base { max-width: none; }

  .kpi-grid { gap: 9px; }
  .kpi-grid.three .kpi-card:first-child { grid-column: 1 / -1; }

  .kpi-card {
    padding: 16px 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    border-radius: 17px;
  }

  .kpi-grid.three .kpi-card:first-child { flex-direction: row; align-items: center; }

  .kpi-card::before { left: 14px; right: 14px; }
  .kpi-icon { width: 38px; height: 38px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body { gap: 5px; }
  .kpi-body strong { font-size: 28px; }
  .kpi-body span { font-size: 9.5px; }

  .toolbar { top: 70px; padding: 10px; gap: 10px; border-radius: 17px; }
  .toolbar-row:first-child { flex-wrap: wrap; }
  .search-box { flex: 1 1 100%; }
  .select-box { flex: 1; min-width: 0; }
  .select-box select { width: 100%; min-width: 0; }

  .chips { flex-wrap: nowrap; overflow-x: auto; margin: 0 -10px; padding: 0 10px; scrollbar-width: none; }
  .chips::-webkit-scrollbar { display: none; }

  .block { gap: 14px; }
  .block-head h2 { font-size: 20px; }

  .home-body { padding: 20px 16px; gap: 14px; }
  .home-title h3 { font-size: 22px; }
  .home-media { min-height: 200px; }

  .trainers-grid { grid-template-columns: 1fr; gap: 14px; }
  .trainer-media { height: 170px; }
  .trainer-body { padding: 16px; }

  .trainers-grid.list .trainer-card { flex-direction: row; }
  .trainers-grid.list .trainer-media { width: 116px; min-height: 0; height: auto; }
  .trainers-grid.list .trainer-media::after { background: rgba(0, 0, 0, 0.2); }
  .trainers-grid.list .loc-badge { display: none; }
  .trainers-grid.list .plus-badge { top: 8px; right: 8px; padding: 4px 8px; font-size: 9px; }
  .trainers-grid.list .trainer-body { padding: 12px 14px; gap: 10px; }
  .trainers-grid.list .trainer-body h3 { font-size: 16px; }
  .trainers-grid.list .bio-text { display: none; }
  .trainers-grid.list .gym-actions { max-width: none; }
  .trainers-grid.list .btn-primary,
  .trainers-grid.list .btn-lock { min-height: 38px; font-size: 12px; }
  .trainers-grid.list .btn-ghost.icon-only { width: 38px; min-height: 38px; }

  .pager { justify-content: space-between; }

  /* Planificador */
  .trainer-hero-card { min-height: 0; padding: 20px 16px; border-radius: 20px; }
  .hero-content-flex { flex-direction: column; gap: 14px; }
  .trainer-logo-box { width: 68px; height: 68px; border-radius: 18px; }

  .panel-box { padding: 18px 16px; border-radius: 18px; }
  .left-column, .right-column { gap: 16px; }

  .day-chips-strip {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
    gap: 6px;
    scrollbar-width: none;
  }

  .day-chips-strip::-webkit-scrollbar { display: none; }
  .day-strip-chip { flex: 0 0 68px; scroll-snap-align: start; min-height: 52px; }

  .day-detail-header { flex-wrap: wrap; }
  .routines-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .mini-routine-card { align-items: flex-start; }
  .add-day-row { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 400px) {
  .hero-actions { flex-direction: column; }
  .trainers-grid.list .trainer-media { width: 96px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>