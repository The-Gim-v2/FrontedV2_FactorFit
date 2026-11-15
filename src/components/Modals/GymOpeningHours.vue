<template>
  <div class="gh-overlay" @click.self="emit('close')">
    <section class="gh-panel" role="dialog" aria-modal="true" aria-labelledby="gh-title">
      <!-- ================= HEADER ================= -->
      <header class="gh-head">
        <div class="gh-title">
          <span class="gh-symbol"><Ico n="clock" /></span>
          <div class="gh-title-text">
            <small>CONFIGURACIÓN DEL GIMNASIO</small>
            <h2 id="gh-title">HORARIOS <span>DEL GIMNASIO</span></h2>
            <p>Sede {{ sede }} · Define cuándo abres y, si quieres, las clases o bloques de cada día.</p>
          </div>
        </div>
        <button class="gh-close" type="button" aria-label="Cerrar" @click="emit('close')"><Ico n="close" /></button>
      </header>

      <div class="gh-body">
        <!-- ================= RESUMEN ================= -->
        <div class="gh-stats">
          <article class="gh-stat">
            <span class="gh-stat-icon ok"><Ico n="door-open" /></span>
            <div><strong>{{ abiertos }} <em>de 7</em></strong><small>DÍAS ABIERTOS</small></div>
          </article>
          <article class="gh-stat">
            <span class="gh-stat-icon warm"><Ico n="timer" /></span>
            <div><strong>{{ horasSemana }} h</strong><small>ABIERTO A LA SEMANA</small></div>
          </article>
          <article class="gh-stat">
            <span class="gh-stat-icon"><Ico n="grid" /></span>
            <div><strong>{{ bloques.length }} <em>{{ leyenda.length }} {{ leyenda.length === 1 ? 'clase' : 'clases' }}</em></strong><small>BLOQUES EN LA SEMANA</small></div>
          </article>
        </div>

        <p v-if="error" class="gh-alert error" role="alert"><Ico n="alert" /><span>{{ error }}</span></p>
        <p v-if="exito" class="gh-alert success" role="status"><Ico n="check-circle" /><span>{{ exito }}</span></p>
        <p v-if="aviso && !exito" class="gh-alert info" role="status"><Ico n="info" /><span>{{ aviso }}</span></p>
        <p v-if="!soportaBloques" class="gh-alert warn" role="status">
          <Ico n="server" />
          <span>El servidor todavía no devuelve «bloques». Podrás armarlos aquí, pero no se conservarán hasta que el endpoint <b>horario-funcionamiento</b> los acepte.</span>
        </p>

        <!-- ================= TABS ================= -->
        <div class="gh-toolbar">
          <div class="gh-segmented" role="tablist" :style="{ '--i': vista === 'semana' ? 1 : 0 }">
            <span class="gh-thumb"></span>
            <button type="button" role="tab" :aria-selected="vista === 'apertura'" :class="{ active: vista === 'apertura' }" @click="vista = 'apertura'">
              <Ico n="door-open" /><span>Apertura</span>
            </button>
            <button type="button" role="tab" :aria-selected="vista === 'semana'" :class="{ active: vista === 'semana' }" @click="vista = 'semana'">
              <Ico n="calendar-week" /><span>Horario semanal</span>
            </button>
          </div>

          <div v-if="vista === 'apertura'" class="gh-presets">
            <button type="button" class="gh-chip" :disabled="bloqueado" @click="abrirLunesViernes"><Ico n="briefcase" />Lun – Vie</button>
            <button type="button" class="gh-chip" :disabled="bloqueado" @click="abrirTodos"><Ico n="calendar-check" />Todos los días</button>
            <button type="button" class="gh-chip" :disabled="bloqueado || !abiertos" @click="copiarATodos" title="Copia el horario del primer día abierto a los demás días abiertos">
              <Ico n="copy" />Copiar a todos
            </button>
          </div>
          <button v-else type="button" class="gh-btn primary sm" :disabled="bloqueado" @click="abrirDlg()">
            <Ico n="plus" />Añadir bloque
          </button>
        </div>

        <!-- ============================================================
             TAB 1: APERTURA
        ============================================================ -->
        <template v-if="vista === 'apertura'">
          <div class="gh-list">
            <article v-for="(dia, i) in horarios" :key="dia.dia" class="gh-day" :class="{ closed: !dia.abierto, today: i === hoy }">
              <div class="gh-day-main">
                <label class="gh-switch" :aria-label="`${dias[i]} abierto`">
                  <input type="checkbox" v-model="dia.abierto" :disabled="bloqueado" />
                  <span class="gh-track"></span>
                </label>
                <div class="gh-day-name">
                  <strong>{{ dias[i] }}<span v-if="i === hoy" class="gh-today">HOY</span></strong>
                  <small :class="{ on: dia.abierto }">
                    <i v-if="dia.abierto" class="gh-dot"></i><Ico v-else n="moon" />
                    {{ dia.abierto ? 'Abierto al público' : 'Cerrado' }}
                  </small>
                </div>
              </div>

              <div class="gh-times" :class="{ off: !dia.abierto }">
                <label class="gh-time">
                  <span>Abre</span>
                  <div class="gh-time-box">
                    <Ico n="sunrise" />
                    <input type="time" v-model="dia.apertura" :disabled="!dia.abierto || bloqueado" />
                  </div>
                </label>
                <Ico n="arrow-right" class="gh-arrow" />
                <label class="gh-time">
                  <span>Cierra</span>
                  <div class="gh-time-box">
                    <Ico n="sunset" />
                    <input type="time" v-model="dia.cierre" :disabled="!dia.abierto || bloqueado" />
                  </div>
                </label>
                <span class="gh-duration" :class="{ bad: dia.abierto && duracion(dia) <= 0 }">
                  {{ dia.abierto ? textoDuracion(dia) : '—' }}
                </span>
              </div>
            </article>
          </div>

          <div class="gh-note">
            <Ico n="lightbulb" />
            <span>Con esto basta: por ejemplo <b>abierto de 6:00 a 11:00</b>. Si además quieres mostrar clases con nombre y color, ve a <b>Horario semanal</b>.</span>
          </div>
        </template>

        <!-- ============================================================
             TAB 2: HORARIO SEMANAL
        ============================================================ -->
        <template v-else>
          <!-- Cuadrícula (computadora) -->
          <div class="gh-gridwrap">
            <div class="gh-grid">
              <div class="gh-corner">HORA</div>
              <div v-for="(d, i) in dias" :key="d" class="gh-dayhead" :class="{ today: i === hoy }">
                <strong>{{ d.toUpperCase() }}</strong>
                <small v-if="i === hoy">HOY</small>
              </div>

              <div class="gh-hour open"><span><Ico n="door-open" />ABIERTO</span></div>
              <div v-for="(dia, i) in horarios" :key="'a-' + dia.dia" class="gh-slot">
                <button type="button" class="gh-open-chip" :class="{ off: !dia.abierto }" @click="vista = 'apertura'" title="Editar apertura">
                  <template v-if="dia.abierto">{{ corto(dia.apertura) }} – {{ corto(dia.cierre) }}</template>
                  <template v-else><Ico n="moon" />Cerrado</template>
                </button>
              </div>

              <template v-for="sec in secciones" :key="sec.id">
                <div class="gh-section"><Ico :n="sec.id === 'm' ? 'sun' : 'moon'" />{{ sec.titulo }}</div>
                <template v-for="fila in sec.filas" :key="fila.key">
                  <div class="gh-hour">
                    <span><b>{{ hm(fila.inicio) }} – {{ hm(fila.fin) }}</b><em>{{ suf(fila.inicio) }}</em></span>
                  </div>
                  <div v-for="(d, i) in ids" :key="fila.key + d" class="gh-slot">
                    <button
                      v-if="fila.porDia[d]"
                      type="button"
                      class="gh-block"
                      :style="{ '--c': fila.porDia[d]!.color }"
                      :title="`${fila.porDia[d]!.titulo} · ${fmt12(fila.inicio)} – ${fmt12(fila.fin)}`"
                      @click="abrirDlg({ titulo: fila.porDia[d]!.titulo, dia: d })"
                    >
                      <span>{{ fila.porDia[d]!.titulo }}</span>
                    </button>
                    <button
                      v-else
                      type="button"
                      class="gh-empty"
                      :aria-label="`Añadir bloque el ${dias[i]} de ${fmt12(fila.inicio)} a ${fmt12(fila.fin)}`"
                      @click="abrirDlg({ dia: d, inicio: fila.inicio, fin: fila.fin })"
                    ><Ico n="plus" /></button>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <!-- Vista móvil y tablet: un día a la vez -->
          <div class="gh-weeklist">
            <div class="gh-daytabs" role="tablist" aria-label="Día de la semana">
              <button
                v-for="(d, i) in dias"
                :key="'t-' + d"
                type="button"
                role="tab"
                class="gh-daytab"
                :class="{ active: i === diaMovil, today: i === hoy, closed: !horarios[i]?.abierto }"
                :aria-selected="i === diaMovil"
                @click="diaMovil = i"
              >
                <span>{{ d.slice(0, 3) }}</span>
                <i v-if="cuenta(i)" class="gh-daytab-n">{{ cuenta(i) }}</i>
              </button>
            </div>

            <article class="gh-wd" :class="{ today: diaMovil === hoy }">
              <header class="gh-wd-head">
                <div class="gh-wd-name">
                  <strong>{{ dias[diaMovil] }}</strong>
                  <span v-if="diaMovil === hoy" class="gh-today">HOY</span>
                </div>
                <button type="button" class="gh-open-chip" :class="{ off: !diaSel.abierto }" @click="vista = 'apertura'" title="Editar apertura">
                  <template v-if="diaSel.abierto"><Ico n="door-open" />{{ corto(diaSel.apertura) }} – {{ corto(diaSel.cierre) }}</template>
                  <template v-else><Ico n="moon" />Cerrado</template>
                </button>
              </header>

              <ol v-if="bloquesDe(diaSel.dia).length" class="gh-timeline">
                <li v-for="b in bloquesDe(diaSel.dia)" :key="b.uid">
                  <div class="gh-tl-time">
                    <b>{{ hm(b.inicio) }}</b><small>{{ suf(b.inicio) }}</small>
                  </div>
                  <button type="button" class="gh-wd-block" :style="{ '--c': b.color }" @click="abrirDlg({ titulo: b.titulo, dia: b.dia })">
                    <span class="gh-wd-title">{{ b.titulo }}</span>
                    <span class="gh-wd-time">{{ fmt12(b.inicio) }} – {{ fmt12(b.fin) }}</span>
                  </button>
                </li>
              </ol>
              <p v-else class="gh-wd-empty">Sin bloques este día</p>

              <button type="button" class="gh-wd-add" :disabled="bloqueado" @click="abrirDlg({ dia: diaSel.dia })">
                <Ico n="plus" />Añadir bloque
              </button>
            </article>
          </div>

          <!-- Estado vacío -->
          <div v-if="!bloques.length" class="gh-emptybox">
            <span class="gh-emptybox-icon"><Ico n="grid" /></span>
            <div>
              <strong>Aún no hay clases ni bloques</strong>
              <p>Crea un bloque con nombre y color (por ejemplo «Zumba») y aplícalo a varios días con horas distintas. Si no lo necesitas, el horario de apertura ya es suficiente.</p>
            </div>
            <button type="button" class="gh-btn ghost sm" @click="abrirDlg()"><Ico n="plus" />Crear el primero</button>
          </div>

          <!-- Leyenda -->
          <div v-if="leyenda.length" class="gh-legend">
            <button v-for="l in leyenda" :key="l.key" type="button" class="gh-legend-item" @click="abrirDlg({ titulo: l.titulo })" :title="`Editar «${l.titulo}»`">
              <i :style="{ background: l.color }"></i>{{ l.titulo }}<em>{{ l.count }}</em>
            </button>
          </div>
        </template>

        <!-- ============================================================
             FESTIVOS Y HORARIOS ESPECIALES
        ============================================================ -->
        <section class="gh-exceptions">
          <header class="gh-ex-head">
            <span class="gh-ex-icon"><Ico n="calendar-event" /></span>
            <div>
              <h3>Festivos y cierres especiales</h3>
              <p>Tiene prioridad sobre la apertura semanal y se mostrará a los miembros de esta sede.</p>
            </div>
          </header>

          <form class="gh-ex-form" @submit.prevent="guardarExcepcion">
            <div class="gh-ex-field f-fecha">
              <label for="gh-ex-fecha">Fecha</label>
              <div class="gh-ex-control">
                <Ico n="calendar" />
                <input id="gh-ex-fecha" v-model="exForm.fecha" type="date" required :disabled="bloqueado || guardandoExcepcion" />
              </div>
            </div>

            <div class="gh-ex-field f-tipo">
              <label for="gh-ex-tipo">Tipo</label>
              <div class="gh-ex-control">
                <Ico n="toggles" />
                <select id="gh-ex-tipo" v-model="exForm.tipo" :disabled="bloqueado || guardandoExcepcion">
                  <option value="cerrado">Cerrado por festivo o imprevisto</option>
                  <option value="especial">Horario especial</option>
                  <option value="abierto">Abierto todo el día (excepcional)</option>
                </select>
                <Ico n="chevron-down" class="gh-ex-chev" />
              </div>
            </div>

            <div class="gh-ex-field f-motivo">
              <label for="gh-ex-motivo">Motivo</label>
              <div class="gh-ex-control">
                <Ico n="chat" />
                <input id="gh-ex-motivo" v-model.trim="exForm.motivo" type="text" maxlength="200" placeholder="Ej. Día festivo, mantenimiento" required :disabled="bloqueado || guardandoExcepcion" />
              </div>
            </div>

            <template v-if="exForm.tipo === 'especial'">
              <div class="gh-ex-field f-hora">
                <label for="gh-ex-apertura">Apertura</label>
                <div class="gh-ex-control">
                  <Ico n="sunrise" />
                  <input id="gh-ex-apertura" v-model="exForm.apertura" type="time" required :disabled="bloqueado || guardandoExcepcion" />
                </div>
              </div>
              <div class="gh-ex-field f-hora">
                <label for="gh-ex-cierre">Cierre</label>
                <div class="gh-ex-control">
                  <Ico n="sunset" />
                  <input id="gh-ex-cierre" v-model="exForm.cierre" type="time" required :disabled="bloqueado || guardandoExcepcion" />
                </div>
              </div>
            </template>

            <button type="submit" class="gh-btn primary gh-ex-submit" :disabled="bloqueado || guardandoExcepcion">
              <Ico :n="guardandoExcepcion ? 'refresh' : 'plus'" :class="{ 'gh-spin': guardandoExcepcion }" />
              {{ guardandoExcepcion ? 'Guardando...' : 'Guardar fecha especial' }}
            </button>
          </form>

          <div v-if="excepciones.length" class="gh-ex-list">
            <article v-for="x in excepciones" :key="x.fecha" class="gh-ex-row" :class="x.tipo">
              <span class="gh-ex-badge"><Ico :n="exTipoIcono(x.tipo)" /></span>
              <div class="gh-ex-info">
                <div class="gh-ex-title">
                  <strong>{{ exFechaTxt(x.fecha) }}</strong>
                  <span class="gh-ex-tag">{{ exTipoTxt(x.tipo) }}</span>
                </div>
                <small>{{ x.motivo }}<template v-if="x.tipo === 'especial'"> · {{ x.apertura }}–{{ x.cierre }}</template></small>
              </div>
              <button type="button" class="gh-ex-del" :disabled="bloqueado || guardandoExcepcion" @click="eliminarExcepcion(x.fecha)">
                <Ico n="trash" /><span>Eliminar</span>
              </button>
            </article>
          </div>
          <p v-else class="gh-ex-empty">No hay fechas especiales programadas.</p>

          <div v-if="estadoActual" class="gh-ex-state" :class="estadoActual.abierto ? 'open' : 'closed'">
            <Ico :n="estadoActual.abierto ? 'door-open' : 'door-closed'" />
            <span>
              <strong>Estado actual:</strong> {{ estadoActual.abierto ? 'Abierto' : 'Cerrado' }} · {{ estadoActual.motivo }}
              <template v-if="estadoActual.apertura"> ({{ estadoActual.apertura }}–{{ estadoActual.cierre }})</template>
            </span>
          </div>
        </section>
      </div>

      <!-- ================= FOOTER ================= -->
      <footer class="gh-footer">
        <button type="button" class="gh-btn ghost" @click="emit('close')">Cancelar</button>
        <button type="button" class="gh-btn primary" :disabled="bloqueado" @click="guardar">
          <Ico :n="guardando ? 'refresh' : 'check'" :class="{ 'gh-spin': guardando }" />
          {{ guardando ? 'Guardando...' : 'Guardar horario' }}
        </button>
      </footer>

      <!-- ============================================================
           DIÁLOGO: NUEVO / EDITAR BLOQUE
      ============================================================ -->
      <transition name="gh-pop">
        <div v-if="dlg.abierto" class="gh-dlg-overlay" @click.self="cerrarDlg">
          <form class="gh-dlg" @submit.prevent="guardarDlg" role="dialog" aria-modal="true" aria-labelledby="gh-dlg-title">
            <header class="gh-dlg-head">
              <div>
                <small>{{ dlg.edit ? 'EDITAR BLOQUE' : 'NUEVO BLOQUE' }}</small>
                <h3 id="gh-dlg-title">{{ dlg.edit ? 'Editar' : 'Añadir' }} <span>bloque</span></h3>
              </div>
              <button type="button" class="gh-close sm" aria-label="Cerrar" @click="cerrarDlg"><Ico n="close" /></button>
            </header>

            <div class="gh-dlg-body">
              <div class="gh-field">
                <label for="gh-titulo">Título</label>
                <div class="gh-input">
                  <Ico n="type" />
                  <input id="gh-titulo" v-model="dlg.titulo" list="gh-titulos" maxlength="60" placeholder="Ej. Zumba, Yoga, Funcional..." autocomplete="off" @input="alEscribirTitulo" />
                  <datalist id="gh-titulos"><option v-for="l in leyenda" :key="l.key" :value="l.titulo"></option></datalist>
                </div>
              </div>

              <div class="gh-field">
                <label>Color</label>
                <div class="gh-palette" role="radiogroup" aria-label="Color del bloque">
                  <button v-for="c in PALETA" :key="c" type="button" role="radio" :aria-checked="dlg.color === c" class="gh-swatch" :class="{ on: dlg.color === c }" :style="{ '--c': c }" :aria-label="c" @click="dlg.color = c">
                    <Ico n="check" />
                  </button>
                  <label class="gh-swatch custom" :class="{ on: !PALETA.includes(dlg.color) }" :style="{ '--c': dlg.color }" title="Otro color">
                    <Ico n="eyedropper" />
                    <input type="color" v-model="dlg.color" />
                  </label>
                </div>
              </div>

              <div class="gh-field">
                <label>Días en que se repite</label>
                <div class="gh-daychips" role="group">
                  <button v-for="d in ids" :key="d" type="button" class="gh-daychip" :class="{ on: dlg.dias[d]?.on }" :aria-pressed="!!dlg.dias[d]?.on" @click="alternarDia(d)">
                    <span>{{ nombreDia(d).slice(0, 3).toUpperCase() }}</span>
                  </button>
                </div>
              </div>

              <div class="gh-field">
                <div class="gh-field-top">
                  <label>Horas de cada día</label>
                  <button v-if="seleccionados.length > 1" type="button" class="gh-link" @click="mismasHoras"><Ico n="copy" />Usar las mismas horas en todos</button>
                </div>
                <p v-if="!seleccionados.length" class="gh-hint">Elige al menos un día para definir sus horas.</p>
                <div v-else class="gh-ranges">
                  <div v-for="d in seleccionados" :key="d" class="gh-range">
                    <strong>{{ dias[ids.indexOf(d)] }}</strong>
                    <input type="time" v-model="rg(d).inicio" aria-label="Inicio" />
                    <Ico n="arrow-right" />
                    <input type="time" v-model="rg(d).fin" aria-label="Fin" />
                    <span class="gh-range-dur" :class="{ bad: rangoMin(rg(d)) <= 0 }">{{ rangoMin(rg(d)) > 0 ? durTxt(rangoMin(rg(d))) : 'Revisar' }}</span>
                  </div>
                </div>
              </div>

              <div class="gh-preview">
                <span>VISTA PREVIA</span>
                <div class="gh-block static" :style="{ '--c': dlg.color }"><span>{{ dlg.titulo.trim() || 'Título del bloque' }}</span></div>
              </div>

              <p v-if="dlg.error" class="gh-alert error" role="alert"><Ico n="alert" /><span>{{ dlg.error }}</span></p>
            </div>

            <footer class="gh-dlg-foot">
              <button v-if="dlg.edit" type="button" class="gh-btn danger" @click="eliminarDlg">
                <Ico n="trash" />{{ dlg.confirmar ? '¿Seguro? Eliminar' : 'Eliminar' }}
              </button>
              <span class="gh-spacer"></span>
              <button type="button" class="gh-btn ghost" @click="cerrarDlg">Cancelar</button>
              <button type="submit" class="gh-btn primary"><Ico n="check" />{{ dlg.edit ? 'Guardar cambios' : 'Añadir bloque' }}</button>
            </footer>
          </form>
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, defineComponent, h } from 'vue';

