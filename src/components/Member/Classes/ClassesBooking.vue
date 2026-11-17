<template>
  <HeadingMember>
    <NotificationSystem ref="toastRef" />

    <div class="classes-page">
      <main class="classes-container">

        <!-- 1. ENCABEZADO -->
        <section class="hero">
          <div class="hero-main">
            <span class="eyebrow">{{ t.headerTag }}</span>

            <h1>{{ t.mainTitle1 }} <span>{{ t.mainTitle2 }}</span></h1>

            <p>{{ t.heroDesc }}</p>

            <div class="hero-actions">
              <button type="button" class="btn-primary" @click="goToday">
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {{ t.todayBtn }}
              </button>
              <button type="button" class="btn-ghost" @click="showMyBookings">
                <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
                {{ t.summaryMyBookings }}
              </button>
            </div>
          </div>

          <!-- Tu próxima clase -->
          <button v-if="nextBooking" type="button" class="hero-base" @click="openDetail(nextBooking)">
            <span class="hero-base-img">
              <img :src="nextBooking.image" :alt="nextBooking.name" @error="onImgError" />
            </span>
            <span class="hero-base-copy">
              <small>{{ t.nextClass }}</small>
              <strong>{{ nextBooking.name }}</strong>
              <span class="hero-base-meta">
                <i class="dot open"></i>
                {{ shortDate(nextBooking.date) }} · {{ nextBooking.startTime }}
              </span>
            </span>
            <svg class="hero-base-arrow" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <div v-else class="hero-base hero-base-empty">
            <span class="hero-base-img empty">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </span>
            <span class="hero-base-copy">
              <small>{{ t.nextClass }}</small>
              <strong>{{ t.noNextClass }}</strong>
              <span class="hero-base-meta">{{ t.noNextClassSub }}</span>
            </span>
          </div>
        </section>

        <!-- 2. INDICADORES -->
        <section class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-icon accent">
              <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="highlight">{{ myBookings.length }}</strong>
              <span>{{ t.summaryMyBookings }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon success">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ selectedDayClasses.length }}</strong>
              <span>{{ t.summarySelectedDay }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ totalSpotsLeftToday }}</strong>
              <span>{{ t.summarySpotsLeft }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon warning">
              <svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ classesList.length }}</strong>
              <span>{{ t.kpiWeek }}</span>
            </div>
          </article>
        </section>

        <div class="dashboard-grid">

          <!-- ================= IZQUIERDA ================= -->
          <div class="left-column">

            <!-- 3. BÚSQUEDA, FECHAS Y FILTROS -->
            <section class="toolbar">
              <div class="toolbar-row">
                <label class="search-box">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    v-model="searchQuery"
                    type="search"
                    :placeholder="t.searchPlaceholder"
                    :aria-label="t.searchPlaceholder"
                  />
                  <button v-if="searchQuery" type="button" class="clear-search" :aria-label="t.clearSearch" @click="searchQuery = ''">&times;</button>
                </label>

                <label class="only-booked-toggle">
                  <input type="checkbox" v-model="onlyMyBookings" />
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  <span class="toggle-label-text">{{ t.onlyMyBookingsLabel }}</span>
                </label>
              </div>

              <!-- Fechas -->
              <div class="date-block">
                <div class="date-head">
                  <span class="date-month">{{ weekTitle }}</span>
                  <div class="date-nav">
                    <button type="button" class="date-cal-btn" :aria-label="t.calendarBtn" @click="openCalendar">
                      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      <span>{{ t.calendarBtn }}</span>
                    </button>
                    <button type="button" class="date-arrow" :disabled="!canPrev" :aria-label="t.prevWeek" @click="shiftWeek(-1)">
                      <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="date-today" @click="goToday">{{ t.todayShort }}</button>
                    <button type="button" class="date-arrow" :disabled="!canNext" :aria-label="t.nextWeek" @click="shiftWeek(1)">
                      <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>

                <div class="date-grid" role="tablist" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
                  <button
                    v-for="d in weekDays"
                    :key="d.iso"
                    type="button"
                    role="tab"
                    class="date-chip"
                    :class="{ active: d.iso === selectedIso, today: d.isToday, past: d.isPast, empty: !d.count }"
                    :aria-selected="d.iso === selectedIso"
                    :aria-label="d.label + ', ' + d.count + ' ' + (lang === 'en' ? 'classes' : 'clases')"
                    @click="selectIso(d.iso)"
                  >
                    <span class="date-chip-day">{{ t.daysShort[d.dayKey] }}</span>
                    <span class="date-chip-num">{{ d.num }}</span>
                    <span class="date-chip-dots">
                      <i v-for="(col, i) in d.colors" :key="i" :style="{ background: col }"></i>
                    </span>
                    <svg v-if="d.booked" class="date-chip-booked" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                    <span v-else-if="d.isToday" class="date-chip-today-dot"></span>
                  </button>
                </div>
              </div>

              <!-- Categorías -->
              <div class="chips custom-scrollbar-x">
                <button type="button" class="chip" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">
                  {{ t.categoryAll }}
                </button>
                <button
                  v-for="cat in categoryKeys"
                  :key="cat"
                  type="button"
                  class="chip"
                  :class="{ active: activeCategory === cat }"
                  :style="{ '--cat-color': catColor(cat) }"
                  @click="activeCategory = cat"
                >
                  <i class="legend-dot"></i>{{ t.cats[cat] || cat }}
                  <em>{{ categoryCountsToday[cat] || 0 }}</em>
                </button>
              </div>
            </section>

            <!-- 4. CLASES DEL DÍA -->
            <section class="block">
              <header class="block-head">
                <div>
                  <span class="section-eyebrow">{{ t.days[selectedDayKey] }}</span>
                  <h2>{{ selectedDateLabel }}</h2>
                  <p>{{ t.timelineSub }}</p>
                </div>
                <div class="head-actions">
                  <button v-if="hasActiveFilters" type="button" class="link-btn" @click="clearFilters">{{ t.clearFilters }} ✕</button>
                  <span class="count-pill">{{ filteredDayClasses.length }}</span>
                </div>
              </header>

              <div v-if="loading" class="empty-state"><p>{{ lang === 'en' ? 'Loading classes…' : 'Cargando clases…' }}</p></div>
              <div v-else-if="filteredDayClasses.length" class="timeline">
                <div v-for="cls in filteredDayClasses" :key="cls.key" class="timeline-row">

                  <div class="timeline-time">
                    <span class="time-start">{{ cls.startTime }}</span>
                    <span class="time-end">{{ endTime(cls) }}</span>
                  </div>

                  <div class="timeline-axis">
                    <span class="timeline-dot" :style="{ background: catColor(cls.category) }"></span>
                    <span class="timeline-line"></span>
                  </div>

                  <article
                    class="class-card"
                    :class="{ booked: cls.myBooking, full: spotsLeft(cls) <= 0 && !cls.myBooking }"
                    :style="{ '--cat-color': catColor(cls.category) }"
                  >
                    <div class="class-media" @click="openDetail(cls)">
                      <img :src="cls.image" :alt="cls.name" loading="lazy" @error="onImgError" />
                      <span v-if="cls.video" class="media-video-tag">▶ Video</span>
                      <span v-if="cls.images?.length > 1" class="media-photo-count">{{ cls.images.length }} {{ lang === 'en' ? 'photos' : 'fotos' }}</span>
                      <span v-if="isBooked(cls.key)" class="booked-badge">
                        <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                        {{ t.bookedBadge }}
                      </span>
                      <span v-else-if="spotsLeft(cls) <= 0" class="full-badge">{{ t.fullBtn }}</span>
                    </div>

                    <div class="class-body">
                      <div class="class-tags">
                        <span class="cat-tag">{{ t.cats[cls.category] || cls.category }}</span>
                        <span class="level-tag">{{ translateLevel(cls.level) }}</span>
                        <span class="level-tag">{{ priceLabel(cls) }}</span>
                      </div>

                      <h3 class="class-title" @click="openDetail(cls)">{{ cls.name }}</h3>

                      <ul class="meta">
                        <li>
                          <img :src="cls.instructorAvatar" :alt="cls.instructor" class="avatar" @error="onImgError" />
                          <span>{{ cls.instructor }}</span>
                        </li>
                        <li>
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                          <span>{{ cls.startTime }} – {{ endTime(cls) }} · {{ cls.duration }} {{ t.minutesShort }}</span>
                        </li>
                      </ul>
                    </div>

                    <div class="class-side">
                      <div class="occ">
                        <div class="occ-head">
                          <span>{{ spotsLeft(cls) }} {{ t.spotsShort }}</span>
                          <b :class="occLevel(cls)">{{ occupiedCount(cls) }}/{{ cls.capacity }}</b>
                        </div>
                        <div class="occ-track" :class="occLevel(cls)">
                          <i :style="{ width: occupancyPct(cls) + '%' }"></i>
                        </div>
                      </div>

                      <button v-if="isBooked(cls.key)" type="button" class="btn-danger" :disabled="busy" @click="cancelBooking(cls)">
                        {{ t.cancelBookingBtn }}
                      </button>
                      <button v-else type="button" class="btn-primary" :disabled="busy || spotsLeft(cls) <= 0 || cls.price > 0" @click="bookClass(cls)">
                        {{ bookLabel(cls) }}
                      </button>
                    </div>
                  </article>
                </div>
              </div>

              <!-- Vacío -->
              <div v-else class="empty-state">
                <span class="empty-icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                </span>
                <h3>{{ t.emptyTitle }}</h3>
                <p>{{ t.emptyDesc }}</p>
                <div class="empty-actions">
                  <button v-if="hasActiveFilters" type="button" class="btn-ghost" @click="clearFilters">{{ t.clearFilters }}</button>
                  <button v-if="nextClassIso" type="button" class="btn-primary" @click="selectIso(nextClassIso)">
                    {{ t.goNextDay }}: {{ shortDate(nextClassIso) }}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- ================= DERECHA ================= -->
          <aside class="right-column">

            <!-- Resumen del día -->
            <section class="panel-box">
              <header class="card-header">
                <div class="card-header-icon success">
                  <svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>
                </div>
                <div class="card-header-copy">
                  <span class="card-eyebrow">{{ t.days[selectedDayKey] }}</span>
                  <h3>{{ t.dayOccupancy }}</h3>
                </div>
              </header>

              <div class="occ big">
                <div class="occ-head">
                  <span>{{ t.dayBookedLabel }}</span>
                  <b :class="dayLevel">{{ dayPct }}%</b>
                </div>
                <div class="occ-track" :class="dayLevel"><i :style="{ width: dayPct + '%' }"></i></div>
              </div>

              <ul class="day-legend">
                <li><span>{{ t.spotsLabel }}</span><b>{{ dayCapacity }}</b></li>
                <li><span>{{ t.summarySpotsLeft }}</span><b>{{ totalSpotsLeftToday }}</b></li>
              </ul>
            </section>

            <!-- Mis reservas -->
            <section id="my-bookings" class="panel-box contact-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
                </div>
                <div class="card-header-copy">
                  <span class="card-eyebrow">{{ myBookings.length }} {{ t.summaryMyBookings.toLowerCase() }}</span>
                  <h3>{{ t.summaryMyBookings }}</h3>
                </div>
              </header>

              <div v-if="bookedClassesSorted.length" class="booking-list custom-scrollbar">
                <div
                  v-for="cls in bookedClassesSorted"
                  :key="cls.key"
                  class="booking-item"
                  :style="{ '--cat-color': catColor(cls.category) }"
                  @click="openDetail(cls)"
                >
                  <img :src="cls.image" :alt="cls.name" class="booking-thumb" @error="onImgError" />
                  <div class="booking-info">
                    <strong>{{ cls.name }}</strong>
                    <span>{{ shortDate(cls.date) }} · {{ cls.startTime }}</span>
                  </div>
                  <button type="button" class="booking-cancel" :title="t.cancelBookingBtn" :aria-label="t.cancelBookingBtn" @click.stop="cancelBooking(cls)">
                    <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <p v-else class="empty-hint">{{ t.noBookings }}</p>
            </section>
          </aside>
        </div>
      </main>

      <!-- MODAL DE CALENDARIO -->
      <transition name="pop">
        <div v-if="calendarOpen" class="modal-backdrop cal-backdrop" @click.self="closeCalendar">
          <div class="cal-modal" role="dialog" aria-modal="true" :aria-label="t.calendarTitle">
            <header class="cal-head">
              <div class="cal-title">
                <span class="card-eyebrow">{{ t.calendarTitle }}</span>
                <h3>{{ calTitle }}</h3>
              </div>
              <div class="cal-nav">
                <button type="button" class="date-arrow" :disabled="!canPrevMonth" :aria-label="t.prevMonth" @click="shiftMonth(-1)">
                  <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button type="button" class="date-arrow" :aria-label="t.nextMonth" @click="shiftMonth(1)">
                  <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <button type="button" class="date-arrow" :aria-label="t.close" @click="closeCalendar">
                  <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </header>

            <div class="cal-weekdays" aria-hidden="true">
              <span v-for="k in dayKeys" :key="k">{{ t.daysShort[k] }}</span>
            </div>

            <div class="cal-grid" role="grid">
              <button
                v-for="c in monthCells"
                :key="c.iso"
                type="button"
                class="cal-cell"
                :class="{ out: !c.inMonth, today: c.isToday, past: c.isPast, has: c.count > 0, selected: c.iso === selectedIso }"
                :disabled="c.isPast && !c.count"
                :aria-label="c.label + ', ' + c.count + ' ' + (lang === 'en' ? 'classes' : 'clases')"
                :aria-pressed="c.iso === selectedIso"
                @click="pickCalendarDay(c)"
              >
                <span class="cal-num">{{ c.num }}</span>
                <span class="cal-dots">
                  <i v-for="(col, i) in c.colors" :key="i" :style="{ background: col }"></i>
                </span>
                <svg v-if="c.booked" class="cal-booked" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              </button>
            </div>

            <footer class="cal-foot">
              <div class="cal-legend">
                <span><i class="lg-dot"></i>{{ t.legendClasses }}</span>
                <span><i class="lg-ring"></i>{{ t.todayShort }}</span>
                <span><svg viewBox="0 0 24 24" class="lg-check"><path d="M20 6 9 17l-5-5"/></svg>{{ t.bookedBadge }}</span>
              </div>
              <span class="cal-summary">{{ monthClassCount }} {{ t.monthClasses }}</span>
            </footer>
          </div>
        </div>
      </transition>

      <!-- MODAL DE DETALLE -->
      <transition name="pop">
        <div v-if="selectedClass" class="modal-backdrop" @click.self="closeDetail">
          <div
            class="modal-content"
            :class="{ 'no-media': !mediaOpen }"
            role="dialog"
            aria-modal="true"
            :aria-label="selectedClass.name"
            :style="{ '--cat-color': catColor(selectedClass.category) }"
          >
            <button type="button" class="modal-close" :aria-label="t.close" @click="closeDetail">
              <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            <!-- Fotos y video (completos, se pueden ocultar) -->
            <section v-if="mediaOpen" class="modal-media">
              <div class="viewer">
                <div class="viewer-bg" :style="{ backgroundImage: viewerBg ? `url('${viewerBg}')` : 'none' }"></div>

                <img
                  v-if="currentMedia.type === 'image'"
                  :key="'img-' + currentMedia.src"
                  class="viewer-img"
                  :src="currentMedia.src"
                  :alt="selectedClass.name"
                  @error="onImgError"
                />
                <video
                  v-else
                  :key="'vid-' + currentMedia.src"
                  class="viewer-video"
                  :src="currentMedia.src"
                  :poster="posterOf(selectedClass)"
                  controls
                  playsinline
                  preload="metadata"
                >
                  {{ lang === 'en' ? 'Your browser cannot play this video.' : 'Tu navegador no puede reproducir este video.' }}
                </video>
              </div>

              <div class="media-bar">
                <div v-if="mediaItems.length > 1" class="media-step">
                  <button type="button" class="date-arrow" :aria-label="t.prevMedia" @click="stepMedia(-1)">
                    <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <span class="media-count">{{ activeMediaIndex + 1 }} / {{ mediaItems.length }}</span>
                  <button type="button" class="date-arrow" :aria-label="t.nextMedia" @click="stepMedia(1)">
                    <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
                <span v-else></span>

                <button type="button" class="media-toggle" @click="mediaOpen = false">
                  <svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 10 7a17 17 0 0 1-3.2 3.9M6.1 6.1A17 17 0 0 0 2 12c1.5 2.5 5 7 10 7a9.7 9.7 0 0 0 4-.9"/></svg>
                  {{ t.hideMedia }}
                </button>
              </div>

              <div v-if="mediaItems.length > 1" class="thumbs custom-scrollbar-x">
                <button
                  v-for="(m, i) in mediaItems"
                  :key="m.src + i"
                  type="button"
                  class="thumb"
                  :class="{ active: i === activeMediaIndex }"
                  :aria-label="m.type === 'video' ? 'Video' : (lang === 'en' ? 'Photo ' : 'Foto ') + (i + 1)"
                  @click="activeMediaIndex = i"
                >
                  <img :src="m.type === 'image' ? m.src : (posterOf(selectedClass) || emptyImage)" alt="" loading="lazy" @error="onImgError" />
                  <span v-if="m.type === 'video'" class="thumb-play">
                    <svg viewBox="0 0 24 24" class="fill"><path d="M7 4.5v15l12-7.5z"/></svg>
                  </span>
                </button>
              </div>
            </section>

            <!-- Información -->
            <div class="modal-info">
              <div class="modal-info-scroll custom-scrollbar">
                <button v-if="!mediaOpen" type="button" class="btn-ghost media-show" @click="mediaOpen = true">
                  <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  {{ t.showMedia }} ({{ mediaItems.length }})
                </button>

                <div class="class-tags">
                  <span class="cat-tag">{{ t.cats[selectedClass.category] || selectedClass.category }}</span>
                  <span class="level-tag">{{ translateLevel(selectedClass.level) }}</span>
                  <span class="level-tag">{{ priceLabel(selectedClass) }}</span>
                </div>

                <h2 class="modal-title">{{ selectedClass.name }}</h2>

                <p v-if="selectedClass.description" class="modal-desc">{{ selectedClass.description }}</p>

                <div class="modal-instructor-row">
                  <img :src="selectedClass.instructorAvatar" :alt="selectedClass.instructor" class="avatar lg" @error="onImgError" />
                  <div>
                    <strong>{{ selectedClass.instructor }}</strong>
                    <small>{{ t.instructorLabel }}</small>
                  </div>
                </div>

                <div class="modal-info-grid">
                  <div class="modal-info-item">
                    <span class="info-label">{{ t.scheduleLabel }}</span>
                    <span class="info-value">{{ shortDate(selectedClass.date) }}</span>
                    <span class="info-sub">{{ selectedClass.startTime }} – {{ endTime(selectedClass) }}</span>
                  </div>
                  <div class="modal-info-item">
                    <span class="info-label">{{ t.durationLabel }}</span>
                    <span class="info-value">{{ selectedClass.duration }} {{ t.minutesShort }}</span>
                  </div>
                  <div class="modal-info-item">
                    <span class="info-label">{{ t.spotsLabel }}</span>
                    <span class="info-value">{{ spotsLeft(selectedClass) }} / {{ selectedClass.capacity }}</span>
                  </div>
                  <div class="modal-info-item">
                    <span class="info-label">{{ t.levelLabel }}</span>
                    <span class="info-value">{{ translateLevel(selectedClass.level) }}</span>
                  </div>
                </div>

                <div class="occ">
                  <div class="occ-head">
                    <span>{{ spotsLeft(selectedClass) }} {{ t.spotsShort }}</span>
                    <b :class="occLevel(selectedClass)">{{ occupancyPct(selectedClass) }}%</b>
                  </div>
                  <div class="occ-track" :class="occLevel(selectedClass)">
                    <i :style="{ width: occupancyPct(selectedClass) + '%' }"></i>
                  </div>
                </div>
              </div>

              <div class="modal-cta">
                <button v-if="isBooked(selectedClass.key)" type="button" class="btn-danger wide" :disabled="busy" @click="cancelBooking(selectedClass)">
                  {{ t.cancelBookingBtn }}
                </button>
                <button v-else type="button" class="btn-primary wide" :disabled="busy || spotsLeft(selectedClass) <= 0 || selectedClass.price > 0" @click="bookClass(selectedClass)">
                  {{ bookLabel(selectedClass) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </HeadingMember>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useLang } from '../useLang.js';
import HeadingMember from '../HeadingMember.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { solicitudMiembro } from '../memberSesion.js';

const { lang } = useLang();
const toastRef = ref(null);
const notify = (message, type = 'success', duration = 4000) => toastRef.value?.notify(message, type, duration);

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const serverDay = { monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu', friday: 'fri', saturday: 'sat', sunday: 'sun' };
const categoryColors = {
  yoga: '#a855f7', spinning: '#f97316', crossfit: '#ef4444', boxing: '#eab308',
  pilates: '#14b8a6', zumba: '#ec4899'
};
const catColor = cat => categoryColors[cat] || 'var(--color-highlight, #3b82f6)';

const classesList = ref([]);
const loading = ref(false);
const busy = ref(false);
const activeCategory = ref('all');
const onlyMyBookings = ref(false);
const searchQuery = ref('');
const selectedClass = ref(null);
const activeMediaIndex = ref(0);

const myBookings = computed(() => classesList.value.filter(c => c.myBooking).map(c => c.key));
const categoryKeys = computed(() => [...new Set(classesList.value.map(c => c.category))].sort());

/* =========================================================
   FECHAS (semana por botones + calendario)
========================================================= */
const todayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const localIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseIso = iso => { const [y, m, d] = String(iso).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
const jsDayToKey = day => dayKeys[(day + 6) % 7];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const todayIso = localIso(todayStart());
const selectedIso = ref(todayIso);
const weekStart = ref(mondayOf(todayStart()));
const calendarOpen = ref(false);
const monthCursor = ref(new Date(todayStart().getFullYear(), todayStart().getMonth(), 1));

const locale = computed(() => (lang.value === 'en' ? 'en-US' : 'es-MX'));
const selectedDate = computed(() => selectedIso.value);
const selectedDateObj = computed(() => parseIso(selectedIso.value));
const selectedDayKey = computed(() => jsDayToKey(selectedDateObj.value.getDay()));
const selectedDateLabel = computed(() =>
  cap(selectedDateObj.value.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }))
);
const shortDate = iso => parseIso(iso).toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric', month: 'short' });

const classesByDate = computed(() => {
  const map = new Map();
  for (const c of classesList.value) {
    if (!map.has(c.date)) map.set(c.date, []);
    map.get(c.date).push(c);
  }
  return map;
});

const makeDay = d => {
  const iso = localIso(d);
  const list = classesByDate.value.get(iso) || [];
  return {
    iso,
    num: d.getDate(),
    dayKey: jsDayToKey(d.getDay()),
    isToday: iso === todayIso,
    isPast: iso < todayIso,
    count: list.length,
    colors: [...new Set(list.map(c => catColor(c.category)))].slice(0, 3),
    booked: list.some(c => c.myBooking),
    label: d.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' })
  };
};

/* ---- Semana (7 botones, sin barra de scroll) ---- */
const weekDays = computed(() => Array.from({ length: 7 }, (_, i) => makeDay(addDays(weekStart.value, i))));

const weekTitle = computed(() => {
  const s = weekStart.value;
  const e = addDays(s, 6);
  if (s.getMonth() === e.getMonth()) {
    return cap(s.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' }));
  }
  const short = (d, withYear) => d.toLocaleDateString(locale.value, withYear ? { month: 'short', year: 'numeric' } : { month: 'short' }).replace(/\./g, '');
  return cap(`${short(s, false)} – ${short(e, true)}`);
});

const minWeekStart = mondayOf(todayStart());
const lastDate = computed(() => {
  let last = addDays(todayStart(), 90);
  for (const iso of classesByDate.value.keys()) {
    const d = parseIso(iso);
    if (d > last) last = d;
  }
  return last;
});
const canPrev = computed(() => weekStart.value.getTime() > minWeekStart.getTime());
const canNext = computed(() => addDays(weekStart.value, 7).getTime() <= lastDate.value.getTime());

const selectIso = iso => {
  selectedIso.value = iso;
  const d = parseIso(iso);
  weekStart.value = mondayOf(d);
  monthCursor.value = new Date(d.getFullYear(), d.getMonth(), 1);
};
const goToday = () => selectIso(todayIso);
const shiftWeek = dir => {
  if ((dir < 0 && !canPrev.value) || (dir > 0 && !canNext.value)) return;
  let target = addDays(selectedDateObj.value, 7 * dir);
  if (localIso(target) < todayIso) target = todayStart();
  selectIso(localIso(target));
};

let touchX = 0;
let touchY = 0;
const onTouchStart = e => { const p = e.changedTouches[0]; touchX = p.clientX; touchY = p.clientY; };
const onTouchEnd = e => {
  const p = e.changedTouches[0];
  const dx = p.clientX - touchX;
  const dy = p.clientY - touchY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) shiftWeek(dx < 0 ? 1 : -1);
};

/* ---- Calendario completo (botón) ---- */
const firstOfTodayMonth = new Date(todayStart().getFullYear(), todayStart().getMonth(), 1);
const openCalendar = () => {
  const d = selectedDateObj.value;
  monthCursor.value = new Date(d.getFullYear(), d.getMonth(), 1);
  calendarOpen.value = true;
};
const closeCalendar = () => { calendarOpen.value = false; };
const shiftMonth = dir => {
  if (dir < 0 && !canPrevMonth.value) return;
  const c = monthCursor.value;
  monthCursor.value = new Date(c.getFullYear(), c.getMonth() + dir, 1);
};
const calTitle = computed(() => cap(monthCursor.value.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })));
const canPrevMonth = computed(() => monthCursor.value.getTime() > firstOfTodayMonth.getTime());
const monthCells = computed(() => {
  const first = monthCursor.value;
  const y = first.getFullYear();
  const m = first.getMonth();
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const total = Math.ceil((lead + days) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(y, m, 1 - lead + i);
    return { ...makeDay(d), inMonth: d.getMonth() === m };
  });
});
const monthClassCount = computed(() => monthCells.value.filter(c => c.inMonth).reduce((sum, c) => sum + c.count, 0));
const pickCalendarDay = c => { selectIso(c.iso); calendarOpen.value = false; };

const nextClassIso = computed(() => {
  let best = null;
  for (const iso of classesByDate.value.keys()) {
    if (iso > selectedIso.value && (!best || iso < best)) best = iso;
  }
  return best;
});

/* =========================================================
   TRADUCCIONES
========================================================= */
const traducciones = {
  es: {
    headerTag: 'Clases Grupales', mainTitle1: 'Reserva tus', mainTitle2: 'Clases', heroDesc: 'Consulta clases disponibles en tu sede y asegura tu lugar.',
    todayBtn: 'Ver hoy', nextClass: 'Tu próxima clase', noNextClass: 'Aún no tienes reservas', noNextClassSub: 'Reserva una clase para verla aquí',
    summaryMyBookings: 'Mis reservas', summarySelectedDay: 'Clases este día', summarySpotsLeft: 'Lugares libres', kpiWeek: 'Clases programadas',
    onlyMyBookingsLabel: 'Solo mis reservas', searchPlaceholder: 'Busca por clase, instructor o categoría…', clearSearch: 'Limpiar búsqueda', clearFilters: 'Limpiar filtros',
    categoryAll: 'Todas', timelineSub: 'Horario real de clases del día seleccionado.', dayOccupancy: 'Ocupación del día', dayBookedLabel: 'Cupo reservado',
    noBookings: 'Todavía no has reservado ninguna clase.', bookedBadge: 'Reservada', bookedOk: 'Reservaste', cancelledOk: 'Reserva cancelada', close: 'Cerrar',
    instructorLabel: 'Instructor', minutesShort: 'min', spotsShort: 'lugares', bookBtn: 'Reservar', fullBtn: 'Lleno', cancelBookingBtn: 'Cancelar',
    scheduleLabel: 'Horario', durationLabel: 'Duración', spotsLabel: 'Cupo', levelLabel: 'Nivel', emptyTitle: 'No hay clases con ese criterio',
    emptyDesc: 'Prueba otro día o cambia los filtros.', goNextDay: 'Ir al siguiente día con clases',
    levelBeginner: 'Principiante', levelIntermediate: 'Intermedio', levelAdvanced: 'Avanzado',
    todayShort: 'Hoy', prevWeek: 'Semana anterior', nextWeek: 'Semana siguiente', prevMonth: 'Mes anterior', nextMonth: 'Mes siguiente',
    calendarBtn: 'Calendario', calendarTitle: 'Calendario de clases', legendClasses: 'Con clases', monthClasses: 'clases este mes',
    hideMedia: 'Ocultar fotos y video', showMedia: 'Ver fotos y video', prevMedia: 'Anterior', nextMedia: 'Siguiente',
    days: { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' },
    daysShort: { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' },
    cats: { yoga: 'Yoga', spinning: 'Spinning', crossfit: 'CrossFit', boxing: 'Boxeo', pilates: 'Pilates', zumba: 'Zumba' }
  },
  en: {
    headerTag: 'Group Classes', mainTitle1: 'Book your', mainTitle2: 'Classes', heroDesc: 'See available classes at your gym and secure your spot.',
    todayBtn: 'View today', nextClass: 'Your next class', noNextClass: 'No bookings yet', noNextClassSub: 'Book a class to see it here',
    summaryMyBookings: 'My bookings', summarySelectedDay: 'Classes this day', summarySpotsLeft: 'Free spots', kpiWeek: 'Scheduled classes',
    onlyMyBookingsLabel: 'Only my bookings', searchPlaceholder: 'Search by class, instructor or category…', clearSearch: 'Clear search', clearFilters: 'Clear filters',
    categoryAll: 'All', timelineSub: 'Actual schedule for the selected date.', dayOccupancy: "Day's occupancy", dayBookedLabel: 'Booked capacity',
    noBookings: "You haven't booked any class yet.", bookedBadge: 'Booked', bookedOk: 'You booked', cancelledOk: 'Booking cancelled', close: 'Close',
    instructorLabel: 'Instructor', minutesShort: 'min', spotsShort: 'spots', bookBtn: 'Book', fullBtn: 'Full', cancelBookingBtn: 'Cancel',
    scheduleLabel: 'Schedule', durationLabel: 'Duration', spotsLabel: 'Capacity', levelLabel: 'Level', emptyTitle: 'No classes match your filters',
    emptyDesc: 'Try another day or change the filters.', goNextDay: 'Go to the next day with classes',
    levelBeginner: 'Beginner', levelIntermediate: 'Intermediate', levelAdvanced: 'Advanced',
    todayShort: 'Today', prevWeek: 'Previous week', nextWeek: 'Next week', prevMonth: 'Previous month', nextMonth: 'Next month',
    calendarBtn: 'Calendar', calendarTitle: 'Class calendar', legendClasses: 'With classes', monthClasses: 'classes this month',
    hideMedia: 'Hide photos and video', showMedia: 'Show photos and video', prevMedia: 'Previous', nextMedia: 'Next',
    days: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
    daysShort: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
    cats: { yoga: 'Yoga', spinning: 'Spinning', crossfit: 'CrossFit', boxing: 'Boxing', pilates: 'Pilates', zumba: 'Zumba' }
  }
};
const t = computed(() => traducciones[lang.value] || traducciones.es);
const translateLevel = level => ({ Principiante: t.value.levelBeginner, Intermedio: t.value.levelIntermediate, Avanzado: t.value.levelAdvanced }[level] || level);
const priceLabel = cls => (Number(cls.price || 0) > 0 ? '$' + Number(cls.price).toFixed(2) + ' MXN' : (lang.value === 'en' ? 'Free' : 'Gratis'));

/* =========================================================
   FILTROS Y CÁLCULOS
========================================================= */
const normalize = str => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const selectedDayClasses = computed(() =>
  classesList.value.filter(c => c.date === selectedDate.value).sort((a, b) => a.startTime.localeCompare(b.startTime))
);
const query = computed(() => normalize(searchQuery.value.trim()));
const matchesQuery = cls => !query.value || [cls.name, cls.instructor, t.value.cats[cls.category] || cls.category].some(s => normalize(s).includes(query.value));
const isBooked = key => myBookings.value.includes(key);
const occupiedCount = cls => Number(cls.booked || 0);
const spotsLeft = cls => Math.max(0, Number(cls.capacity || 0) - occupiedCount(cls));
const occupancyPct = cls => (cls.capacity ? Math.min(100, Math.round(occupiedCount(cls) / cls.capacity * 100)) : 0);
const occLevel = cls => (occupancyPct(cls) >= 100 ? 'high' : occupancyPct(cls) >= 75 ? 'mid' : 'low');
const bookLabel = cls => (cls.price > 0 ? (lang.value === 'en' ? 'At reception' : 'En recepción') : spotsLeft(cls) <= 0 ? t.value.fullBtn : t.value.bookBtn);
const endTime = cls => {
  const [h, m] = cls.startTime.split(':').map(Number);
  const minutes = h * 60 + m + Number(cls.duration || 0);
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};
const filteredDayClasses = computed(() => selectedDayClasses.value.filter(cls =>
  (activeCategory.value === 'all' || activeCategory.value === cls.category) && (!onlyMyBookings.value || cls.myBooking) && matchesQuery(cls)));
const hasActiveFilters = computed(() => activeCategory.value !== 'all' || onlyMyBookings.value || !!query.value);
const clearFilters = () => { activeCategory.value = 'all'; onlyMyBookings.value = false; searchQuery.value = ''; };
const categoryCountsToday = computed(() => {
  const counts = {};
  for (const cls of selectedDayClasses.value) counts[cls.category] = (counts[cls.category] || 0) + 1;
  return counts;
});
const totalSpotsLeftToday = computed(() => selectedDayClasses.value.reduce((sum, c) => sum + spotsLeft(c), 0));
const dayCapacity = computed(() => selectedDayClasses.value.reduce((sum, c) => sum + Number(c.capacity), 0));
const dayPct = computed(() => (dayCapacity.value ? Math.round((dayCapacity.value - totalSpotsLeftToday.value) / dayCapacity.value * 100) : 0));
const dayLevel = computed(() => (dayPct.value >= 100 ? 'high' : dayPct.value >= 75 ? 'mid' : 'low'));
const bookedClassesSorted = computed(() => classesList.value.filter(c => c.myBooking).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)));
const nextBooking = computed(() => bookedClassesSorted.value[0] || null);
const showMyBookings = () => document.getElementById('my-bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* =========================================================
   IMÁGENES Y VISOR DE MEDIOS
========================================================= */
const emptyImage = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#17202d"/><path d="M250 205h140M290 155v100M350 155v100" stroke="#4b84b8" stroke-width="18" stroke-linecap="round"/><text x="320" y="330" text-anchor="middle" fill="#a8b8ca" font-size="25" font-family="Arial">FactorFit</text></svg>');
const onImgError = event => { if (event.target.src !== emptyImage) event.target.src = emptyImage; };

const posterOf = cls => cls?.images?.[0] || (cls?.image && cls.image !== emptyImage ? cls.image : undefined);

const mediaItems = computed(() => {
  const c = selectedClass.value;
  if (!c) return [];
  const imgs = c.images?.length ? c.images : (c.image && c.image !== emptyImage ? [c.image] : []);
  const items = imgs.map(src => ({ type: 'image', src }));
  if (c.video) items.push({ type: 'video', src: c.video });
  if (!items.length) items.push({ type: 'image', src: emptyImage });
  return items;
});
const currentMedia = computed(() => mediaItems.value[Math.min(activeMediaIndex.value, mediaItems.value.length - 1)] || { type: 'image', src: emptyImage });
const viewerBg = computed(() => (currentMedia.value.type === 'image' ? currentMedia.value.src : posterOf(selectedClass.value)) || '');
const stepMedia = dir => {
  const n = mediaItems.value.length;
  if (n < 2) return;
  activeMediaIndex.value = (activeMediaIndex.value + dir + n) % n;
};

const mediaOpen = ref(true);
const openDetail = cls => { activeMediaIndex.value = 0; mediaOpen.value = true; selectedClass.value = cls; };
const closeDetail = () => { selectedClass.value = null; };

watch([selectedClass, calendarOpen], ([cls, cal]) => { document.body.style.overflow = (cls || cal) ? 'hidden' : ''; });

/* =========================================================
   API
========================================================= */
async function cargarClases(silent = false) {
  if (!silent) loading.value = true;
  try {
    const res = await solicitudMiembro('/api/member/clases');
    if (!res || !Array.isArray(res.classes)) throw new Error('Respuesta de clases no válida.');
    classesList.value = res.classes.map(c => ({
      ...c,
      id: Number(c.id),
      date: String(c.date),
      key: `${c.id}|${c.date}`,
      category: String(c.category || 'general').toLowerCase(),
      day: serverDay[String(c.day).toLowerCase()] || 'mon',
      image: c.image || emptyImage,
      images: Array.isArray(c.images) ? c.images.filter(u => typeof u === 'string' && u.startsWith('https://')) : [],
      video: typeof c.video === 'string' && c.video.startsWith('https://') ? c.video : null,
      instructorAvatar: c.instructorAvatar || emptyImage,
      myBooking: Boolean(c.myBooking)
    }));
    // Mantener el modal abierto sincronizado con los datos nuevos
    if (selectedClass.value) {
      selectedClass.value = classesList.value.find(c => c.key === selectedClass.value.key) || null;
    }
  } catch (e) {
    notify(e instanceof Error ? e.message : 'No se pudieron cargar las clases.', 'error', 6000);
  } finally {
    loading.value = false;
  }
}

const bookClass = async cls => {
  if (busy.value || cls.myBooking || spotsLeft(cls) <= 0) return;
  if (Number(cls.price || 0) > 0) { notify('Esta clase requiere pago. Consulta en recepción.', 'warning'); return; }
  busy.value = true;
  try {
    await solicitudMiembro('/api/member/clases/reservar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actividad_id: cls.id, fecha: cls.date }) });
    notify(`${t.value.bookedOk}: ${cls.name}`, 'success');
    await cargarClases(true);
  } catch (e) {
    notify(e instanceof Error ? e.message : 'No se pudo realizar la reserva.', 'error', 6000);
  } finally {
    busy.value = false;
  }
};

const cancelBooking = async cls => {
  if (busy.value || !cls.myBooking) return;
  busy.value = true;
  try {
    await solicitudMiembro('/api/member/clases/cancelar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actividad_id: cls.id, fecha: cls.date }) });
    notify(`${t.value.cancelledOk}: ${cls.name}`, 'info');
    selectedClass.value = null;
    await cargarClases(true);
  } catch (e) {
    notify(e instanceof Error ? e.message : 'No se pudo cancelar la reserva.', 'error', 6000);
  } finally {
    busy.value = false;
  }
};

/* =========================================================
   CICLO DE VIDA
========================================================= */
const handleKeydown = e => {
  if (e.key === 'Escape') {
    if (calendarOpen.value) calendarOpen.value = false;
    else selectedClass.value = null;
  }
  if (selectedClass.value && mediaOpen.value && mediaItems.value.length > 1) {
    if (e.key === 'ArrowLeft') stepMedia(-1);
    if (e.key === 'ArrowRight') stepMedia(1);
  }
};
const refrescarAlVolver = () => { void cargarClases(true); };
let recargaReservas;

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('focus', refrescarAlVolver);
  recargaReservas = setInterval(refrescarAlVolver, 30000);
  void cargarClases();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('focus', refrescarAlVolver);
  if (recargaReservas) clearInterval(recargaReservas);
  document.body.style.overflow = '';
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button, input, select { font: inherit; }

svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}
svg.fill { fill: currentColor; stroke: none; }

/* =========================================================
   BASE
========================================================= */
.classes-page {
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
  -webkit-tap-highlight-color: transparent;
}

.classes-container {
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
.btn-danger {
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
  white-space: nowrap;
  transition: filter 0.2s ease, transform 0.2s var(--ease), background 0.2s ease, border-color 0.2s ease;
}

.btn-primary svg,
.btn-ghost svg { width: 16px; height: 16px; flex: none; }

.btn-primary {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 22%, transparent);
}
.btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

.btn-ghost { color: var(--title); background: var(--surface); border: 1px solid var(--line2); }
.btn-ghost:hover { background: var(--surface-hover); transform: translateY(-1px); }

.btn-danger {
  color: var(--red);
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.35);
}
.btn-danger:hover:not(:disabled) { background: rgba(248, 113, 113, 0.22); transform: translateY(-1px); }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary.wide,
.btn-danger.wide { width: 100%; min-height: 48px; font-size: 13px; }

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
input:focus-visible,
[role='tab']:focus-visible {
  outline: 2px solid var(--hl);
  outline-offset: 2px;
}

/* =========================================================
   HERO
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
.hero-main h1 span { color: var(--hl); text-shadow: 0 0 36px var(--hl-line); }

.hero-main p { max-width: 560px; margin: 14px 0 0; color: var(--text2); font-size: 14px; line-height: 1.6; }

.hero-actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; }

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
.hero-base-empty { cursor: default; }
.hero-base-empty:hover { transform: none; border-color: var(--line2); }

.hero-base-img {
  width: 68px;
  height: 68px;
  flex: none;
  overflow: hidden;
  display: grid;
  place-items: center;
  border: 1px solid var(--line2);
  border-radius: 15px;
}
.hero-base-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-base-img.empty { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }
.hero-base-img.empty svg { width: 26px; height: 26px; }

.hero-base-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.hero-base-copy small { color: var(--hl); font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.hero-base-copy strong { overflow: hidden; color: #fff; font-size: 14.5px; text-overflow: ellipsis; white-space: nowrap; }
.hero-base-meta { display: flex; align-items: center; gap: 7px; color: var(--text2); font-size: 11.5px; text-transform: capitalize; }
.hero-base-arrow { width: 18px; height: 18px; flex: none; color: var(--text3); }

/* =========================================================
   INDICADORES
========================================================= */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }

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
.kpi-card:nth-child(4) { --tint: #f59e0b; }

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
.kpi-body strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 34px; font-weight: 600; line-height: 1; letter-spacing: 0.3px; }
.kpi-body span { color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.7px; line-height: 1.3; text-transform: uppercase; }