const emit = defineEmits(['close', 'saved']);

/* =========================================================
   ICONOS SVG (sin fuentes externas)
========================================================= */
const ICONS: Record<string, string> = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  'door-open': '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3M13 20h9M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z"/>',
  'door-closed': '<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20M14 12v.01"/>',
  timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
  'calendar-week': '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 17.5h2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  'calendar-check': '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18M9 15.5l2 2 4-4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  'calendar-event': '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/><rect x="7.5" y="13.5" width="4" height="4" rx="1"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M4 16a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  sunrise: '<path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0"/>',
  sunset: '<path d="M12 10V2M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 6l-4 4-4-4M16 18a4 4 0 0 0-8 0"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  lightbulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  toggles: '<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="16" cy="12" r="3"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/>',
  refresh: '<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  type: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  eyedropper: '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4z"/>'
};
const Ico = defineComponent({
  name: 'Ico',
  props: { n: { type: String, required: true } },
  setup(props) {
    return () => h('svg', {
      class: 'ico', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
      innerHTML: ICONS[props.n] || ''
    });
  }
});

type Dia = { dia: string; abierto: boolean; apertura: string; cierre: string };
type Bloque = { uid: string; dia: string; titulo: string; color: string; inicio: string; fin: string };

const ids = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COLOR_BASE = '#34d399';
const PALETA: string[] = ['#34d399', '#fb923c', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf', '#facc15', '#818cf8', '#a3e635'];
const nombreDia = (d: string): string => dias[ids.indexOf(d)] ?? d;
const nuevos = (): Dia[] => ids.map(dia => ({ dia, abierto: false, apertura: '06:00', cierre: '22:00' }));

const horarios = ref<Dia[]>(nuevos());
const bloques = ref<Bloque[]>([]);
const sede = ref(1);
const abiertos = ref(0);
const cargando = ref(false);
const guardando = ref(false);
const error = ref('');
const exito = ref('');
const aviso = ref('');
const soportaBloques = ref(true);
const excepciones = ref<any[]>([]);
const estadoActual = ref<any>(null);
const guardandoExcepcion = ref(false);
const exForm = reactive({ fecha: '', tipo: 'cerrado', motivo: '', apertura: '09:00', cierre: '18:00' });
const exFechaTxt = (f: string) => {
  const [y, m, d] = String(f || '').slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(f || '');
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};
const exTipoTxt = (t: string) => (t === 'cerrado' ? 'Cerrado' : t === 'especial' ? 'Horario especial' : 'Abierto extra');
const exTipoIcono = (t: string) => (t === 'cerrado' ? 'door-closed' : t === 'especial' ? 'clock' : 'door-open');
const vista = ref<'apertura' | 'semana'>('apertura');
const bloqueado = computed(() => guardando.value || cargando.value);
const hor = (d: string): Dia => horarios.value.find(x => x.dia === d) ?? horarios.value[0]!;
const hoy = (new Date().getDay() + 6) % 7;
const diaMovil = ref(hoy);
const diaSel = computed<Dia>(() => horarios.value[diaMovil.value] ?? horarios.value[0]!);
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

let seq = 0;
const nuevoUid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

watch(horarios, () => {
  abiertos.value = horarios.value.filter(x => x.abierto).length;
}, { deep: true, immediate: true });

/* ---------- Utilidades de tiempo ---------- */
const minutos = (hhmm: string) => {
  const [h = 0, m = 0] = String(hhmm || '').split(':').map(Number);
  return h * 60 + m;
};
const duracion = (d: Dia) => minutos(d.cierre) - minutos(d.apertura);
const durTxt = (total: number) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};
const textoDuracion = (d: Dia) => (duracion(d) <= 0 ? 'Revisar' : durTxt(duracion(d)));
const hm = (t: string) => {
  const [h = 0, m = 0] = String(t || '').split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`;
};
const suf = (t: string) => (Number(String(t || '0').split(':')[0]) < 12 ? 'AM' : 'PM');
const corto = (t: string) => {
  const [h = 0, m = 0] = String(t || '').split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
};
const fmt12 = (t: string) => `${hm(t)} ${suf(t) === 'AM' ? 'a.m.' : 'p.m.'}`;
const horasSemana = computed(() => {
  const total = horarios.value.reduce((sum, d) => (d.abierto && duracion(d) > 0 ? sum + duracion(d) : sum), 0);
  return Math.round((total / 60) * 10) / 10;
});

/* ---------- Atajos de apertura ---------- */
const abrirLunesViernes = () => { horarios.value.forEach((d, i) => { d.abierto = i < 5; }); };
const abrirTodos = () => { horarios.value.forEach(d => { d.abierto = true; }); };
const copiarATodos = () => {
  const base = horarios.value.find(d => d.abierto);
  if (!base) return;
  horarios.value.forEach(d => { if (d.abierto) { d.apertura = base.apertura; d.cierre = base.cierre; } });
};

/* =========================================================
   BLOQUES: derivados para el horario semanal
========================================================= */
const clave = (t: string) => t.trim().toLowerCase();
const bloquesDe = (d: string) => bloques.value.filter(b => b.dia === d).sort((a, b) => minutos(a.inicio) - minutos(b.inicio));
const cuenta = (i: number) => bloques.value.filter(b => b.dia === ids[i]).length;

const leyenda = computed(() => {
  const mapa = new Map<string, { key: string; titulo: string; color: string; count: number }>();
  for (const b of bloques.value) {
    const k = clave(b.titulo);
    const item = mapa.get(k);
    if (item) item.count++;
    else mapa.set(k, { key: k, titulo: b.titulo, color: b.color, count: 1 });
  }
  return [...mapa.values()].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
});

/* Una fila por cada rango de horas distinto; se agrupan en Mañana / Tarde y noche */
const secciones = computed(() => {
  const filas = new Map<string, { key: string; inicio: string; fin: string; porDia: Record<string, Bloque | undefined> }>();
  for (const b of bloques.value) {
    const key = `${b.inicio}|${b.fin}`;
    if (!filas.has(key)) filas.set(key, { key, inicio: b.inicio, fin: b.fin, porDia: {} });
    filas.get(key)!.porDia[b.dia] = b;
  }
  const ordenadas = [...filas.values()].sort((a, b) => minutos(a.inicio) - minutos(b.inicio) || minutos(a.fin) - minutos(b.fin));
  const manana = ordenadas.filter(f => minutos(f.inicio) < 12 * 60);
  const tarde = ordenadas.filter(f => minutos(f.inicio) >= 12 * 60);
  return [
    ...(manana.length ? [{ id: 'm', titulo: 'MAÑANA', filas: manana }] : []),
    ...(tarde.length ? [{ id: 't', titulo: 'TARDE Y NOCHE', filas: tarde }] : [])
  ];
});

/* =========================================================
   DIÁLOGO DE BLOQUE
========================================================= */
type Rango = { on: boolean; inicio: string; fin: string };
const ultimoRango = ref({ inicio: '07:00', fin: '08:00' });
const SIN_RANGO: Rango = { on: false, inicio: '07:00', fin: '08:00' };
const dlg = reactive({
  abierto: false,
  edit: null as string | null,
  titulo: '',
  color: COLOR_BASE as string,
  dias: {} as Record<string, Rango>,
  error: '',
  confirmar: false
});

const siguienteColor = () => {
  const usados = new Set(leyenda.value.map(l => l.color.toLowerCase()));
  return PALETA.find(c => !usados.has(c)) ?? PALETA[leyenda.value.length % PALETA.length] ?? COLOR_BASE;
};

const abrirDlg = (opts: { titulo?: string; dia?: string; inicio?: string; fin?: string } = {}) => {
  dlg.error = '';
  dlg.confirmar = false;
  const base = { inicio: opts.inicio || ultimoRango.value.inicio, fin: opts.fin || ultimoRango.value.fin };
  const nuevo: Record<string, Rango> = {};
  ids.forEach(d => { nuevo[d] = { on: false, ...base }; });

  if (opts.titulo) {
    const existentes = bloques.value.filter(b => clave(b.titulo) === clave(opts.titulo!));
    dlg.edit = clave(opts.titulo);
    dlg.titulo = existentes[0]?.titulo || opts.titulo;
    dlg.color = existentes[0]?.color ?? siguienteColor();
    existentes.forEach(b => { nuevo[b.dia] = { on: true, inicio: b.inicio, fin: b.fin }; });
  } else {
    dlg.edit = null;
    dlg.titulo = '';
    dlg.color = siguienteColor();
    const objetivo = opts.dia ? nuevo[opts.dia] : undefined;
    if (objetivo) objetivo.on = true;
  }
  dlg.dias = nuevo;
  dlg.abierto = true;
};
const cerrarDlg = () => { dlg.abierto = false; dlg.confirmar = false; };

/* Si el título ya existe, hereda su color para que la leyenda sea coherente */
const alEscribirTitulo = () => {
  if (dlg.edit) return;
  const existente = leyenda.value.find(l => l.key === clave(dlg.titulo));
  if (existente) dlg.color = existente.color;
};
const seleccionados = computed(() => ids.filter(d => dlg.dias[d]?.on));
const alternarDia = (d: string) => {
  const r = dlg.dias[d];
  if (!r) return;
  r.on = !r.on;
  if (r.on) {
    const otro = seleccionados.value.find(x => x !== d);
    const ref0 = otro ? dlg.dias[otro] : undefined;
    if (ref0 && !dlg.edit) { r.inicio = ref0.inicio; r.fin = ref0.fin; }
  }
};
const mismasHoras = () => {
  const primero = seleccionados.value[0];
  if (!primero) return;
  const { inicio, fin } = rg(primero);
  seleccionados.value.forEach(d => { const r = dlg.dias[d]; if (r) { r.inicio = inicio; r.fin = fin; } });
};
const rg = (d: string): Rango => dlg.dias[d] ?? SIN_RANGO;
const rangoMin = (r: Rango) => minutos(r.fin) - minutos(r.inicio);

const guardarDlg = () => {
  dlg.error = '';
  const titulo = dlg.titulo.trim();
  if (!titulo) return void (dlg.error = 'Escribe un título para el bloque.');
  if (titulo.length > 60) return void (dlg.error = 'El título no puede pasar de 60 caracteres.');
  if (!COLOR_RE.test(dlg.color)) return void (dlg.error = 'Elige un color válido.');
  if (!seleccionados.value.length) return void (dlg.error = 'Elige al menos un día.');

  const candidatos: Bloque[] = [];
  for (const d of seleccionados.value) {
    const r = rg(d);
    const nombre = nombreDia(d);
    if (!HORA_RE.test(r.inicio) || !HORA_RE.test(r.fin)) return void (dlg.error = `Revisa las horas del ${nombre}.`);
    if (rangoMin(r) <= 0) return void (dlg.error = `El ${nombre}: la hora de fin debe ser posterior a la de inicio.`);
    candidatos.push({ uid: nuevoUid(), dia: d, titulo, color: dlg.color, inicio: r.inicio, fin: r.fin });
  }

  const claveNueva = clave(titulo);
  const claveEdit = dlg.edit;
  /* Los bloques de la misma clase (título) que se está editando se reemplazan por completo */
  const otros = claveEdit
    ? bloques.value.filter(b => clave(b.titulo) !== claveEdit)
    : bloques.value.slice();

  /* No se pueden empalmar bloques el mismo día */
  for (const c of candidatos) {
    const choque = otros.find(o => o.dia === c.dia && minutos(c.inicio) < minutos(o.fin) && minutos(o.inicio) < minutos(c.fin));
    if (choque) {
      return void (dlg.error = `Se empalma con «${choque.titulo}» el ${dias[ids.indexOf(c.dia)]} (${fmt12(choque.inicio)} – ${fmt12(choque.fin)}).`);
    }
  }

  /* Misma clase = mismo color */
  const recoloreados = otros.map(o => (clave(o.titulo) === claveNueva ? { ...o, color: dlg.color, titulo } : o));

  /* Si el día estaba cerrado (o el bloque queda fuera), se ajusta la apertura */
  let ajustes = 0;
  for (const c of candidatos) {
    const h = hor(c.dia);
    if (!h.abierto) { h.abierto = true; h.apertura = c.inicio; h.cierre = c.fin; ajustes++; }
    else {
      if (minutos(c.inicio) < minutos(h.apertura)) { h.apertura = c.inicio; ajustes++; }
      if (minutos(c.fin) > minutos(h.cierre)) { h.cierre = c.fin; ajustes++; }
    }
  }

  bloques.value = [...recoloreados, ...candidatos];
  const primero = candidatos[0];
  if (primero) ultimoRango.value = { inicio: primero.inicio, fin: primero.fin };
  aviso.value = `Bloque «${titulo}» ${claveEdit ? 'actualizado' : 'agregado'}${ajustes ? ' y se ajustó la apertura de los días necesarios' : ''}. Recuerda pulsar «Guardar horario».`;
  exito.value = '';
  cerrarDlg();
};

const eliminarDlg = () => {
  if (!dlg.edit) return;
  if (!dlg.confirmar) { dlg.confirmar = true; return; }
  const k = dlg.edit;
  bloques.value = bloques.value.filter(b => clave(b.titulo) !== k);
  aviso.value = `Se eliminó «${dlg.titulo}». Recuerda pulsar «Guardar horario».`;
  exito.value = '';
  cerrarDlg();
};

/* =========================================================
   API
========================================================= */
const base = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const getSede = () => {
  for (const st of [sessionStorage, localStorage])
    for (const key of ['selected_sede_id', 'sede_id', 'ID_Sede', 'id_sede', 'selectedSede', 'selectedSedeId', 'sedeSeleccionada', 'gym_sede_id']) {
      const raw = st.getItem(key);
      if (!raw) continue;
      try {
        const v = JSON.parse(raw);
        const n = Number(v && typeof v === 'object' ? (v.ID_Sede ?? v.sede_id ?? v.id ?? v.value) : v);
        if (Number.isInteger(n) && n > 0) return n;
      } catch {
        const n = Number(raw);
        if (Number.isInteger(n) && n > 0) return n;
      }
    }
  return 1;
};
const getToken = () => {
  for (const st of [sessionStorage, localStorage]) {
    for (const k of ['auth_token', 'token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken']) {
      const v = st.getItem(k);
      if (v) return v.replace(/^Bearer\s+/i, '');
    }
    for (const k of ['auth', 'user', 'session', 'gymAccount', 'gym_account'])
      try {
        const v = JSON.parse(st.getItem(k) || 'null');
        const token = v?.token || v?.access_token || v?.accessToken;
        if (token) return String(token).replace(/^Bearer\s+/i, '');
      } catch { /* dato no JSON */ }
  }
  return '';
};
const request = async (method: 'GET' | 'PUT', body?: object) => {
  const token = getToken();
  if (!token) throw new Error('Inicia sesión nuevamente.');
  let r: Response;
  try {
    r = await fetch(`${base}/api/gym/horario-funcionamiento?sede_id=${sede.value}`, {
      method,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify({ ...body, sede_id: sede.value }) } : {})
    });
  } catch {
    throw new Error('No se pudo conectar con Railway.');
  }
  const d = await r.json().catch(() => null);
  if (!r.ok) {
    const validation = d?.errors ? Object.values(d.errors).flat().join(' ') : '';
    throw new Error(validation || d?.message || `Error HTTP ${r.status}`);
  }
  return d;
};

let solicitud = 0;
const cargar = async () => {
  const id = ++solicitud;
  sede.value = getSede();
  cargando.value = true;
  error.value = '';
  exito.value = '';
  aviso.value = '';
  try {
    const d = await request('GET');
    if (id !== solicitud) return;
    const recibidos = Array.isArray(d.horarios) ? d.horarios : [];
    horarios.value = nuevos().map(x => {
      const found = recibidos.find((o: Dia) => o.dia === x.dia);
      return found
        ? { dia: x.dia, abierto: !!found.abierto, apertura: String(found.apertura || x.apertura).slice(0, 5), cierre: String(found.cierre || x.cierre).slice(0, 5) }
        : x;
    });
    excepciones.value = Array.isArray(d.excepciones) ? d.excepciones : [];
    estadoActual.value = d.estado || null;
    soportaBloques.value = Array.isArray(d.bloques);
    bloques.value = (Array.isArray(d.bloques) ? d.bloques : [])
      .map((b: any): Bloque => ({
        uid: nuevoUid(),
        dia: String(b.dia),
        titulo: String(b.titulo || '').trim(),
        color: COLOR_RE.test(String(b.color)) ? String(b.color) : COLOR_BASE,
        inicio: String(b.inicio || '').slice(0, 5),
        fin: String(b.fin || '').slice(0, 5)
      }))
      .filter((b: Bloque) => ids.includes(b.dia) && b.titulo && HORA_RE.test(b.inicio) && HORA_RE.test(b.fin));
    if (bloques.value.length) vista.value = 'semana';
  } catch (e: any) {
    if (id === solicitud) error.value = e?.message || 'Error al consultar los horarios.';
  } finally {
    if (id === solicitud) cargando.value = false;
  }
};

const guardar = async () => {
  if (guardando.value || cargando.value) return;
  error.value = '';
  exito.value = '';
  for (const h of horarios.value) {
    if (h.abierto && (!HORA_RE.test(h.apertura) || !HORA_RE.test(h.cierre) || h.apertura >= h.cierre)) {
      error.value = `Revisa las horas de ${dias[ids.indexOf(h.dia)]}. El cierre debe ser posterior a la apertura.`;
      vista.value = 'apertura';
      return;
    }
  }
  for (const b of bloques.value) {
    const h = hor(b.dia);
    if (!h.abierto || b.inicio < h.apertura || b.fin > h.cierre) {
      error.value = `«${b.titulo}» (${dias[ids.indexOf(b.dia)]}, ${fmt12(b.inicio)} – ${fmt12(b.fin)}) queda fuera del horario de apertura de ese día. Ajusta la apertura o el bloque.`;
      return;
    }
  }
  guardando.value = true;
  try {
    const payload = {
      horarios: horarios.value,
      bloques: bloques.value.map(({ dia, titulo, color, inicio, fin }) => ({ dia, titulo, color, inicio, fin }))
    };
    await request('PUT', payload);
    aviso.value = '';
    exito.value = 'El horario del gimnasio se guardó correctamente.';
    emit('saved', { horarios: horarios.value, bloques: bloques.value });
    window.dispatchEvent(new CustomEvent('factorfit:gym-hours-updated', { detail: { sede_id: sede.value } }));
  } catch (e: any) {
    error.value = e?.message || 'No se pudo guardar.';
  } finally {
    guardando.value = false;
  }
};

const requestExcepcion = async (method: 'PUT' | 'DELETE', extra = '', body?: object) => {
  const token = getToken();
  if (!token) throw new Error('Sesión vencida.');
  const r = await fetch(`${base}/api/gym/horario-excepciones${extra}?sede_id=${sede.value}`, {
    method,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify({ ...body, sede_id: sede.value }) } : {})
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.errors ? Object.values(d.errors).flat().join(' ') : d?.message || `Error HTTP ${r.status}`);
  return d;
};

const guardarExcepcion = async () => {
  if (guardandoExcepcion.value || bloqueado.value) return;
  error.value = '';
  exito.value = '';
  if (exForm.tipo === 'especial' && exForm.apertura >= exForm.cierre) {
    error.value = 'La hora de cierre debe ser posterior a la apertura.';
    return;
  }
  guardandoExcepcion.value = true;
  try {
    await requestExcepcion('PUT', '', exForm);
    exito.value = 'Fecha especial guardada correctamente.';
    await cargar();
    exito.value = 'Fecha especial guardada correctamente.';
    emit('saved', { excepcion: true });
    window.dispatchEvent(new CustomEvent('factorfit:gym-hours-updated', { detail: { sede_id: sede.value } }));
  } catch (e: any) {
    error.value = e.message || 'No se pudo guardar.';
  } finally {
    guardandoExcepcion.value = false;
  }
};

const eliminarExcepcion = async (fecha: string) => {
  if (guardandoExcepcion.value || bloqueado.value) return;
  guardandoExcepcion.value = true;
  error.value = '';
  try {
    await requestExcepcion('DELETE', `/${encodeURIComponent(fecha)}`);
    await cargar();
    exito.value = 'Fecha especial eliminada.';
    window.dispatchEvent(new CustomEvent('factorfit:gym-hours-updated', { detail: { sede_id: sede.value } }));
  } catch (e: any) {
    error.value = e.message || 'No se pudo eliminar.';
  } finally {
    guardandoExcepcion.value = false;
  }
};

const cambioSede = () => { cerrarDlg(); void cargar(); };
const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape' && dlg.abierto) { e.stopPropagation(); cerrarDlg(); } };
onMounted(() => {
  window.addEventListener('factorfit:branch-changed', cambioSede);
  window.addEventListener('keydown', alTeclear, true);
  void cargar();
});
onUnmounted(() => {
  window.removeEventListener('factorfit:branch-changed', cambioSede);
  window.removeEventListener('keydown', alTeclear, true);
  solicitud++;
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

/* =========================================================
   BASE
========================================================= */
.gh-overlay {
  --hl: var(--color-highlight, #ffa971);
  --card: var(--bg-cards, #1b1b2b);
  --text: var(--color-texto-general, #f5f5f4);
  --title: var(--color-titulos, #fff);
  --btn: var(--color-botones, #e34d78);
  --btn-text: var(--color-texto-botones, #fff);
  --muted: color-mix(in srgb, var(--text) 66%, transparent);
  --muted-2: color-mix(in srgb, var(--text) 44%, transparent);
  --line: color-mix(in srgb, var(--text) 9%, transparent);
  --line-2: color-mix(in srgb, var(--text) 16%, transparent);
  --field: color-mix(in srgb, var(--card) 72%, black);
  --soft: color-mix(in srgb, var(--text) 4%, transparent);
  --grid-bg: color-mix(in srgb, var(--card) 95%, var(--text));
  --hl-soft: color-mix(in srgb, var(--hl) 13%, transparent);
  --hl-line: color-mix(in srgb, var(--hl) 42%, transparent);
  --ok: #34d399;
  --bad: #f87171;
  --r: 14px;

  position: fixed; inset: 0; z-index: 160; padding: 20px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text); font-family: 'Inter', system-ui, sans-serif;
  background: rgba(4, 4, 10, 0.72); backdrop-filter: blur(6px);
  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;
}
.gh-overlay *, .gh-overlay *::before, .gh-overlay *::after { box-sizing: border-box; }
.ico { width: 1.15em; height: 1.15em; flex: none; display: block; }
button { font-family: inherit; }
button:focus-visible, .gh-swatch:focus-within, .gh-switch input:focus-visible + .gh-track { outline: 2px solid var(--hl); outline-offset: 2px; }

.gh-panel {
  position: relative; width: min(1080px, 100%); max-height: min(94vh, 980px); display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--line-2); border-radius: 24px; background: var(--card);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
}

/* ---------- Header ---------- */
.gh-head {
  flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 28px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, color-mix(in srgb, var(--hl) 7%, transparent), transparent);
}
.gh-title { min-width: 0; display: flex; align-items: center; gap: 16px; }
.gh-symbol {
  width: 52px; height: 52px; flex: none; display: grid; place-items: center; color: var(--hl); font-size: 1.45rem;
  border: 1px solid var(--hl-line); border-radius: 16px; background: var(--hl-soft);
  box-shadow: 0 10px 28px -14px var(--hl);
}
.gh-title-text { min-width: 0; }
.gh-head small { display: block; color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.4px; }
.gh-head h2 { margin: 3px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 600; line-height: 1.1; letter-spacing: 0.3px; }
.gh-head h2 span { color: var(--hl); }
.gh-head p { margin: 6px 0 0; color: var(--muted); font-size: 13px; line-height: 1.4; }
.gh-close {
  width: 42px; height: 42px; flex: none; display: grid; place-items: center; cursor: pointer; color: var(--muted); font-size: 1.05rem;
  border: 1px solid var(--line-2); border-radius: 12px; background: var(--soft); transition: all 0.18s ease;
}
.gh-close.sm { width: 38px; height: 38px; }
.gh-close:hover { color: var(--bad); border-color: rgba(248, 113, 113, 0.45); background: rgba(248, 113, 113, 0.1); }

/* ---------- Cuerpo ---------- */
.gh-body { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; padding: 22px 28px 26px; display: flex; flex-direction: column; gap: 18px; scrollbar-width: thin; scrollbar-color: var(--line-2) transparent; }
.gh-body > * { flex-shrink: 0; }

/* ---------- Resumen ---------- */
.gh-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.gh-stat { min-width: 0; display: flex; align-items: center; gap: 14px; padding: 15px 16px; border: 1px solid var(--line); border-radius: 16px; background: var(--soft); }
.gh-stat-icon { width: 44px; height: 44px; flex: none; display: grid; place-items: center; color: #8ab4ff; font-size: 1.2rem; border-radius: 13px; background: rgba(96, 165, 250, 0.13); }
.gh-stat-icon.ok { color: var(--ok); background: rgba(52, 211, 153, 0.13); }
.gh-stat-icon.warm { color: var(--hl); background: var(--hl-soft); }
.gh-stat > div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.gh-stat strong { overflow: hidden; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; line-height: 1.05; text-overflow: ellipsis; white-space: nowrap; }
.gh-stat strong em { color: var(--muted); font-family: 'Inter', sans-serif; font-size: 12px; font-style: normal; font-weight: 500; }
.gh-stat small { color: var(--muted-2); font-size: 10px; font-weight: 700; letter-spacing: 0.8px; }

/* ---------- Alertas ---------- */
.gh-alert { display: flex; align-items: flex-start; gap: 10px; margin: 0; padding: 12px 14px; font-size: 13px; line-height: 1.5; border: 1px solid; border-radius: 12px; }
.gh-alert .ico { margin-top: 2px; font-size: 1.05rem; }
.gh-alert.error { color: #ffa3a3; border-color: rgba(239, 68, 68, 0.32); background: rgba(239, 68, 68, 0.09); }
.gh-alert.success { color: #5eead4; border-color: rgba(16, 185, 129, 0.32); background: rgba(16, 185, 129, 0.09); }
.gh-alert.info { color: var(--muted); border-color: var(--hl-line); background: var(--hl-soft); }
.gh-alert.info .ico { color: var(--hl); }
.gh-alert.warn { color: #fcd34d; border-color: rgba(251, 191, 36, 0.32); background: rgba(251, 191, 36, 0.08); }

/* ---------- Toolbar ---------- */
.gh-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.gh-segmented { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border: 1px solid var(--line-2); border-radius: 15px; background: var(--field); }
.gh-thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 11px; background: var(--hl); box-shadow: 0 8px 20px -8px var(--hl); transform: translateX(calc(var(--i, 0) * 100%)); transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.gh-segmented button { position: relative; z-index: 1; min-width: 156px; height: 40px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; cursor: pointer; color: var(--muted); font: 700 13px 'Inter', sans-serif; white-space: nowrap; border: 0; border-radius: 11px; background: transparent; transition: color 0.2s ease; }
.gh-segmented button.active { color: #1a1208; }
.gh-segmented .ico { font-size: 1.05rem; }
.gh-presets { display: flex; flex-wrap: wrap; gap: 8px; }
.gh-chip { height: 40px; display: inline-flex; align-items: center; gap: 8px; padding: 0 15px; cursor: pointer; color: var(--muted); font: 600 13px 'Inter', sans-serif; white-space: nowrap; border: 1px solid var(--line-2); border-radius: 999px; background: transparent; transition: all 0.18s ease; }
.gh-chip:hover:not(:disabled) { color: var(--title); border-color: var(--hl-line); background: var(--hl-soft); }
.gh-chip:disabled { opacity: 0.45; cursor: not-allowed; }
.gh-chip .ico { color: var(--hl); }

/* =========================================================
   APERTURA
========================================================= */
.gh-list { display: grid; gap: 10px; }
.gh-day { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 18px; border: 1px solid var(--line); border-radius: 18px; background: var(--soft); transition: border-color 0.18s ease, background 0.18s ease; }
.gh-day:hover { border-color: var(--line-2); }
.gh-day.today { border-color: var(--hl-line); background: linear-gradient(90deg, var(--hl-soft), var(--soft) 60%); }
.gh-day.closed .gh-day-name strong { color: var(--muted); }
.gh-day-main { min-width: 0; flex: 1; display: flex; align-items: center; gap: 16px; }
.gh-day-name { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.gh-day-name strong { display: flex; align-items: center; gap: 9px; color: var(--title); font-size: 15.5px; font-weight: 700; }
.gh-today { padding: 3px 8px; color: var(--hl); font-size: 9px; font-weight: 800; letter-spacing: 0.8px; border-radius: 6px; background: var(--hl-soft); }
.gh-day-name small { display: flex; align-items: center; gap: 7px; color: var(--muted-2); font-size: 12px; font-weight: 500; letter-spacing: 0; }
.gh-day-name small.on { color: var(--ok); }
.gh-day-name small .ico { font-size: 0.95rem; }
.gh-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2); }

.gh-switch { position: relative; flex: none; cursor: pointer; }
.gh-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.gh-track { position: relative; display: block; width: 50px; height: 28px; border: 1px solid var(--line-2); border-radius: 999px; background: color-mix(in srgb, var(--text) 14%, transparent); transition: background 0.2s ease, border-color 0.2s ease; }
.gh-track::before { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.gh-switch input:checked + .gh-track { border-color: transparent; background: var(--btn); }
.gh-switch input:checked + .gh-track::before { transform: translateX(22px); }
.gh-switch input:disabled + .gh-track { opacity: 0.55; cursor: not-allowed; }

.gh-times { flex: none; display: flex; align-items: flex-end; gap: 10px; transition: opacity 0.2s ease; }
.gh-times.off { opacity: 0.4; }
.gh-time { display: flex; flex-direction: column; gap: 6px; color: var(--muted); font-size: 11px; font-weight: 600; letter-spacing: 0.2px; }
.gh-time-box { position: relative; display: flex; align-items: center; }
.gh-time-box .ico { position: absolute; left: 12px; z-index: 1; color: var(--hl); font-size: 1.1rem; pointer-events: none; }
.gh-time-box input { width: 172px; height: 44px; padding: 0 8px 0 38px; outline: none; color: var(--title); color-scheme: dark; font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 12px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-time-box input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-time-box input:disabled { cursor: not-allowed; }
.gh-arrow { align-self: flex-end; margin-bottom: 15px; color: var(--muted-2); font-size: 1rem; }
.gh-duration { align-self: flex-end; min-width: 86px; height: 44px; display: grid; place-items: center; padding: 0 12px; color: var(--ok); font-size: 12.5px; font-weight: 700; white-space: nowrap; border-radius: 12px; background: rgba(52, 211, 153, 0.1); }
.gh-duration.bad { color: var(--bad); background: rgba(239, 68, 68, 0.1); }
.gh-times.off .gh-duration { color: var(--muted-2); background: transparent; }

.gh-note { display: flex; align-items: flex-start; gap: 11px; padding: 14px 16px; color: var(--muted); font-size: 13px; line-height: 1.6; border: 1px solid var(--hl-line); border-radius: 14px; background: var(--hl-soft); }
.gh-note .ico { margin-top: 2px; color: var(--hl); font-size: 1.1rem; }
.gh-note b { color: var(--title); font-weight: 700; }

/* =========================================================
   HORARIO SEMANAL · cuadrícula (computadora)
========================================================= */
.gh-gridwrap { overflow-x: auto; padding: 16px; border: 1px solid var(--line-2); border-radius: 20px; background: var(--grid-bg); scrollbar-width: thin; scrollbar-color: var(--line-2) transparent; }
.gh-grid { min-width: 900px; display: grid; grid-template-columns: 100px repeat(7, minmax(0, 1fr)); gap: 8px; align-items: stretch; }
.gh-corner { display: flex; align-items: center; padding-left: 4px; color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.2px; }
.gh-dayhead { min-height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px; color: var(--muted); border: 1px solid var(--line-2); border-radius: 13px; background: color-mix(in srgb, var(--text) 5%, transparent); }
.gh-dayhead strong { font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.9px; }
.gh-dayhead small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.9px; opacity: 0.8; }
.gh-dayhead.today { color: #1a1208; border-color: transparent; background: linear-gradient(145deg, color-mix(in srgb, var(--hl) 90%, white), var(--hl)); box-shadow: 0 10px 24px -12px var(--hl); }

.gh-section { grid-column: 1 / -1; display: flex; align-items: center; gap: 9px; margin-top: 10px; padding: 0 4px; color: var(--muted-2); font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px; }
.gh-section::after { content: ''; flex: 1; height: 1px; background: var(--line-2); }
.gh-section .ico { color: var(--hl); font-size: 1.05rem; }

.gh-hour { position: sticky; left: 0; z-index: 2; display: flex; align-items: center; padding: 0 8px 0 4px; background: var(--grid-bg); }
.gh-hour span { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.gh-hour b { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 500; line-height: 1.1; white-space: nowrap; }
.gh-hour em { padding: 2px 6px; color: var(--muted); font-size: 8.5px; font-style: normal; font-weight: 800; letter-spacing: 0.6px; border-radius: 5px; background: color-mix(in srgb, var(--text) 10%, transparent); }
.gh-hour.open span { flex-direction: row; align-items: center; gap: 7px; color: var(--ok); font-size: 10px; font-weight: 800; letter-spacing: 1px; }
.gh-hour.open .ico { font-size: 1rem; }

.gh-slot { min-width: 0; display: flex; }
.gh-open-chip { width: 100%; min-height: 42px; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px; padding: 4px 6px; cursor: pointer; color: var(--ok); font: 700 11px 'Inter', sans-serif; white-space: nowrap; text-align: center; border: 1px solid rgba(52, 211, 153, 0.32); border-radius: 12px; background: rgba(52, 211, 153, 0.08); transition: filter 0.18s ease; }
.gh-open-chip:hover { filter: brightness(1.25); }
.gh-open-chip .ico { font-size: 0.95rem; }
.gh-open-chip.off { color: var(--muted-2); border-style: dashed; border-color: var(--line-2); background: transparent; font-weight: 600; }

.gh-block {
  --c: var(--hl);
  position: relative; width: 100%; min-height: 62px; display: flex; align-items: center; padding: 8px 10px 8px 16px; cursor: pointer; overflow: hidden;
  color: var(--title); text-align: left;
  border: 1px solid color-mix(in srgb, var(--c) 48%, transparent); border-radius: 14px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--c) 26%, var(--card)), color-mix(in srgb, var(--c) 10%, var(--card)));
  box-shadow: 0 10px 22px -14px color-mix(in srgb, var(--c) 90%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.07);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}
.gh-block::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; border-radius: 0 4px 4px 0; background: var(--c); box-shadow: 0 0 12px var(--c); }
.gh-block:hover { transform: translateY(-2px); border-color: var(--c); box-shadow: 0 16px 28px -14px color-mix(in srgb, var(--c) 100%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.12); }
.gh-block span { display: -webkit-box; overflow: hidden; font: 700 12.5px/1.25 'Inter', sans-serif; letter-spacing: 0.1px; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow-wrap: anywhere; }
.gh-block.static { width: auto; min-width: 200px; min-height: 56px; cursor: default; }
.gh-block.static:hover { transform: none; }

.gh-empty { width: 100%; min-height: 62px; display: grid; place-items: center; cursor: pointer; color: var(--muted-2); font-size: 1.05rem; border: 1px dashed var(--line); border-radius: 14px; background: transparent; opacity: 0.5; transition: all 0.16s ease; }
.gh-empty:hover, .gh-empty:focus-visible { color: var(--hl); border-color: var(--hl-line); background: var(--hl-soft); opacity: 1; }

.gh-emptybox { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px dashed var(--line-2); border-radius: 18px; background: var(--soft); }
.gh-emptybox-icon { width: 48px; height: 48px; flex: none; display: grid; place-items: center; color: var(--hl); font-size: 1.3rem; border-radius: 14px; background: var(--hl-soft); }
.gh-emptybox > div { min-width: 0; flex: 1; }
.gh-emptybox strong { color: var(--title); font-size: 14.5px; }
.gh-emptybox p { margin: 5px 0 0; color: var(--muted); font-size: 13px; line-height: 1.55; }

.gh-legend { display: flex; flex-wrap: wrap; gap: 8px; }
.gh-legend-item { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 8px 0 13px; cursor: pointer; color: var(--muted); font: 600 12.5px 'Inter', sans-serif; border: 1px solid var(--line-2); border-radius: 999px; background: transparent; transition: all 0.16s ease; }
.gh-legend-item:hover { color: var(--title); background: color-mix(in srgb, var(--text) 6%, transparent); }
.gh-legend-item i { width: 10px; height: 10px; border-radius: 50%; }
.gh-legend-item em { min-width: 22px; padding: 2px 7px; color: var(--muted); font-size: 11px; font-style: normal; text-align: center; border-radius: 999px; background: color-mix(in srgb, var(--text) 10%, transparent); }

/* =========================================================
   HORARIO SEMANAL · un día a la vez (móvil / tablet)
========================================================= */
.gh-weeklist { display: none; flex-direction: column; gap: 12px; }
.gh-daytabs { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.gh-daytab { position: relative; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; color: var(--muted); font: 700 12px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 14px; background: transparent; transition: all 0.16s ease; }
.gh-daytab.closed { opacity: 0.55; }
.gh-daytab.today:not(.active) { color: var(--hl); border-color: var(--hl-line); }
.gh-daytab.active { color: #1a1208; opacity: 1; border-color: transparent; background: var(--hl); box-shadow: 0 10px 22px -10px var(--hl); }
.gh-daytab-n { min-width: 18px; height: 16px; display: grid; place-items: center; padding: 0 5px; color: inherit; font-size: 10px; font-style: normal; font-weight: 800; border-radius: 999px; background: color-mix(in srgb, currentColor 16%, transparent); }

.gh-wd { display: flex; flex-direction: column; gap: 14px; padding: 16px; border: 1px solid var(--line-2); border-radius: 20px; background: var(--soft); }
.gh-wd.today { border-color: var(--hl-line); background: linear-gradient(180deg, var(--hl-soft), var(--soft) 55%); }
.gh-wd-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.gh-wd-name { min-width: 0; display: flex; align-items: center; gap: 9px; }
.gh-wd-name strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 21px; font-weight: 600; }
.gh-wd .gh-open-chip { width: auto; min-height: 32px; flex: none; padding: 4px 12px; font-size: 11.5px; border-radius: 999px; }

.gh-timeline { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gh-timeline li { display: grid; grid-template-columns: 58px minmax(0, 1fr); align-items: center; gap: 12px; }
.gh-tl-time { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; text-align: right; }
.gh-tl-time b { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 500; line-height: 1.1; }
.gh-tl-time small { color: var(--muted-2); font-size: 9.5px; font-weight: 800; letter-spacing: 0.6px; }
.gh-wd-block {
  --c: var(--hl);
  position: relative; width: 100%; min-width: 0; min-height: 58px; display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 10px 14px 10px 18px; cursor: pointer; overflow: hidden; color: var(--title); text-align: left;
  border: 1px solid color-mix(in srgb, var(--c) 48%, transparent); border-radius: 14px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--c) 26%, var(--card)), color-mix(in srgb, var(--c) 10%, var(--card)));
}
.gh-wd-block::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; border-radius: 0 4px 4px 0; background: var(--c); box-shadow: 0 0 12px var(--c); }
.gh-wd-title { overflow: hidden; font: 700 14.5px 'Inter', sans-serif; text-overflow: ellipsis; white-space: nowrap; }
.gh-wd-time { color: var(--muted); font: 500 12px 'Inter', sans-serif; white-space: nowrap; }
.gh-wd-empty { margin: 0; padding: 18px; color: var(--muted-2); font-size: 13px; text-align: center; border: 1px dashed var(--line-2); border-radius: 14px; }
.gh-wd-add { height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; color: var(--hl); font: 700 13px 'Inter', sans-serif; border: 1px dashed var(--hl-line); border-radius: 13px; background: transparent; transition: background 0.16s ease; }
.gh-wd-add:hover:not(:disabled) { background: var(--hl-soft); }
.gh-wd-add:disabled { opacity: 0.5; cursor: wait; }

/* =========================================================
   FESTIVOS Y CIERRES ESPECIALES
========================================================= */
.gh-exceptions { display: flex; flex-direction: column; gap: 18px; padding: 22px; border: 1px solid var(--line-2); border-radius: 20px; background: var(--soft); }
.gh-ex-head { display: flex; align-items: center; gap: 14px; }
.gh-ex-icon { width: 46px; height: 46px; flex: none; display: grid; place-items: center; color: var(--hl); font-size: 1.25rem; border: 1px solid var(--hl-line); border-radius: 14px; background: var(--hl-soft); }
.gh-ex-head h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; line-height: 1.15; }
.gh-ex-head p { margin: 4px 0 0; color: var(--muted); font-size: 13px; line-height: 1.5; }

.gh-ex-form { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 14px; padding-top: 18px; border-top: 1px solid var(--line); }
.gh-ex-field { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.gh-ex-field.f-fecha { grid-column: span 3; }
.gh-ex-field.f-tipo { grid-column: span 4; }
.gh-ex-field.f-motivo { grid-column: span 5; }
.gh-ex-field.f-hora { grid-column: span 3; }
.gh-ex-field > label { color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: 0.2px; }
.gh-ex-control { position: relative; display: flex; align-items: center; }
.gh-ex-control > .ico:first-child { position: absolute; left: 13px; z-index: 1; color: var(--hl); font-size: 1.1rem; pointer-events: none; }
.gh-ex-control input, .gh-ex-control select { width: 100%; min-width: 0; height: 48px; padding: 0 14px 0 42px; outline: none; color: var(--title); color-scheme: dark; font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 13px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-ex-control select { padding-right: 38px; cursor: pointer; appearance: none; -webkit-appearance: none; text-overflow: ellipsis; }
.gh-ex-control select option { background: #15171b; color: #f4f4f5; }
.gh-ex-control input::placeholder { color: var(--muted-2); }
.gh-ex-control input:focus, .gh-ex-control select:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-ex-control input:disabled, .gh-ex-control select:disabled { opacity: 0.6; cursor: not-allowed; }
.gh-ex-chev { position: absolute; right: 14px; color: var(--muted-2); font-size: 0.95rem; pointer-events: none; }
.gh-btn.gh-ex-submit { grid-column: 1 / -1; justify-self: end; min-width: 240px; }

.gh-ex-list { display: grid; gap: 10px; }
.gh-ex-row { --t: var(--hl); display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 15px; background: var(--soft); }
.gh-ex-row.cerrado { --t: var(--bad); }
.gh-ex-row.especial { --t: #facc15; }
.gh-ex-row.abierto { --t: var(--ok); }
.gh-ex-badge { width: 44px; height: 44px; display: grid; place-items: center; color: var(--t); font-size: 1.15rem; border-radius: 13px; background: color-mix(in srgb, var(--t) 14%, transparent); }
.gh-ex-info { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.gh-ex-title { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
.gh-ex-title strong { color: var(--title); font-size: 14px; font-weight: 700; text-transform: capitalize; }
.gh-ex-tag { padding: 3px 9px; color: var(--t); font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 999px; background: color-mix(in srgb, var(--t) 14%, transparent); }
.gh-ex-info small { color: var(--muted); font-size: 12.5px; line-height: 1.4; overflow-wrap: anywhere; }
.gh-ex-del { height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 14px; cursor: pointer; color: var(--bad); font: 700 12.5px 'Inter', sans-serif; border: 1px solid rgba(239, 68, 68, 0.36); border-radius: 11px; background: rgba(239, 68, 68, 0.08); transition: background 0.16s ease; }
.gh-ex-del:hover:not(:disabled) { background: rgba(239, 68, 68, 0.18); }
.gh-ex-del:disabled { opacity: 0.5; cursor: wait; }
.gh-ex-empty { margin: 0; padding: 16px; color: var(--muted-2); font-size: 13px; text-align: center; border: 1px dashed var(--line-2); border-radius: 13px; }

.gh-ex-state { display: flex; align-items: flex-start; gap: 11px; padding: 13px 15px; font-size: 13px; line-height: 1.55; border: 1px solid; border-radius: 13px; }
.gh-ex-state .ico { margin-top: 2px; font-size: 1.1rem; }
.gh-ex-state strong { font-weight: 800; }
.gh-ex-state.open { color: #5eead4; border-color: rgba(52, 211, 153, 0.32); background: rgba(52, 211, 153, 0.08); }
.gh-ex-state.closed { color: #fca5a5; border-color: rgba(239, 68, 68, 0.32); background: rgba(239, 68, 68, 0.08); }

/* =========================================================
   FOOTER Y BOTONES
========================================================= */
.gh-footer { flex: none; display: flex; justify-content: flex-end; gap: 10px; padding: 16px 28px 20px; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--card) 92%, black); }
.gh-btn { height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 24px; cursor: pointer; font: 700 14px 'Inter', sans-serif; white-space: nowrap; border-radius: 13px; transition: all 0.18s ease; }
.gh-btn .ico { font-size: 1.1rem; }
.gh-btn.sm { height: 42px; padding: 0 18px; font-size: 13px; }
.gh-btn.ghost { color: var(--text); border: 1px solid var(--line-2); background: transparent; }
.gh-btn.ghost:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
.gh-btn.primary { min-width: 160px; color: var(--btn-text); border: 0; background: var(--btn); box-shadow: 0 12px 26px -12px color-mix(in srgb, var(--btn) 80%, transparent); }
.gh-btn.primary.sm { min-width: 0; }
.gh-btn.primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.gh-btn.primary:active:not(:disabled) { transform: translateY(0) scale(0.985); }
.gh-btn.danger { color: var(--bad); border: 1px solid rgba(239, 68, 68, 0.36); background: rgba(239, 68, 68, 0.08); }
.gh-btn.danger:hover { background: rgba(239, 68, 68, 0.18); }
.gh-btn:disabled { opacity: 0.6; cursor: wait; }
.gh-spin { animation: gh-spin 0.8s linear infinite; }
@keyframes gh-spin { to { transform: rotate(360deg); } }

/* =========================================================
   DIÁLOGO DE BLOQUE
========================================================= */
.gh-dlg-overlay { position: absolute; inset: 0; z-index: 20; padding: 18px; display: flex; align-items: center; justify-content: center; background: rgba(6, 6, 12, 0.74); backdrop-filter: blur(4px); }
.gh-dlg { width: min(580px, 100%); max-height: 100%; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--line-2); border-radius: 22px; background: var(--card); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); }
.gh-dlg-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--line); }
.gh-dlg-head small { color: var(--hl); font-size: 10px; font-weight: 800; letter-spacing: 1.4px; }
.gh-dlg-head h3 { margin: 3px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; }
.gh-dlg-head h3 span { color: var(--hl); }
.gh-dlg-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; scrollbar-width: thin; }
.gh-dlg-foot { flex: none; display: flex; align-items: center; gap: 10px; padding: 14px 22px 18px; border-top: 1px solid var(--line); }
.gh-spacer { flex: 1; }

.gh-field { display: flex; flex-direction: column; gap: 9px; min-width: 0; }
.gh-field > label, .gh-field-top > label { color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: 0.2px; }
.gh-field-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.gh-link { display: inline-flex; align-items: center; gap: 7px; padding: 0; cursor: pointer; color: var(--hl); font: 600 12.5px 'Inter', sans-serif; border: 0; background: transparent; }
.gh-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.gh-hint { margin: 0; padding: 13px 14px; color: var(--muted-2); font-size: 13px; border: 1px dashed var(--line-2); border-radius: 13px; }

.gh-input { position: relative; display: flex; align-items: center; }
.gh-input .ico { position: absolute; left: 14px; color: var(--muted-2); font-size: 1.1rem; pointer-events: none; }
.gh-input input { width: 100%; height: 48px; padding: 0 14px 0 42px; outline: none; color: var(--title); font: 500 14.5px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 13px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-input input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-input input::placeholder { color: var(--muted-2); }

.gh-palette { display: flex; flex-wrap: wrap; gap: 10px; }
.gh-swatch { position: relative; width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer; color: #101018; font-size: 1.05rem; border: 2px solid transparent; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.gh-swatch .ico { opacity: 0; transform: scale(0.6); transition: all 0.15s ease; }
.gh-swatch:hover { transform: scale(1.1); }
.gh-swatch.on { box-shadow: 0 0 0 3px var(--card), 0 0 0 5px var(--c); }
.gh-swatch.on .ico { opacity: 1; transform: scale(1); }
.gh-swatch.custom { overflow: hidden; background: conic-gradient(from 0deg, #f87171, #facc15, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171); }
.gh-swatch.custom.on { background: var(--c); }
.gh-swatch.custom .ico { opacity: 1; transform: none; }
.gh-swatch.custom input { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; cursor: pointer; opacity: 0; }

.gh-daychips { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 7px; }
.gh-daychip { height: 44px; cursor: pointer; color: var(--muted); font: 700 12px 'Inter', sans-serif; letter-spacing: 0.4px; border: 1.5px solid var(--line-2); border-radius: 12px; background: transparent; transition: all 0.16s ease; }
.gh-daychip:hover { border-color: var(--hl-line); color: var(--title); }
.gh-daychip.on { color: #1a1208; border-color: transparent; background: var(--hl); box-shadow: 0 8px 18px -8px var(--hl); }

.gh-ranges { display: grid; gap: 8px; }
.gh-range { display: grid; grid-template-columns: 96px minmax(0, 1fr) 18px minmax(0, 1fr) 78px; align-items: center; gap: 8px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 13px; background: var(--soft); }
.gh-range strong { color: var(--title); font-size: 13px; font-weight: 700; }
.gh-range input { width: 100%; min-width: 0; height: 42px; padding: 0 8px; outline: none; color: var(--title); color-scheme: dark; font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 11px; background: var(--field); }
.gh-range input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-range > .ico { justify-self: center; color: var(--muted-2); font-size: 0.95rem; }
.gh-range-dur { color: var(--ok); font-size: 12px; font-weight: 700; text-align: right; white-space: nowrap; }
.gh-range-dur.bad { color: var(--bad); }

.gh-preview { display: flex; align-items: center; gap: 14px; padding: 13px 15px; border: 1px solid var(--line); border-radius: 15px; background: var(--soft); }
.gh-preview > span { color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.1px; }

.gh-pop-enter-active, .gh-pop-leave-active { transition: opacity 0.2s ease; }
.gh-pop-enter-active .gh-dlg, .gh-pop-leave-active .gh-dlg { transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease; }
.gh-pop-enter-from, .gh-pop-leave-to { opacity: 0; }
.gh-pop-enter-from .gh-dlg, .gh-pop-leave-to .gh-dlg { opacity: 0; transform: translateY(14px) scale(0.97); }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1000px) {
  .gh-ex-field.f-fecha { grid-column: span 4; }
  .gh-ex-field.f-tipo { grid-column: span 8; }
  .gh-ex-field.f-motivo { grid-column: 1 / -1; }
  .gh-ex-field.f-hora { grid-column: span 6; }
}

@media (max-width: 920px) {
  .gh-gridwrap { display: none; }
  .gh-weeklist { display: flex; }
}

@media (max-width: 860px) {
  .gh-day { flex-direction: column; align-items: stretch; gap: 14px; }
  .gh-day-main { width: 100%; }
  .gh-times { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; align-items: end; }
  .gh-time { min-width: 0; }
  .gh-time-box { width: 100%; min-width: 0; }
  .gh-time-box input { width: 100%; min-width: 0; font-size: 16px; }
  .gh-arrow, .gh-duration { display: none; }
}

@media (max-width: 620px) {
  .gh-overlay { padding: 0; align-items: flex-end; }
  .gh-panel { width: 100%; max-height: 94vh; max-height: 94dvh; border-radius: 24px 24px 0 0; border-bottom: 0; }
  .gh-panel::before { content: ''; position: absolute; top: 7px; left: 50%; z-index: 5; width: 42px; height: 4px; border-radius: 4px; background: var(--line-2); transform: translateX(-50%); }

  .gh-head { padding: 22px 16px 14px; gap: 10px; }
  .gh-title { gap: 12px; }
  .gh-symbol { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 13px; }
  .gh-head small { font-size: 9px; letter-spacing: 1.1px; }
  .gh-head h2 { font-size: 20px; }
  .gh-head p { margin-top: 4px; font-size: 12px; }
  .gh-close { width: 38px; height: 38px; }

  .gh-body { padding: 14px 14px 20px; gap: 14px; scrollbar-width: none; }
  .gh-body::-webkit-scrollbar, .gh-dlg-body::-webkit-scrollbar { display: none; }
  .gh-dlg-body { scrollbar-width: none; }

  .gh-stats { gap: 8px; }
  .gh-stat { flex-direction: column; align-items: flex-start; gap: 8px; padding: 12px; border-radius: 14px; }
  .gh-stat-icon { width: 32px; height: 32px; font-size: 1rem; border-radius: 10px; }
  .gh-stat strong { font-size: 20px; }
  .gh-stat strong em { display: none; }
  .gh-stat small { font-size: 8.5px; letter-spacing: 0.4px; line-height: 1.3; white-space: normal; }

  .gh-toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .gh-segmented { width: 100%; }
  .gh-segmented button { min-width: 0; height: 42px; padding: 0 6px; gap: 7px; font-size: 13px; }
  .gh-presets { flex-wrap: nowrap; margin: 0 -14px; padding: 0 14px 2px; overflow-x: auto; scrollbar-width: none; }
  .gh-presets::-webkit-scrollbar { display: none; }
  .gh-chip { flex: none; height: 40px; }
  .gh-toolbar > .gh-btn { width: 100%; }

  .gh-day { padding: 14px; border-radius: 16px; }
  .gh-day-name strong { font-size: 15px; }
  .gh-time-box .ico { left: 11px; }
  .gh-time-box input { height: 46px; padding: 0 8px 0 36px; }
  .gh-note { padding: 12px 13px; font-size: 12.5px; }

  .gh-daytab { height: 50px; font-size: 11.5px; border-radius: 12px; }
  .gh-wd { padding: 14px; border-radius: 18px; }
  .gh-wd-name strong { font-size: 19px; }
  .gh-timeline li { grid-template-columns: 52px minmax(0, 1fr); gap: 10px; }

  .gh-emptybox { flex-direction: column; align-items: flex-start; }
  .gh-emptybox .gh-btn { width: 100%; }

  .gh-exceptions { padding: 16px; gap: 14px; border-radius: 18px; }
  .gh-ex-head { align-items: flex-start; gap: 12px; }
  .gh-ex-icon { width: 40px; height: 40px; border-radius: 12px; }
  .gh-ex-head h3 { font-size: 18px; }
  .gh-ex-form { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .gh-ex-field.f-fecha, .gh-ex-field.f-tipo, .gh-ex-field.f-motivo, .gh-ex-field.f-hora { grid-column: 1 / -1; }
  .gh-ex-control input, .gh-ex-control select { height: 50px; font-size: 16px; }
  .gh-btn.gh-ex-submit { justify-self: stretch; width: 100%; min-width: 0; }
  .gh-ex-row { grid-template-columns: 44px minmax(0, 1fr); padding: 12px; }
  .gh-ex-del { grid-column: 1 / -1; width: 100%; height: 42px; }

  .gh-footer { gap: 8px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom, 0px)); }
  .gh-footer .gh-btn { flex: 1; height: 48px; min-width: 0; padding: 0 12px; font-size: 14px; }
  .gh-footer .gh-btn.ghost { flex: 0 0 34%; }

  /* Diálogo como hoja inferior */
  .gh-dlg-overlay { padding: 0; align-items: flex-end; }
  .gh-dlg { width: 100%; max-height: 92%; border-radius: 22px 22px 0 0; border-bottom: 0; }
  .gh-dlg-head { padding: 16px; }
  .gh-dlg-head h3 { font-size: 20px; }
  .gh-dlg-body { padding: 16px; gap: 16px; }
  .gh-dlg-foot { flex-wrap: wrap; gap: 8px; padding: 12px 16px calc(14px + env(safe-area-inset-bottom, 0px)); }
  .gh-dlg-foot .gh-spacer { display: none; }
  .gh-dlg-foot .gh-btn { flex: 1 1 0; min-width: 0; height: 48px; padding: 0 10px; font-size: 14px; }
  .gh-dlg-foot .gh-btn.danger { flex: 1 1 100%; order: 3; }

  .gh-input input { font-size: 16px; }
  .gh-daychips { gap: 5px; }
  .gh-daychip { height: 44px; font-size: 11px; letter-spacing: 0; border-radius: 10px; }
  .gh-palette { gap: 9px; }

  .gh-range { grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr); grid-template-areas: 'name name dur' 'ini arr fin'; row-gap: 8px; column-gap: 6px; padding: 11px; }
  .gh-range strong { grid-area: name; }
  .gh-range > input:nth-of-type(1) { grid-area: ini; }
  .gh-range > .ico { grid-area: arr; }
  .gh-range > input:nth-of-type(2) { grid-area: fin; }
  .gh-range-dur { grid-area: dur; align-self: center; }
  .gh-range input { height: 46px; font-size: 16px; }

  .gh-preview { flex-direction: column; align-items: stretch; gap: 8px; }
  .gh-block.static { width: 100%; min-width: 0; }
}

@media (max-width: 380px) {
  .gh-daytab { font-size: 10.5px; }
  .gh-stat small { font-size: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>