/* =========================================================
   GRID PRINCIPAL
========================================================= */
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 22px;
  align-items: start;
}

.left-column,
.right-column { min-width: 0; display: flex; flex-direction: column; gap: 22px; }

@media (min-width: 1101px) {
  .right-column { position: sticky; top: 88px; }
}

/* =========================================================
   BARRA DE EXPLORACIÓN
========================================================= */
.toolbar {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: color-mix(in srgb, var(--card) 92%, transparent);
  border: 1px solid var(--line2);
  border-radius: 22px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
}

.toolbar-row { display: flex; align-items: center; gap: 14px; }

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
.search-box:focus-within { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
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

.only-booked-toggle { display: flex; flex: none; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.only-booked-toggle input { position: absolute; opacity: 0; pointer-events: none; }
.toggle-track { width: 38px; height: 22px; flex: none; position: relative; background: rgba(255, 255, 255, 0.14); border-radius: 22px; transition: background 0.2s ease; }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s var(--ease); }
.only-booked-toggle input:checked + .toggle-track { background: var(--color-botones, var(--hl)); }
.only-booked-toggle input:checked + .toggle-track .toggle-thumb { transform: translateX(16px); }
.only-booked-toggle input:focus-visible + .toggle-track { outline: 2px solid var(--hl); outline-offset: 2px; }
.toggle-label-text { color: var(--text2); font-size: 12.5px; font-weight: 700; white-space: nowrap; }

/* ---------- Fechas (botones por semana) ---------- */
.date-block { display: flex; flex-direction: column; gap: 12px; }

.date-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px 12px; }
.date-month { min-width: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 19px; font-weight: 600; line-height: 1.2; }

.date-nav { display: flex; flex: none; align-items: center; gap: 6px; }

.date-cal-btn {
  height: 34px;
  margin-right: 6px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--title);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 800;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.date-cal-btn svg { width: 15px; height: 15px; color: var(--hl); }
.date-cal-btn:hover { background: var(--surface-hover); border-color: var(--hl-line); }

.date-arrow {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  padding: 0;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 10px;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.date-arrow svg { width: 16px; height: 16px; }
.date-arrow:hover:not(:disabled) { color: #fff; background: var(--surface-hover); border-color: var(--hl-line); }
.date-arrow:disabled { opacity: 0.3; cursor: not-allowed; }

.date-today {
  height: 34px;
  padding: 0 14px;
  color: var(--hl);
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 800;
  transition: background 0.2s ease;
}
.date-today:hover { background: var(--hl-mid); }

.date-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; touch-action: pan-y; }

.date-chip {
  position: relative;
  min-width: 0;
  padding: 11px 2px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 14px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s var(--ease), box-shadow 0.2s ease;
}
.date-chip:hover { color: #fff; background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-1px); }
.date-chip.past:not(.active) { opacity: 0.45; }
.date-chip.today:not(.active) { background: var(--hl-soft); border-color: var(--hl-line); }
.date-chip.today:not(.active) .date-chip-num { color: var(--hl); }

.date-chip.active {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-color: var(--color-botones, var(--hl));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 28%, transparent);
  opacity: 1;
}

.date-chip-day { font-size: 10.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; opacity: 0.8; }
.date-chip-num { font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 600; line-height: 1.05; }
.date-chip-dots { height: 6px; display: flex; align-items: center; justify-content: center; gap: 3px; }
.date-chip-dots i { width: 6px; height: 6px; display: block; border-radius: 50%; }
.date-chip.active .date-chip-dots i { background: rgba(255, 255, 255, 0.92) !important; }

.date-chip-today-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: var(--green);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--green);
}
.date-chip-booked {
  position: absolute;
  top: 5px;
  right: 6px;
  width: 15px;
  height: 15px;
  padding: 3px;
  color: #04210f;
  background: var(--green);
  border-radius: 50%;
  stroke-width: 4;
}

/* Categorías */
.chips { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  --cat-color: var(--hl);
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
.chip em { color: var(--text3); font-size: 10.5px; font-style: normal; font-weight: 800; }
.chip:hover { color: #fff; background: var(--surface-hover); }
.chip.active { color: #fff; background: color-mix(in srgb, var(--cat-color) 22%, transparent); border-color: color-mix(in srgb, var(--cat-color) 55%, transparent); }
.chip.active em { color: #fff; }

.legend-dot { width: 8px; height: 8px; flex: none; background: var(--cat-color); border-radius: 50%; }

/* =========================================================
   BLOQUE + TIMELINE
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
.block-head h2 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 600; letter-spacing: 0.2px; }
.block-head p { margin: 5px 0 0; color: var(--text3); font-size: 12.5px; }

.head-actions { display: flex; align-items: center; gap: 10px; }

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

.timeline { display: flex; flex-direction: column; }

.timeline-row { display: grid; grid-template-columns: 52px 16px minmax(0, 1fr); gap: 14px; }

.timeline-time { padding-top: 22px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.time-start { color: #fff; font-family: 'Oswald', sans-serif; font-size: 15px; font-weight: 600; }
.time-end { color: var(--text3); font-size: 11px; font-weight: 600; }

.timeline-axis { display: flex; flex-direction: column; align-items: center; }
.timeline-dot { width: 12px; height: 12px; margin-top: 26px; flex: none; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05); }
.timeline-line { flex: 1; width: 2px; margin-top: 4px; min-height: 20px; background: var(--line2); }
.timeline-row:last-child .timeline-line { display: none; }

/* Tarjeta de clase */
.class-card {
  --cat-color: var(--hl);
  min-width: 0;
  margin-bottom: 16px;
  padding: 14px;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) 190px;
  align-items: center;
  gap: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-left: 3px solid var(--cat-color);
  border-radius: 20px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
  transition: transform 0.3s var(--ease), border-color 0.25s ease, box-shadow 0.3s ease;
}
.class-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--cat-color) 55%, transparent); border-left-color: var(--cat-color); box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38); }
.class-card.booked { background: linear-gradient(180deg, color-mix(in srgb, var(--cat-color) 9%, transparent), transparent 60%), var(--card); }
.class-card.full .class-media img { filter: grayscale(0.55) brightness(0.8); }

.class-media { position: relative; width: 112px; height: 112px; overflow: hidden; cursor: pointer; background: #050505; border-radius: 15px; }
.class-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s var(--ease), filter 0.3s ease; }
.class-card:hover .class-media img { transform: scale(1.07); }

.media-video-tag,
.media-photo-count {
  position: absolute;
  top: 7px;
  right: 7px;
  z-index: 2;
  padding: 3px 6px;
  color: #fff;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 7px;
  font-size: 9px;
  font-weight: 800;
}
.media-photo-count { top: 29px; }

.booked-badge,
.full-badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 3px 9px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 9.5px;
  font-weight: 800;
}
.booked-badge { background: rgba(16, 185, 129, 0.92); }
.booked-badge svg { width: 10px; height: 10px; stroke-width: 3; }
.full-badge { background: rgba(239, 68, 68, 0.9); }

.class-body { min-width: 0; display: flex; flex-direction: column; gap: 9px; }

.class-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.cat-tag {
  padding: 3px 10px;
  color: var(--cat-color);
  background: color-mix(in srgb, var(--cat-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--cat-color) 40%, transparent);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.level-tag { color: var(--text3); font-size: 11.5px; font-weight: 700; }

.class-title {
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.class-title:hover { color: var(--cat-color); }

.meta { margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; list-style: none; }
.meta li { display: flex; align-items: center; gap: 8px; color: var(--text2); font-size: 12.5px; }
.meta li svg { width: 15px; height: 15px; flex: none; color: var(--hl); }

.avatar { width: 22px; height: 22px; flex: none; object-fit: cover; border-radius: 50%; border: 1px solid var(--line2); }
.avatar.lg { width: 46px; height: 46px; border-radius: 14px; }

.class-side { display: flex; flex-direction: column; gap: 12px; }

.occ { padding: 10px 12px; background: rgba(0, 0, 0, 0.25); border: 1px solid var(--line); border-radius: 13px; }
.occ.big { padding: 14px 16px; }
.occ-head { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--text3); font-size: 10.5px; font-weight: 700; }
.occ-head b { font-size: 11px; }
.occ-head b.low { color: var(--green); }
.occ-head b.mid { color: var(--amber); }
.occ-head b.high { color: var(--red); }
.occ-track { height: 6px; overflow: hidden; background: rgba(255, 255, 255, 0.07); border-radius: 999px; }
.occ-track i { display: block; height: 100%; background: var(--green); border-radius: 999px; transition: width 0.7s var(--ease); }
.occ-track.mid i { background: var(--amber); }
.occ-track.high i { background: var(--red); }

/* =========================================================
   PANELES LATERALES
========================================================= */
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
.contact-card { border-color: var(--hl-line); box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--hl-soft); }

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
.card-header-icon svg { width: 19px; height: 19px; }

.card-header-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.card-eyebrow { overflow: hidden; color: var(--hl); font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.card-header h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; line-height: 1.2; }

.day-legend { margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; list-style: none; }
.day-legend li { padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; font-size: 13px; }
.day-legend span { color: var(--text2); }
.day-legend b { color: var(--title); font-family: 'Oswald', sans-serif; font-weight: 500; }

.booking-list { max-height: 360px; padding-right: 4px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }

.booking-item {
  --cat-color: var(--hl);
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 3px solid var(--cat-color);
  border-radius: 14px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}
.booking-item:hover { background: var(--surface-hover); transform: translateY(-1px); }

.booking-thumb { width: 44px; height: 44px; flex: none; object-fit: cover; border-radius: 10px; background: #000; }
.booking-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.booking-info strong { overflow: hidden; color: var(--title); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.booking-info span { color: var(--text3); font-size: 11.5px; font-weight: 600; text-transform: capitalize; }

.booking-cancel {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--text2);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--line2);
  border-radius: 9px;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.booking-cancel svg { width: 14px; height: 14px; }
.booking-cancel:hover { color: var(--red); background: rgba(248, 113, 113, 0.12); border-color: rgba(248, 113, 113, 0.4); }

.empty-hint { margin: 0; padding: 18px 0 4px; color: var(--text3); font-size: 12.5px; text-align: center; }

.custom-scrollbar,
.custom-scrollbar-x { scrollbar-width: thin; scrollbar-color: var(--line2) transparent; }
.custom-scrollbar::-webkit-scrollbar,
.custom-scrollbar-x::-webkit-scrollbar { width: 6px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb,
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 999px; }

/* =========================================================
   VACÍO
========================================================= */
.empty-state {
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
.empty-icon { width: 64px; height: 64px; display: grid; place-items: center; color: var(--hl); background: var(--hl-soft); border: 1px solid var(--hl-line); border-radius: 20px; }
.empty-icon svg { width: 28px; height: 28px; }
.empty-state h3 { margin: 4px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; }
.empty-state p { max-width: 380px; margin: 0 0 8px; color: var(--text2); font-size: 13px; line-height: 1.6; }
.empty-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.empty-actions .btn-primary { text-transform: capitalize; }

/* =========================================================
   MODAL DE DETALLE
========================================================= */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 5000;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.modal-content {
  --cat-color: var(--hl);
  position: relative;
  width: 100%;
  max-width: 1080px;
  max-height: min(92vh, 820px);
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  background: var(--card);
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);
}
.modal-content.no-media { max-width: 520px; grid-template-columns: minmax(0, 1fr); }

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 8;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--line2);
  border-radius: 50%;
  backdrop-filter: blur(6px);
  transition: background 0.2s ease;
}
.modal-close svg { width: 16px; height: 16px; stroke-width: 2.4; }
.modal-close:hover { background: rgba(0, 0, 0, 0.85); }

/* Media completa */
.modal-media {
  min-width: 0;
  min-height: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.28);
  border-right: 1px solid var(--line);
}

.viewer {
  position: relative;
  width: 100%;
  min-height: 200px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #06070a;
  border: 1px solid var(--line2);
  border-radius: 18px;
}

.viewer-bg {
  position: absolute;
  inset: -24px;
  background-position: center;
  background-size: cover;
  filter: blur(28px) brightness(0.45) saturate(1.2);
  transform: scale(1.1);
}

.viewer-img,
.viewer-video {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  max-height: min(64vh, 620px);
  display: block;
  object-fit: contain;
}
.viewer-video { background: transparent; }

.media-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.media-step { display: flex; align-items: center; gap: 8px; }
.media-count { min-width: 46px; color: var(--text2); font-size: 12px; font-weight: 700; text-align: center; }

.media-toggle {
  height: 34px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text2);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.media-toggle svg { width: 15px; height: 15px; }
.media-toggle:hover { color: #fff; background: var(--surface-hover); border-color: var(--hl-line); }

.thumbs { display: flex; gap: 8px; padding: 2px 0 4px; overflow-x: auto; }

.thumb {
  position: relative;
  width: 72px;
  height: 56px;
  flex: none;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: var(--surface);
  border: 2px solid transparent;
  border-radius: 11px;
  opacity: 0.65;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}
.thumb:hover { opacity: 1; }
.thumb.active { opacity: 1; border-color: var(--hl); }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-play { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; background: rgba(0, 0, 0, 0.45); }
.thumb-play svg { width: 18px; height: 18px; }

/* Información */
.modal-info { min-width: 0; min-height: 0; display: flex; flex-direction: column; }

.modal-info-scroll {
  min-height: 0;
  flex: 1;
  padding: 30px 26px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
.modal-content.no-media .modal-info-scroll { padding-top: 66px; }
.modal-info-scroll .class-tags { padding-right: 46px; }
.media-show { width: 100%; }

.modal-title { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 28px; font-weight: 600; line-height: 1.15; }
.modal-desc { margin: 0; color: var(--text2); font-size: 13.5px; line-height: 1.7; }

.modal-instructor-row { display: flex; align-items: center; gap: 12px; }
.modal-instructor-row div { display: flex; flex-direction: column; gap: 2px; }
.modal-instructor-row strong { color: var(--title); font-size: 14px; }
.modal-instructor-row small { color: var(--text3); font-size: 10.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }

.modal-info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.modal-info-item { padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; background: var(--surface); border: 1px solid var(--line); border-radius: 13px; }
.info-label { color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; }
.info-value { color: var(--title); font-size: 13.5px; font-weight: 600; text-transform: capitalize; }
.info-sub { color: var(--text2); font-size: 12px; font-weight: 600; }

.modal-cta { padding: 14px 26px 22px; border-top: 1px solid var(--line); background: var(--card); }

/* =========================================================
   MODAL DE CALENDARIO
========================================================= */
.cal-modal {
  width: 100%;
  max-width: 460px;
  max-height: 92vh;
  max-height: 92dvh;
  padding: 22px;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);
}

.cal-head { margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.cal-title { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.cal-title h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 23px; font-weight: 600; line-height: 1.15; }
.cal-nav { display: flex; flex: none; align-items: center; gap: 6px; }

.cal-weekdays,
.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.cal-weekdays { margin-bottom: 6px; }
.cal-weekdays span { padding: 4px 0; color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-align: center; text-transform: uppercase; }

.cal-cell {
  position: relative;
  height: 54px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--text2);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}
.cal-cell:hover:not(:disabled) { background: var(--surface-hover); border-color: var(--line2); }
.cal-cell:disabled { cursor: not-allowed; }
.cal-num { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 500; line-height: 1; }
.cal-cell.has .cal-num { color: var(--title); font-weight: 600; }
.cal-cell.out { opacity: 0.3; }
.cal-cell.out.has { opacity: 0.55; }
.cal-cell.past:not(.selected) { opacity: 0.35; }
.cal-cell.has:not(.past):not(.selected) { background: var(--surface); border-color: var(--line2); }
.cal-cell.today { border-color: var(--hl-line); background: var(--hl-soft); }
.cal-cell.today .cal-num { color: var(--hl); }
.cal-cell.selected {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border-color: var(--color-botones, var(--hl));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 30%, transparent);
  opacity: 1;
}
.cal-cell.selected .cal-num { color: inherit; }
.cal-cell.selected .cal-dots i { background: rgba(255, 255, 255, 0.92) !important; }

.cal-dots { height: 5px; display: flex; justify-content: center; gap: 3px; }
.cal-dots i { width: 5px; height: 5px; display: block; border-radius: 50%; }

.cal-booked {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  padding: 2px;
  color: #04210f;
  background: var(--green);
  border-radius: 50%;
  stroke-width: 4;
}

.cal-foot {
  margin-top: 16px;
  padding-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  border-top: 1px solid var(--line);
}
.cal-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; }
.cal-legend span { display: inline-flex; align-items: center; gap: 7px; color: var(--text3); font-size: 11px; font-weight: 600; }
.lg-dot { width: 6px; height: 6px; display: block; background: var(--hl); border-radius: 50%; }
.lg-ring { width: 12px; height: 12px; display: block; background: var(--hl-soft); border: 1px solid var(--hl-line); border-radius: 4px; }
.lg-check { width: 13px; height: 13px; padding: 2px; color: #04210f; background: var(--green); border-radius: 50%; stroke-width: 4; }
.cal-summary { padding: 5px 11px; color: var(--hl); background: var(--hl-soft); border: 1px solid var(--hl-line); border-radius: 999px; font-size: 11px; font-weight: 800; }

.pop-enter-active,
.pop-leave-active { transition: opacity 0.25s ease; }
.pop-enter-active .modal-content,
.pop-leave-active .modal-content,
.pop-enter-active .cal-modal,
.pop-leave-active .cal-modal { transition: transform 0.28s var(--ease); }
.pop-enter-from,
.pop-leave-to { opacity: 0; }
.pop-enter-from .modal-content,
.pop-leave-to .modal-content,
.pop-enter-from .cal-modal,
.pop-leave-to .cal-modal { transform: translateY(16px) scale(0.97); }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .hero { grid-template-columns: 1fr; }
  .hero-base { max-width: 420px; }
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); }
  .right-column { position: static; }
}

@media (max-width: 900px) {
  .kpi-card { padding: 18px; gap: 13px; }
  .class-card { grid-template-columns: 96px minmax(0, 1fr); }
  .class-media { width: 96px; height: 96px; }
  .class-side { grid-column: 1 / -1; flex-direction: row; align-items: center; padding-top: 12px; border-top: 1px solid var(--line); }
  .class-side .occ { flex: 1; }
  .class-side .btn-primary,
  .class-side .btn-danger { flex: none; min-width: 130px; }
}

@media (max-width: 860px) {
  /* Detalle: hoja de una columna, foto/video completos arriba */
  .modal-backdrop { padding: 0; align-items: flex-end; }
  .modal-content,
  .modal-content.no-media {
    max-width: none;
    max-height: 94vh;
    max-height: 94dvh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    border-radius: 24px 24px 0 0;
    border-bottom: 0;
  }
  .modal-media { flex: none; padding: 12px; overflow: visible; border-right: 0; border-bottom: 1px solid var(--line); }
  .viewer { border-radius: 16px; }
  .viewer-img,
  .viewer-video { max-height: 52vh; max-height: 52dvh; }
  .modal-info { flex: none; overflow: visible; }
  .modal-info-scroll { flex: none; overflow: visible; padding: 18px 16px 12px; }
  .modal-content.no-media .modal-info-scroll { padding-top: 62px; }
  .modal-title { font-size: 23px; }
  .modal-cta {
    position: sticky;
    bottom: 0;
    z-index: 4;
    padding: 12px 16px calc(14px + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(180deg, color-mix(in srgb, var(--card) 80%, transparent), var(--card) 30%);
    backdrop-filter: blur(10px);
  }
  .modal-close { top: 12px; right: 12px; }
}

@media (max-width: 760px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
}

@media (max-width: 680px) {
  .classes-container { padding: 14px 12px 44px; gap: 16px; }

  .hero { padding: 20px 16px; border-radius: 20px; gap: 18px; }
  .hero::after { right: -120px; bottom: -210px; }
  .hero-main p { font-size: 13px; }
  .hero-actions { margin-top: 16px; }
  .hero-actions > * { flex: 1; }
  .hero-base { max-width: none; }

  .kpi-grid { gap: 9px; }
  .kpi-card { padding: 16px 14px; flex-direction: column; align-items: flex-start; gap: 12px; border-radius: 17px; }
  .kpi-card::before { left: 14px; right: 14px; }
  .kpi-icon { width: 38px; height: 38px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body { gap: 5px; }
  .kpi-body strong { font-size: 28px; }
  .kpi-body span { font-size: 9.5px; }

  .toolbar { padding: 12px; gap: 12px; border-radius: 18px; }
  .toolbar-row { flex-direction: column; align-items: stretch; gap: 12px; }

  /* Fechas móvil: flechas + mes arriba, Calendario y Hoy abajo, luego los 7 días */
  .toolbar-row .only-booked-toggle {
    justify-content: space-between;
    flex-direction: row-reverse;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--line2);
    border-radius: 13px;
  }
  .search-box { height: 46px; }

  .date-block { gap: 12px; }
  .date-head { display: block; }
  .date-nav {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 40px;
    grid-template-areas:
      "prev title title next"
      "cal  cal   today today";
    gap: 10px 8px;
    align-items: center;
  }
  /* El título está fuera de .date-nav: lo colocamos con position sobre la primera fila */
  .date-head { position: relative; }
  .date-month {
    position: absolute;
    top: 0;
    left: 48px;
    right: 48px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    text-align: center;
    white-space: nowrap;
  }
  .date-nav > :nth-child(1) { grid-area: cal; width: 100%; height: 40px; margin: 0; justify-content: center; }
  .date-nav > :nth-child(2) { grid-area: prev; width: 40px; height: 40px; }
  .date-nav > :nth-child(3) { grid-area: today; width: 100%; height: 40px; font-size: 12.5px; }
  .date-nav > :nth-child(4) { grid-area: next; width: 40px; height: 40px; }
  .date-cal-btn { font-size: 12.5px; }

  .date-grid { gap: 6px; }
  .date-chip { padding: 10px 0 9px; border-radius: 13px; gap: 3px; }
  .date-chip-day { font-size: 9px; letter-spacing: 0.2px; }
  .date-chip-num { font-size: 20px; }
  .date-chip-dots { height: 5px; }
  .date-chip-dots i { width: 5px; height: 5px; }
  .date-chip-today-dot { top: 5px; right: 5px; width: 5px; height: 5px; }
  .date-chip-booked {
    top: -5px;
    right: -4px;
    width: 16px;
    height: 16px;
    padding: 3px;
    border: 2px solid var(--card);
    box-sizing: content-box;
    width: 10px;
    height: 10px;
  }

  .chips { flex-wrap: nowrap; overflow-x: auto; margin: 0 -12px; padding: 0 12px 2px; scrollbar-width: none; }
  .chips::-webkit-scrollbar { display: none; }

  .block { gap: 14px; }
  .block-head h2 { font-size: 20px; }

  /* Timeline compacto: el horario va dentro de la tarjeta */
  .timeline-row { grid-template-columns: 12px minmax(0, 1fr); gap: 10px; }
  .timeline-time { display: none; }
  .timeline-dot { margin-top: 22px; }

  .class-card { padding: 12px; gap: 12px; border-radius: 17px; grid-template-columns: 76px minmax(0, 1fr); }
  .class-media { width: 76px; height: 76px; border-radius: 12px; }
  .class-title { font-size: 16px; }
  .class-side { flex-direction: column; align-items: stretch; }
  .class-side .btn-primary,
  .class-side .btn-danger { width: 100%; }

  .panel-box { padding: 18px 16px; border-radius: 18px; }
  .right-column { gap: 16px; }

  .thumb { width: 64px; height: 50px; }
  .modal-info-grid { gap: 8px; }

  /* Calendario como hoja inferior */
  .cal-backdrop { padding: 0; align-items: flex-end; }
  .cal-modal {
    max-width: none;
    padding: 18px 14px calc(18px + env(safe-area-inset-bottom, 0px));
    border-radius: 24px 24px 0 0;
    border-bottom: 0;
  }
  .cal-cell { height: 50px; }
  .cal-num { font-size: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
</style>