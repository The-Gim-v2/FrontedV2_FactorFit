<template>
  <div class="gh-overlay" @click.self="emit('close')">
    <section class="gh-panel" role="dialog" aria-modal="true" aria-labelledby="gh-title">
      <!-- ================= HEADER ================= -->
      <header class="gh-head">
        <div class="gh-title">
          <span class="gh-symbol"><i class="bi bi-clock-history"></i></span>
          <div>
            <small>CONFIGURACIÓN DEL GIMNASIO</small>
            <h2 id="gh-title">HORARIOS <span>DEL GIMNASIO</span></h2>
            <p>Sede {{ sede }} · Define cuándo abres y, si quieres, las clases o bloques de cada día.</p>
          </div>
        </div>
        <button class="gh-close" type="button" aria-label="Cerrar" @click="emit('close')"><i class="bi bi-x-lg"></i></button>
      </header>

      <div class="gh-body">
        <!-- ================= RESUMEN ================= -->
        <div class="gh-stats">
          <article class="gh-stat">
            <span class="gh-stat-icon ok"><i class="bi bi-door-open"></i></span>
            <div><strong>{{ abiertos }} <em>de 7</em></strong><small>DÍAS ABIERTOS</small></div>
          </article>
          <article class="gh-stat">
            <span class="gh-stat-icon warm"><i class="bi bi-stopwatch"></i></span>
            <div><strong>{{ horasSemana }} h</strong><small>ABIERTO A LA SEMANA</small></div>
          </article>
          <article class="gh-stat">
            <span class="gh-stat-icon"><i class="bi bi-grid-3x3-gap"></i></span>
            <div><strong>{{ bloques.length }} <em>{{ leyenda.length }} {{ leyenda.length === 1 ? 'clase' : 'clases' }}</em></strong><small>BLOQUES EN LA SEMANA</small></div>
          </article>
        </div>

        <p v-if="error" class="gh-alert error" role="alert"><i class="bi bi-exclamation-triangle"></i><span>{{ error }}</span></p>
        <p v-if="exito" class="gh-alert success" role="status"><i class="bi bi-check-circle"></i><span>{{ exito }}</span></p>
        <p v-if="aviso && !exito" class="gh-alert info" role="status"><i class="bi bi-info-circle"></i><span>{{ aviso }}</span></p>
        <p v-if="!soportaBloques" class="gh-alert warn" role="status">
          <i class="bi bi-hdd-network"></i>
          <span>El servidor todavía no devuelve «bloques». Podrás armarlos aquí, pero no se conservarán hasta que el endpoint <b>horario-funcionamiento</b> los acepte.</span>
        </p>

        <!-- ================= TABS ================= -->
        <div class="gh-toolbar">
          <div class="gh-segmented" role="tablist" :style="{ '--i': vista === 'semana' ? 1 : 0 }">
            <span class="gh-thumb"></span>
            <button type="button" role="tab" :aria-selected="vista === 'apertura'" :class="{ active: vista === 'apertura' }" @click="vista = 'apertura'">
              <i class="bi bi-door-open"></i>Apertura
            </button>
            <button type="button" role="tab" :aria-selected="vista === 'semana'" :class="{ active: vista === 'semana' }" @click="vista = 'semana'">
              <i class="bi bi-calendar-week"></i>Horario semanal
            </button>
          </div>

          <div v-if="vista === 'apertura'" class="gh-presets">
            <button type="button" class="gh-chip" :disabled="bloqueado" @click="abrirLunesViernes"><i class="bi bi-briefcase"></i>Lun – Vie</button>
            <button type="button" class="gh-chip" :disabled="bloqueado" @click="abrirTodos"><i class="bi bi-calendar-check"></i>Todos los días</button>
            <button type="button" class="gh-chip" :disabled="bloqueado || !abiertos" @click="copiarATodos" title="Copia el horario del primer día abierto a los demás días abiertos">
              <i class="bi bi-copy"></i>Copiar a todos
            </button>
          </div>
          <button v-else type="button" class="gh-btn primary sm" :disabled="bloqueado" @click="abrirDlg()">
            <i class="bi bi-plus-lg"></i>Añadir bloque
          </button>
        </div>

        <!-- ============================================================
             TAB 1: APERTURA (simple: abierto de X a Y)
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
                    <i class="bi" :class="dia.abierto ? 'bi-circle-fill' : 'bi-moon-stars'"></i>
                    {{ dia.abierto ? 'Abierto al público' : 'Cerrado' }}
                  </small>
                </div>
              </div>

              <div class="gh-times" :class="{ off: !dia.abierto }">
                <label class="gh-time">
                  <span>Abre</span>
                  <div class="gh-time-box">
                    <i class="bi bi-sunrise"></i>
                    <input type="time" v-model="dia.apertura" :disabled="!dia.abierto || bloqueado" />
                  </div>
                </label>
                <i class="bi bi-arrow-right gh-arrow"></i>
                <label class="gh-time">
                  <span>Cierra</span>
                  <div class="gh-time-box">
                    <i class="bi bi-sunset"></i>
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
            <i class="bi bi-lightbulb"></i>
            <span>Con esto basta: por ejemplo <b>abierto de 6:00 a 11:00</b>. Si además quieres mostrar clases con nombre y color, ve a <b>Horario semanal</b>.</span>
          </div>
        </template>

        <!-- ============================================================
             TAB 2: HORARIO SEMANAL (bloques con título y color)
        ============================================================ -->
        <template v-else>
          <div class="gh-gridwrap">
            <div class="gh-grid">
              <!-- Cabecera de días -->
              <div class="gh-cell gh-corner">HORA</div>
              <div v-for="(d, i) in dias" :key="d" class="gh-dayhead" :class="{ today: i === hoy }">
                <strong>{{ d.toUpperCase() }}</strong>
                <small v-if="i === hoy">HOY</small>
              </div>

              <!-- Fila: apertura -->
              <div class="gh-cell gh-hour open"><span><i class="bi bi-door-open"></i>ABIERTO</span></div>
              <div v-for="(dia, i) in horarios" :key="'a-' + dia.dia" class="gh-slot">
                <button type="button" class="gh-open-chip" :class="{ off: !dia.abierto }" @click="vista = 'apertura'" title="Editar apertura">
                  <template v-if="dia.abierto">{{ corto(dia.apertura) }} – {{ corto(dia.cierre) }}</template>
                  <template v-else><i class="bi bi-moon-stars"></i>Cerrado</template>
                </button>
              </div>

              <!-- Secciones: Mañana / Tarde y noche -->
              <template v-for="sec in secciones" :key="sec.id">
                <div class="gh-section">{{ sec.titulo }}</div>
                <template v-for="fila in sec.filas" :key="fila.key">
                  <div class="gh-cell gh-hour">
                    <span>{{ hm(fila.inicio) }} – {{ hm(fila.fin) }}<em>{{ suf(fila.inicio) }}</em></span>
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
                    ><i class="bi bi-plus-lg"></i></button>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <!-- Vista móvil: lista por día (sin scroll lateral) -->
          <div class="gh-weeklist">
            <article v-for="(dia, i) in horarios" :key="'m-' + dia.dia" class="gh-wd" :class="{ today: i === hoy }">
              <header class="gh-wd-head">
                <div class="gh-wd-name">
                  <strong>{{ dias[i] }}</strong>
                  <span v-if="i === hoy" class="gh-today">HOY</span>
                </div>
                <button type="button" class="gh-open-chip" :class="{ off: !dia.abierto }" @click="vista = 'apertura'" title="Editar apertura">
                  <template v-if="dia.abierto"><i class="bi bi-door-open"></i>{{ corto(dia.apertura) }} – {{ corto(dia.cierre) }}</template>
                  <template v-else><i class="bi bi-moon-stars"></i>Cerrado</template>
                </button>
              </header>

              <div v-if="bloquesDe(dia.dia).length" class="gh-wd-blocks">
                <button
                  v-for="b in bloquesDe(dia.dia)"
                  :key="b.uid"
                  type="button"
                  class="gh-wd-block"
                  :style="{ '--c': b.color }"
                  @click="abrirDlg({ titulo: b.titulo, dia: b.dia })"
                >
                  <i class="gh-wd-dot"></i>
                  <span class="gh-wd-title">{{ b.titulo }}</span>
                  <span class="gh-wd-time">{{ fmt12(b.inicio) }} – {{ fmt12(b.fin) }}</span>
                </button>
              </div>
              <p v-else class="gh-wd-empty">Sin bloques este día</p>

              <button type="button" class="gh-wd-add" :disabled="bloqueado" @click="abrirDlg({ dia: dia.dia })">
                <i class="bi bi-plus-lg"></i>Añadir bloque
              </button>
            </article>
          </div>

          <!-- Estado vacío -->
          <div v-if="!bloques.length" class="gh-emptybox">
            <span class="gh-emptybox-icon"><i class="bi bi-grid-3x3-gap"></i></span>
            <div>
              <strong>Aún no hay clases ni bloques</strong>
              <p>Crea un bloque con nombre y color (por ejemplo «Zumba») y aplícalo a varios días con horas distintas. Si no lo necesitas, el horario de apertura ya es suficiente.</p>
            </div>
            <button type="button" class="gh-btn ghost sm" @click="abrirDlg()"><i class="bi bi-plus-lg"></i>Crear el primero</button>
          </div>

          <!-- Leyenda -->
          <div v-if="leyenda.length" class="gh-legend">
            <button v-for="l in leyenda" :key="l.key" type="button" class="gh-legend-item" @click="abrirDlg({ titulo: l.titulo })" :title="`Editar «${l.titulo}»`">
              <i :style="{ background: l.color }"></i>{{ l.titulo }}<em>{{ l.count }}</em>
            </button>
          </div>
        </template>
        <!-- CIERRES POR FESTIVOS Y HORARIOS ESPECIALES -->
        <section class="gh-exceptions">
          <header class="gh-ex-head">
            <span class="gh-ex-icon"><i class="bi bi-calendar-event"></i></span>
            <div>
              <h3>Festivos y cierres especiales</h3>
              <p>Tiene prioridad sobre la apertura semanal y se mostrará a los miembros de esta sede.</p>
            </div>
          </header>

          <form class="gh-ex-form" @submit.prevent="guardarExcepcion">
            <div class="gh-ex-field">
              <label for="gh-ex-fecha">Fecha</label>
              <div class="gh-ex-control">
                <i class="bi bi-calendar3"></i>
                <input id="gh-ex-fecha" v-model="exForm.fecha" type="date" required :disabled="bloqueado || guardandoExcepcion" />
              </div>
            </div>

            <div class="gh-ex-field">
              <label for="gh-ex-tipo">Tipo</label>
              <div class="gh-ex-control">
                <i class="bi bi-toggles"></i>
                <select id="gh-ex-tipo" v-model="exForm.tipo" :disabled="bloqueado || guardandoExcepcion">
                  <option value="cerrado">Cerrado por festivo o imprevisto</option>
                  <option value="especial">Horario especial</option>
                  <option value="abierto">Abierto todo el día (excepcional)</option>
                </select>
                <i class="bi bi-chevron-down gh-ex-chev"></i>
              </div>
            </div>

            <div class="gh-ex-field wide">
              <label for="gh-ex-motivo">Motivo</label>
              <div class="gh-ex-control">
                <i class="bi bi-chat-left-text"></i>
                <input id="gh-ex-motivo" v-model.trim="exForm.motivo" type="text" maxlength="200" placeholder="Ej. Día festivo, mantenimiento" required :disabled="bloqueado || guardandoExcepcion" />
              </div>
            </div>

            <template v-if="exForm.tipo === 'especial'">
              <div class="gh-ex-field">
                <label for="gh-ex-apertura">Apertura</label>
                <div class="gh-ex-control">
                  <i class="bi bi-sunrise"></i>
                  <input id="gh-ex-apertura" v-model="exForm.apertura" type="time" required :disabled="bloqueado || guardandoExcepcion" />
                </div>
              </div>
              <div class="gh-ex-field">
                <label for="gh-ex-cierre">Cierre</label>
                <div class="gh-ex-control">
                  <i class="bi bi-sunset"></i>
                  <input id="gh-ex-cierre" v-model="exForm.cierre" type="time" required :disabled="bloqueado || guardandoExcepcion" />
                </div>
              </div>
            </template>

            <button type="submit" class="gh-btn primary gh-ex-submit" :disabled="bloqueado || guardandoExcepcion">
              <i class="bi" :class="guardandoExcepcion ? 'bi-arrow-repeat gh-spin' : 'bi-plus-lg'"></i>
              {{ guardandoExcepcion ? 'Guardando...' : 'Guardar fecha especial' }}
            </button>
          </form>

          <div v-if="excepciones.length" class="gh-ex-list">
            <article v-for="x in excepciones" :key="x.fecha" class="gh-ex-row" :class="x.tipo">
              <span class="gh-ex-badge"><i class="bi" :class="exTipoIcono(x.tipo)"></i></span>
              <div class="gh-ex-info">
                <div class="gh-ex-title">
                  <strong>{{ exFechaTxt(x.fecha) }}</strong>
                  <span class="gh-ex-tag">{{ exTipoTxt(x.tipo) }}</span>
                </div>
                <small>{{ x.motivo }}<template v-if="x.tipo === 'especial'"> · {{ x.apertura }}–{{ x.cierre }}</template></small>
              </div>
              <button type="button" class="gh-ex-del" :disabled="bloqueado || guardandoExcepcion" @click="eliminarExcepcion(x.fecha)">
                <i class="bi bi-trash3"></i><span>Eliminar</span>
              </button>
            </article>
          </div>
          <p v-else class="gh-ex-empty">No hay fechas especiales programadas.</p>

          <div v-if="estadoActual" class="gh-ex-state" :class="estadoActual.abierto ? 'open' : 'closed'">
            <i class="bi" :class="estadoActual.abierto ? 'bi-door-open' : 'bi-door-closed'"></i>
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
          <i class="bi" :class="guardando ? 'bi-arrow-repeat gh-spin' : 'bi-check-lg'"></i>
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
              <button type="button" class="gh-close sm" aria-label="Cerrar" @click="cerrarDlg"><i class="bi bi-x-lg"></i></button>
            </header>

            <div class="gh-dlg-body">
              <!-- Título + color -->
              <div class="gh-field">
                <label for="gh-titulo">Título</label>
                <div class="gh-input">
                  <i class="bi bi-type"></i>
                  <input id="gh-titulo" v-model="dlg.titulo" list="gh-titulos" maxlength="60" placeholder="Ej. Zumba, Yoga, Funcional..." autocomplete="off" @input="alEscribirTitulo" />
                  <datalist id="gh-titulos"><option v-for="l in leyenda" :key="l.key" :value="l.titulo"></option></datalist>
                </div>
              </div>

              <div class="gh-field">
                <label>Color</label>
                <div class="gh-palette" role="radiogroup" aria-label="Color del bloque">
                  <button v-for="c in PALETA" :key="c" type="button" role="radio" :aria-checked="dlg.color === c" class="gh-swatch" :class="{ on: dlg.color === c }" :style="{ '--c': c }" :aria-label="c" @click="dlg.color = c">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <label class="gh-swatch custom" :class="{ on: !PALETA.includes(dlg.color) }" :style="{ '--c': dlg.color }" title="Otro color">
                    <i class="bi bi-eyedropper"></i>
                    <input type="color" v-model="dlg.color" />
                  </label>
                </div>
              </div>

              <!-- Días -->
              <div class="gh-field">
                <label>Días en que se repite</label>
                <div class="gh-daychips" role="group">
                  <button v-for="(d, i) in ids" :key="d" type="button" class="gh-daychip" :class="{ on: dlg.dias[d]?.on }" :aria-pressed="!!dlg.dias[d]?.on" @click="alternarDia(d)">
                    <span>{{ nombreDia(d).slice(0, 3).toUpperCase() }}</span>
                  </button>
                </div>
              </div>

              <!-- Horas por día -->
              <div class="gh-field">
                <div class="gh-field-top">
                  <label>Horas de cada día</label>
                  <button v-if="seleccionados.length > 1" type="button" class="gh-link" @click="mismasHoras"><i class="bi bi-copy"></i>Usar las mismas horas en todos</button>
                </div>
                <p v-if="!seleccionados.length" class="gh-hint">Elige al menos un día para definir sus horas.</p>
                <div v-else class="gh-ranges">
                  <div v-for="d in seleccionados" :key="d" class="gh-range">
                    <strong>{{ dias[ids.indexOf(d)] }}</strong>
                    <input type="time" v-model="rg(d).inicio" aria-label="Inicio" />
                    <i class="bi bi-arrow-right"></i>
                    <input type="time" v-model="rg(d).fin" aria-label="Fin" />
                    <span class="gh-range-dur" :class="{ bad: rangoMin(rg(d)) <= 0 }">{{ rangoMin(rg(d)) > 0 ? durTxt(rangoMin(rg(d))) : 'Revisar' }}</span>
                  </div>
                </div>
              </div>

              <!-- Vista previa -->
              <div class="gh-preview">
                <span>VISTA PREVIA</span>
                <div class="gh-block static" :style="{ '--c': dlg.color }"><span>{{ dlg.titulo.trim() || 'Título del bloque' }}</span></div>
              </div>

              <p v-if="dlg.error" class="gh-alert error" role="alert"><i class="bi bi-exclamation-triangle"></i><span>{{ dlg.error }}</span></p>
            </div>

            <footer class="gh-dlg-foot">
              <button v-if="dlg.edit" type="button" class="gh-btn danger" @click="eliminarDlg">
                <i class="bi bi-trash3"></i>{{ dlg.confirmar ? '¿Seguro? Eliminar' : 'Eliminar' }}
              </button>
              <span class="gh-spacer"></span>
              <button type="button" class="gh-btn ghost" @click="cerrarDlg">Cancelar</button>
              <button type="submit" class="gh-btn primary"><i class="bi bi-check-lg"></i>{{ dlg.edit ? 'Guardar cambios' : 'Añadir bloque' }}</button>
            </footer>
          </form>
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';

const emit = defineEmits(['close', 'saved']);

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
const excepciones=ref<any[]>([]);const estadoActual=ref<any>(null);const guardandoExcepcion=ref(false);const exForm=reactive({fecha:'',tipo:'cerrado',motivo:'',apertura:'09:00',cierre:'18:00'});
const exFechaTxt = (f: string) => {
  const [y, m, d] = String(f || '').slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(f || '');
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};
const exTipoTxt = (t: string) => (t === 'cerrado' ? 'Cerrado' : t === 'especial' ? 'Horario especial' : 'Abierto extra');
const exTipoIcono = (t: string) => (t === 'cerrado' ? 'bi-door-closed' : t === 'especial' ? 'bi-clock' : 'bi-door-open');
const vista = ref<'apertura' | 'semana'>('apertura');
const bloqueado = computed(() => guardando.value || cargando.value);
const hor = (d: string): Dia => horarios.value.find(x => x.dia === d) ?? horarios.value[0]!;
const hoy = (new Date().getDay() + 6) % 7;
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
const aHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
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
    excepciones.value=Array.isArray(d.excepciones)?d.excepciones:[];estadoActual.value=d.estado||null;
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
    window.dispatchEvent(new CustomEvent('factorfit:gym-hours-updated',{detail:{sede_id:sede.value}}));
  } catch (e: any) {
    error.value = e?.message || 'No se pudo guardar.';
  } finally {
    guardando.value = false;
  }
};

const guardarExcepcion=async()=>{if(guardandoExcepcion.value||bloqueado.value)return;error.value='';exito.value='';if(exForm.tipo==='especial'&&exForm.apertura>=exForm.cierre){error.value='La hora de cierre debe ser posterior a la apertura.';return;}guardandoExcepcion.value=true;try{await requestExcepcion('PUT','',exForm);exito.value='Fecha especial guardada correctamente.';await cargar();exito.value='Fecha especial guardada correctamente.';emit('saved',{excepcion:true});window.dispatchEvent(new CustomEvent('factorfit:gym-hours-updated',{detail:{sede_id:sede.value}}));}catch(e:any){error.value=e.message||'No se pudo guardar.';}finally{guardandoExcepcion.value=false;}};
const eliminarExcepcion=async(fecha:string)=>{if(guardandoExcepcion.value||bloqueado.value)return;guardandoExcepcion.value=true;error.value='';try{await requestExcepcion('DELETE',`/${encodeURIComponent(fecha)}`);await cargar();exito.value='Fecha especial eliminada.';window.dispatchEvent(new CustomEvent('factorfit:gym-hours-updated',{detail:{sede_id:sede.value}}));}catch(e:any){error.value=e.message||'No se pudo eliminar.';}finally{guardandoExcepcion.value=false;}};
const requestExcepcion=async(method:'PUT'|'DELETE',extra='',body?:object)=>{const token=getToken();if(!token)throw new Error('Sesión vencida.');const r=await fetch(`${base}/api/gym/horario-excepciones${extra}?sede_id=${sede.value}`,{method,headers:{Accept:'application/json',Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify({...body,sede_id:sede.value})}:{})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.errors?Object.values(d.errors).flat().join(' '):d?.message||`Error HTTP ${r.status}`);return d;};
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
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

* { box-sizing: border-box; }
i.bi { display: inline-block; line-height: 1; }

.gh-overlay {
  --hl: var(--color-highlight, #ffa971);
  --card: var(--bg-cards, #1b1b2b);
  --text: var(--color-texto-general, #f5f5f4);
  --title: var(--color-titulos, #fff);
  --btn: var(--color-botones, #e34d78);
  --btn-text: var(--color-texto-botones, #fff);
  --muted: color-mix(in srgb, var(--text) 62%, transparent);
  --muted-2: color-mix(in srgb, var(--text) 42%, transparent);
  --line: color-mix(in srgb, var(--text) 10%, transparent);
  --line-2: color-mix(in srgb, var(--text) 18%, transparent);
  --field: color-mix(in srgb, var(--card) 70%, black);
  --hl-soft: color-mix(in srgb, var(--hl) 13%, transparent);
  --hl-line: color-mix(in srgb, var(--hl) 42%, transparent);
  --ok: #34d399;

  position: fixed; inset: 0; z-index: 160; padding: 16px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text); font-family: 'Inter', system-ui, sans-serif;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
  -webkit-font-smoothing: antialiased;
}
.gh-panel {
  position: relative; width: min(1060px, 100%); max-height: 94vh; display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--line-2); border-radius: 22px; background: var(--card);
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.6);
}

/* ---------- Header ---------- */
.gh-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; border-bottom: 1px solid var(--line); }
.gh-title { min-width: 0; display: flex; align-items: center; gap: 15px; }
.gh-symbol { width: 50px; height: 50px; flex: none; display: grid; place-items: center; color: var(--hl); font-size: 1.35rem; border: 1px solid var(--hl-line); border-radius: 14px; background: var(--hl-soft); }
.gh-head small { display: block; color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.3px; }
.gh-head h2 { margin: 3px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 600; line-height: 1.1; }
.gh-head h2 span { color: var(--hl); }
.gh-head p { margin: 5px 0 0; color: var(--muted); font-size: 12.5px; }
.gh-close { width: 40px; height: 40px; flex: none; display: grid; place-items: center; cursor: pointer; color: var(--muted); font-size: 0.95rem; border: 1px solid var(--line-2); border-radius: 11px; background: color-mix(in srgb, var(--text) 4%, transparent); transition: all 0.18s ease; }
.gh-close.sm { width: 36px; height: 36px; }
.gh-close:hover { color: #f87171; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.09); }

/* ---------- Cuerpo ---------- */
.gh-body { flex: 1; min-height: 0; overflow-y: auto; padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: thin; }

.gh-body > * { flex-shrink: 0; }
.gh-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.gh-stat { min-width: 0; display: flex; align-items: center; gap: 12px; padding: 13px 14px; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 3%, transparent); }
.gh-stat-icon { width: 40px; height: 40px; flex: none; display: grid; place-items: center; color: #8ab4ff; font-size: 1.05rem; border-radius: 11px; background: rgba(96, 165, 250, 0.12); }
.gh-stat-icon.ok { color: var(--ok); background: rgba(52, 211, 153, 0.12); }
.gh-stat-icon.warm { color: var(--hl); background: var(--hl-soft); }
.gh-stat > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.gh-stat strong { overflow: hidden; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 19px; font-weight: 600; line-height: 1.1; text-overflow: ellipsis; white-space: nowrap; }
.gh-stat strong em { color: var(--muted); font-family: 'Inter', sans-serif; font-size: 12px; font-style: normal; font-weight: 500; }
.gh-stat small { color: var(--muted-2); font-size: 10px; font-weight: 700; letter-spacing: 0.7px; }

.gh-alert { display: flex; align-items: flex-start; gap: 9px; margin: 0; padding: 11px 13px; font-size: 12.5px; line-height: 1.45; border-radius: 11px; }
.gh-alert i { flex: none; margin-top: 2px; }
.gh-alert.error { color: #ff9a9a; border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.09); }
.gh-alert.success { color: #5eead4; border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.09); }
.gh-alert.info { color: var(--muted); border: 1px solid var(--hl-line); background: var(--hl-soft); }
.gh-alert.info i { color: var(--hl); }
.gh-alert.warn { color: #fcd34d; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.08); }

/* ---------- Toolbar ---------- */
.gh-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.gh-segmented { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border: 1px solid var(--line-2); border-radius: 14px; background: var(--field); }
.gh-thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 10px; background: var(--hl); box-shadow: 0 6px 16px -6px var(--hl-line); transform: translateX(calc(var(--i, 0) * 100%)); transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1); }
.gh-segmented button { position: relative; z-index: 1; min-width: 150px; height: 38px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; cursor: pointer; color: var(--muted); font: 700 13px 'Inter', sans-serif; white-space: nowrap; border: 0; border-radius: 10px; background: transparent; transition: color 0.2s ease; }
.gh-segmented button.active { color: #1a1208; }
.gh-presets { display: flex; flex-wrap: wrap; gap: 8px; }
.gh-chip { height: 38px; display: inline-flex; align-items: center; gap: 7px; padding: 0 13px; cursor: pointer; color: var(--muted); font: 600 12.5px 'Inter', sans-serif; border: 1px solid var(--line-2); border-radius: 999px; background: transparent; transition: all 0.18s ease; }
.gh-chip:hover:not(:disabled) { color: var(--title); border-color: var(--hl-line); background: var(--hl-soft); }
.gh-chip:disabled { opacity: 0.45; cursor: not-allowed; }
.gh-chip i { color: var(--hl); font-size: 0.9rem; }

/* ---------- Apertura ---------- */
.gh-list { display: grid; gap: 10px; }
.gh-day { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 16px; border: 1px solid var(--line-2); border-radius: 16px; background: color-mix(in srgb, var(--text) 3%, transparent); transition: border-color 0.18s ease, background 0.18s ease; }
.gh-day.today { border-color: var(--hl-line); background: linear-gradient(90deg, var(--hl-soft), color-mix(in srgb, var(--text) 3%, transparent) 55%); }
.gh-day-main { min-width: 0; flex: 1; display: flex; align-items: center; gap: 14px; }
.gh-day-name { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.gh-day-name strong { display: flex; align-items: center; gap: 8px; color: var(--title); font-size: 15px; font-weight: 700; }
.gh-today { padding: 2px 7px; color: var(--hl); font-size: 9px; font-weight: 800; letter-spacing: 0.6px; border-radius: 5px; background: var(--hl-soft); }
.gh-day-name small { display: flex; align-items: center; gap: 6px; color: var(--muted-2); font-size: 11.5px; }
.gh-day-name small.on { color: var(--ok); }
.gh-day-name small i { font-size: 0.55rem; }
.gh-day-name small i.bi-moon-stars { font-size: 0.8rem; }

.gh-switch { position: relative; flex: none; cursor: pointer; }
.gh-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.gh-track { position: relative; display: block; width: 46px; height: 26px; border: 1px solid var(--line-2); border-radius: 999px; background: color-mix(in srgb, var(--text) 14%, transparent); transition: background 0.2s ease, border-color 0.2s ease; }
.gh-track::before { content: ''; position: absolute; top: 2.5px; left: 3px; width: 19px; height: 19px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); transition: transform 0.2s ease; }
.gh-switch input:checked + .gh-track { border-color: transparent; background: var(--btn); }
.gh-switch input:checked + .gh-track::before { transform: translateX(20px); }
.gh-switch input:focus-visible + .gh-track { outline: 2px solid var(--hl); outline-offset: 2px; }
.gh-switch input:disabled + .gh-track { opacity: 0.55; cursor: not-allowed; }

.gh-times { flex: none; display: flex; align-items: flex-end; gap: 10px; transition: opacity 0.2s ease; }
.gh-times.off { opacity: 0.4; }
.gh-time { display: flex; flex-direction: column; gap: 5px; color: var(--muted); font-size: 11px; font-weight: 600; }
.gh-time-box { position: relative; display: flex; align-items: center; }
.gh-time-box i { position: absolute; left: 11px; z-index: 1; color: var(--hl); font-size: 0.95rem; pointer-events: none; }
.gh-time-box input { width: 168px; height: 42px; padding: 0 8px 0 34px; outline: none; color: var(--title); color-scheme: dark; font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 11px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-time-box input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-time-box input:disabled { cursor: not-allowed; }
.gh-arrow { align-self: flex-end; margin-bottom: 14px; color: var(--muted-2); font-size: 0.9rem; }
.gh-duration { align-self: flex-end; min-width: 78px; height: 42px; display: grid; place-items: center; padding: 0 10px; color: var(--ok); font-size: 12px; font-weight: 700; white-space: nowrap; border-radius: 11px; background: rgba(52, 211, 153, 0.1); }
.gh-duration.bad { color: #f87171; background: rgba(239, 68, 68, 0.1); }
.gh-times.off .gh-duration { color: var(--muted-2); background: transparent; }

.gh-note { display: flex; align-items: flex-start; gap: 10px; padding: 13px 15px; color: var(--muted); font-size: 12.5px; line-height: 1.55; border: 1px solid var(--hl-line); border-radius: 13px; background: var(--hl-soft); }
.gh-note i { flex: none; margin-top: 2px; color: var(--hl); font-size: 1rem; }
.gh-note b { color: var(--title); font-weight: 700; }

/* ---------- Horario semanal (cuadrícula) ---------- */
.gh-gridwrap { overflow-x: auto; padding: 14px; border: 1px solid var(--line-2); border-radius: 18px; background: color-mix(in srgb, var(--text) 2.5%, transparent); scrollbar-width: thin; }
.gh-grid { min-width: 860px; display: grid; grid-template-columns: 104px repeat(7, minmax(0, 1fr)); gap: 8px; align-items: stretch; }
.gh-cell { display: flex; align-items: center; }
.gh-corner { padding-left: 6px; color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.1px; }
.gh-dayhead { min-height: 46px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px; color: var(--muted); font-size: 11.5px; letter-spacing: 0.5px; border: 1px solid var(--line-2); border-radius: 12px; background: color-mix(in srgb, var(--text) 5%, transparent); }
.gh-dayhead strong { font-family: 'Oswald', sans-serif; font-size: 12.5px; font-weight: 600; letter-spacing: 0.7px; }
.gh-dayhead small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.8px; opacity: 0.85; }
.gh-dayhead.today { color: #1a1208; border-color: transparent; background: linear-gradient(145deg, color-mix(in srgb, var(--hl) 92%, white), var(--hl)); box-shadow: 0 8px 22px -10px var(--hl-line); }

.gh-section { grid-column: 1 / -1; margin-top: 8px; padding: 0 4px; color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.3px; }
.gh-hour { position: sticky; left: 0; z-index: 2; padding: 0 8px 0 6px; background: linear-gradient(90deg, color-mix(in srgb, var(--card) 100%, transparent) 85%, transparent); }
.gh-hour span { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 12.5px; font-weight: 500; line-height: 1.25; }
.gh-hour em { padding: 1px 5px; color: var(--muted); font-family: 'Inter', sans-serif; font-size: 8.5px; font-style: normal; font-weight: 800; letter-spacing: 0.5px; border-radius: 4px; background: color-mix(in srgb, var(--text) 10%, transparent); }
.gh-hour.open span { color: var(--ok); font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 1px; gap: 6px; }

.gh-slot { min-width: 0; display: flex; }
.gh-open-chip { width: 100%; min-height: 40px; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 3px; padding: 4px 6px; cursor: pointer; color: var(--ok); font: 700 11px 'Inter', sans-serif; white-space: nowrap; text-align: center; border: 1px solid rgba(52, 211, 153, 0.32); border-radius: 11px; background: rgba(52, 211, 153, 0.08); transition: filter 0.18s ease; }
.gh-open-chip:hover { filter: brightness(1.2); }
.gh-open-chip em { margin-left: 1px; font-size: 8.5px; font-style: normal; opacity: 0.75; }
.gh-open-chip.off { gap: 6px; color: var(--muted-2); border-style: dashed; border-color: var(--line-2); background: transparent; font-weight: 600; }

.gh-block {
  --c: var(--hl);
  width: 100%; min-height: 62px; display: flex; align-items: center; justify-content: center; padding: 6px 4px; cursor: pointer;
  color: var(--title); text-align: center; text-transform: uppercase;
  border: 1.5px solid color-mix(in srgb, var(--c) 85%, white 8%); border-radius: 13px;
  background: linear-gradient(150deg, color-mix(in srgb, var(--c) 34%, #14141f), color-mix(in srgb, var(--c) 13%, #14141f));
  box-shadow: 0 8px 20px -12px color-mix(in srgb, var(--c) 80%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease;
}
.gh-block:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 14px 26px -12px color-mix(in srgb, var(--c) 90%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.18); }
.gh-block span { display: -webkit-box; overflow: hidden; font: 700 11.5px/1.22 'Inter', sans-serif; letter-spacing: 0.3px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45); -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow-wrap: break-word; }
.gh-block.static { width: auto; min-width: 190px; min-height: 54px; cursor: default; }
.gh-block.static:hover { transform: none; filter: none; }

.gh-empty { width: 100%; min-height: 62px; display: grid; place-items: center; cursor: pointer; color: var(--muted-2); font-size: 1rem; border: 1px dashed var(--line-2); border-radius: 13px; background: transparent; opacity: 0.55; transition: all 0.16s ease; }
.gh-empty:hover, .gh-empty:focus-visible { color: var(--hl); border-color: var(--hl-line); background: var(--hl-soft); opacity: 1; }

.gh-emptybox { display: flex; align-items: center; gap: 16px; padding: 18px; border: 1px dashed var(--line-2); border-radius: 16px; background: color-mix(in srgb, var(--text) 2%, transparent); }
.gh-emptybox-icon { width: 46px; height: 46px; flex: none; display: grid; place-items: center; color: var(--hl); font-size: 1.2rem; border-radius: 13px; background: var(--hl-soft); }
.gh-emptybox > div { min-width: 0; flex: 1; }
.gh-emptybox strong { color: var(--title); font-size: 14px; }
.gh-emptybox p { margin: 4px 0 0; color: var(--muted); font-size: 12.5px; line-height: 1.5; }

.gh-legend { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 4px; }
.gh-legend-item { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 12px; cursor: pointer; color: var(--muted); font: 600 12px 'Inter', sans-serif; border: 1px solid var(--line-2); border-radius: 999px; background: transparent; transition: all 0.16s ease; }
.gh-legend-item:hover { color: var(--title); background: color-mix(in srgb, var(--text) 6%, transparent); }
.gh-legend-item i { width: 9px; height: 9px; border-radius: 50%; }
.gh-legend-item em { padding: 0 6px; color: var(--muted-2); font-size: 10.5px; font-style: normal; border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, transparent); }

/* ---------- Footer / botones ---------- */
.gh-footer { flex: none; display: flex; justify-content: flex-end; gap: 10px; padding: 16px 26px 20px; border-top: 1px solid var(--line); }
.gh-btn { height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 22px; cursor: pointer; font: 700 14px 'Inter', sans-serif; white-space: nowrap; border-radius: 12px; transition: all 0.18s ease; }
.gh-btn.sm { height: 40px; padding: 0 16px; font-size: 13px; }
.gh-btn.ghost { color: var(--text); border: 1px solid var(--line-2); background: transparent; }
.gh-btn.ghost:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
.gh-btn.primary { min-width: 150px; color: var(--btn-text); border: 0; background: var(--btn); box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--btn) 70%, transparent); }
.gh-btn.primary.sm { min-width: 0; }
.gh-btn.primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.gh-btn.danger { color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.08); }
.gh-btn.danger:hover { background: rgba(239, 68, 68, 0.18); }
.gh-btn:disabled { opacity: 0.6; cursor: wait; }
.gh-spin { animation: gh-spin 0.8s linear infinite; }
@keyframes gh-spin { to { transform: rotate(360deg); } }
button:focus-visible, .gh-swatch:focus-within { outline: 2px solid var(--hl); outline-offset: 2px; }

/* ---------- Diálogo de bloque ---------- */
.gh-dlg-overlay { position: absolute; inset: 0; z-index: 20; padding: 16px; display: flex; align-items: center; justify-content: center; background: rgba(8, 8, 14, 0.72); backdrop-filter: blur(3px); }
.gh-dlg { width: min(560px, 100%); max-height: 100%; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--line-2); border-radius: 20px; background: var(--card); box-shadow: 0 26px 70px rgba(0, 0, 0, 0.6); }
.gh-dlg-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--line); }
.gh-dlg-head small { color: var(--hl); font-size: 10px; font-weight: 800; letter-spacing: 1.3px; }
.gh-dlg-head h3 { margin: 3px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 21px; font-weight: 600; }
.gh-dlg-head h3 span { color: var(--hl); }
.gh-dlg-body { flex: 1; min-height: 0; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: thin; }
.gh-dlg-foot { flex: none; display: flex; align-items: center; gap: 10px; padding: 14px 22px 18px; border-top: 1px solid var(--line); }
.gh-spacer { flex: 1; }

.gh-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.gh-field > label, .gh-field-top > label { color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: 0.2px; }
.gh-field-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.gh-link { display: inline-flex; align-items: center; gap: 6px; padding: 0; cursor: pointer; color: var(--hl); font: 600 12px 'Inter', sans-serif; border: 0; background: transparent; }
.gh-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.gh-hint { margin: 0; padding: 12px 14px; color: var(--muted-2); font-size: 12.5px; border: 1px dashed var(--line-2); border-radius: 12px; }

.gh-input { position: relative; display: flex; align-items: center; }
.gh-input i { position: absolute; left: 13px; color: var(--muted-2); font-size: 1rem; pointer-events: none; }
.gh-input input { width: 100%; height: 46px; padding: 0 14px 0 40px; outline: none; color: var(--title); font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 12px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-input input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-input input::placeholder { color: var(--muted-2); }

.gh-palette { display: flex; flex-wrap: wrap; gap: 9px; }
.gh-swatch { position: relative; width: 34px; height: 34px; display: grid; place-items: center; cursor: pointer; color: #101018; font-size: 1rem; border: 2px solid transparent; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.gh-swatch i { opacity: 0; transform: scale(0.6); transition: all 0.15s ease; }
.gh-swatch:hover { transform: scale(1.1); }
.gh-swatch.on { box-shadow: 0 0 0 3px var(--card), 0 0 0 5px var(--c); }
.gh-swatch.on i { opacity: 1; transform: scale(1); }
.gh-swatch.custom { overflow: hidden; background: conic-gradient(from 0deg, #f87171, #facc15, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171); }
.gh-swatch.custom.on { background: var(--c); }
.gh-swatch.custom i { opacity: 1; transform: none; }
.gh-swatch.custom input { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; cursor: pointer; opacity: 0; }

.gh-daychips { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 7px; }
.gh-daychip { height: 42px; cursor: pointer; color: var(--muted); font: 700 11.5px 'Inter', sans-serif; letter-spacing: 0.4px; border: 1.5px solid var(--line-2); border-radius: 11px; background: transparent; transition: all 0.16s ease; }
.gh-daychip:hover { border-color: var(--hl-line); color: var(--title); }
.gh-daychip.on { color: #1a1208; border-color: transparent; background: var(--hl); box-shadow: 0 6px 16px -8px var(--hl-line); }

.gh-ranges { display: grid; gap: 8px; }
.gh-range { display: grid; grid-template-columns: 92px minmax(0, 1fr) 16px minmax(0, 1fr) 74px; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 12px; background: color-mix(in srgb, var(--text) 3%, transparent); }
.gh-range strong { color: var(--title); font-size: 13px; font-weight: 700; }
.gh-range input { width: 100%; min-width: 0; height: 40px; padding: 0 8px; outline: none; color: var(--title); color-scheme: dark; font: 500 13.5px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 10px; background: var(--field); }
.gh-range input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-range > i { color: var(--muted-2); font-size: 0.8rem; text-align: center; }
.gh-range-dur { color: var(--ok); font-size: 11.5px; font-weight: 700; text-align: right; white-space: nowrap; }
.gh-range-dur.bad { color: #f87171; }

.gh-preview { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 2.5%, transparent); }
.gh-preview > span { color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1.1px; }

.gh-pop-enter-active, .gh-pop-leave-active { transition: opacity 0.18s ease; }
.gh-pop-enter-active .gh-dlg, .gh-pop-leave-active .gh-dlg { transition: transform 0.2s ease, opacity 0.2s ease; }
.gh-pop-enter-from, .gh-pop-leave-to { opacity: 0; }
.gh-pop-enter-from .gh-dlg, .gh-pop-leave-to .gh-dlg { opacity: 0; transform: translateY(10px) scale(0.97); }

/* ---------- Horario semanal en lista (móvil / tablet) ---------- */
.gh-weeklist { display: none; }
.gh-wd { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--line-2); border-radius: 16px; background: color-mix(in srgb, var(--text) 3%, transparent); }
.gh-wd.today { border-color: var(--hl-line); background: linear-gradient(90deg, var(--hl-soft), color-mix(in srgb, var(--text) 3%, transparent) 60%); }
.gh-wd-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.gh-wd-name { min-width: 0; display: flex; align-items: center; gap: 8px; }
.gh-wd-name strong { color: var(--title); font-size: 15px; font-weight: 700; }
.gh-wd .gh-open-chip { width: auto; min-height: 30px; flex: none; gap: 6px; padding: 4px 11px; font-size: 11px; border-radius: 999px; }
.gh-wd .gh-open-chip i { font-size: 0.85rem; }
.gh-wd-blocks { display: grid; gap: 8px; }
.gh-wd-block { --c: var(--hl); width: 100%; min-width: 0; display: flex; align-items: center; gap: 10px; padding: 11px 12px; cursor: pointer; color: var(--title); text-align: left; border: 1.5px solid color-mix(in srgb, var(--c) 70%, transparent); border-radius: 12px; background: linear-gradient(150deg, color-mix(in srgb, var(--c) 28%, #14141f), color-mix(in srgb, var(--c) 10%, #14141f)); }
.gh-wd-dot { width: 10px; height: 10px; flex: none; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 25%, transparent); }
.gh-wd-title { min-width: 0; flex: 1; overflow: hidden; font: 700 13px 'Inter', sans-serif; text-overflow: ellipsis; white-space: nowrap; }
.gh-wd-time { flex: none; color: var(--muted); font: 600 11.5px 'Inter', sans-serif; white-space: nowrap; }
.gh-wd-empty { margin: 0; color: var(--muted-2); font-size: 12px; }
.gh-wd-add { height: 38px; display: flex; align-items: center; justify-content: center; gap: 7px; cursor: pointer; color: var(--hl); font: 700 12.5px 'Inter', sans-serif; border: 1px dashed var(--hl-line); border-radius: 11px; background: transparent; transition: background 0.16s ease; }
.gh-wd-add:hover:not(:disabled) { background: var(--hl-soft); }
.gh-wd-add:disabled { opacity: 0.5; cursor: wait; }

@media (max-width: 920px) {
  .gh-gridwrap { display: none; }
  .gh-weeklist { display: grid; gap: 10px; }
}

/* ---------- Responsive ---------- */
.gh-panel, .gh-body, .gh-dlg, .gh-dlg-body { max-width: 100%; }
.gh-body { overflow-x: hidden; }

@media (max-width: 860px) {
  .gh-day { flex-direction: column; align-items: stretch; gap: 14px; }
  .gh-day-main { width: 100%; }
  .gh-times { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; align-items: end; }
  .gh-time { min-width: 0; }
  .gh-time-box { width: 100%; min-width: 0; }
  .gh-time-box input { width: 100%; min-width: 0; font-size: 16px; }
  i.gh-arrow, .gh-duration { display: none; }
}

@media (max-width: 620px) {
  .gh-overlay { padding: 0; align-items: flex-end; }
  .gh-panel { width: 100%; max-height: 92vh; max-height: 92dvh; border-radius: 22px 22px 0 0; }

  .gh-head { padding: 16px 14px; gap: 10px; }
  .gh-title { gap: 11px; }
  .gh-symbol { width: 42px; height: 42px; font-size: 1.15rem; border-radius: 12px; }
  .gh-head small { font-size: 9px; letter-spacing: 1px; }
  .gh-head h2 { font-size: 19px; }
  .gh-head p { display: none; }
  .gh-close { width: 36px; height: 36px; }

  .gh-body { padding: 14px; gap: 12px; scrollbar-width: none; }
  .gh-body::-webkit-scrollbar, .gh-dlg-body::-webkit-scrollbar { display: none; }
  .gh-dlg-body { scrollbar-width: none; }

  .gh-stats { gap: 8px; }
  .gh-stat { flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px 11px; border-radius: 12px; }
  .gh-stat-icon { display: none; }
  .gh-stat strong { font-size: 17px; }
  .gh-stat strong em { display: none; }
  .gh-stat small { font-size: 8.5px; letter-spacing: 0.4px; white-space: normal; line-height: 1.25; }

  .gh-toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .gh-segmented { width: 100%; }
  .gh-segmented button { min-width: 0; height: 40px; padding: 0 6px; gap: 6px; font-size: 12.5px; }
  .gh-presets { flex-wrap: wrap; gap: 8px; }
  .gh-chip { flex: 1 1 auto; justify-content: center; height: 38px; padding: 0 12px; font-size: 12px; }
  .gh-toolbar > .gh-btn { width: 100%; }

  .gh-day { padding: 14px; border-radius: 14px; }
  .gh-day-name strong { font-size: 15px; }
  .gh-time span { font-size: 11px; }
  .gh-time-box i { left: 10px; }
  .gh-time-box input { height: 44px; padding: 0 8px 0 32px; font-size: 14px; }
  .gh-note { font-size: 12px; padding: 11px 12px; }

  .gh-emptybox { flex-direction: column; align-items: flex-start; }
  .gh-emptybox .gh-btn { width: 100%; }
  .gh-legend-item { height: 30px; font-size: 11.5px; }

  .gh-footer { gap: 8px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom, 0px)); }
  .gh-footer .gh-btn { flex: 1; height: 44px; padding: 0 12px; font-size: 13.5px; min-width: 0; }

  /* Diálogo de bloque */
  .gh-dlg-overlay { padding: 0; align-items: flex-end; }
  .gh-dlg { width: 100%; max-height: 92%; border-radius: 20px 20px 0 0; }
  .gh-dlg-head { padding: 14px; }
  .gh-dlg-head h3 { font-size: 19px; }
  .gh-dlg-body { padding: 14px; gap: 14px; }
  .gh-dlg-foot { flex-wrap: wrap; gap: 8px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom, 0px)); }
  .gh-dlg-foot .gh-spacer { display: none; }
  .gh-dlg-foot .gh-btn { flex: 1 1 0; min-width: 0; height: 44px; padding: 0 10px; font-size: 13.5px; }
  .gh-dlg-foot .gh-btn.danger { flex: 1 1 100%; }

  .gh-daychips { gap: 4px; }
  .gh-daychip { height: 40px; font-size: 10.5px; letter-spacing: 0; border-radius: 9px; }
  .gh-palette { gap: 8px; }

  .gh-range { grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr); grid-template-areas: "name name dur" "ini arr fin"; row-gap: 8px; column-gap: 6px; padding: 10px; }
  .gh-range strong { grid-area: name; }
  .gh-range > input:nth-of-type(1) { grid-area: ini; }
  .gh-range > i { grid-area: arr; }
  .gh-range > input:nth-of-type(2) { grid-area: fin; }
  .gh-range-dur { grid-area: dur; display: block; align-self: center; }
  .gh-range input { display: block; width: 100%; min-width: 0; height: 44px; font-size: 16px; }

  .gh-preview { flex-direction: column; align-items: stretch; gap: 8px; }
  .gh-block.static { width: 100%; min-width: 0; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}

/* ---------- Festivos y cierres especiales ---------- */
.gh-exceptions { margin-top: 6px; padding: 20px; display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--line-2); border-radius: 18px; background: color-mix(in srgb, var(--text) 3%, transparent); }
.gh-ex-head { display: flex; align-items: center; gap: 14px; }
.gh-ex-icon { width: 42px; height: 42px; flex: none; display: grid; place-items: center; color: var(--hl); font-size: 1.15rem; border: 1px solid var(--hl-line); border-radius: 12px; background: var(--hl-soft); }
.gh-ex-head h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 19px; font-weight: 600; line-height: 1.15; }
.gh-ex-head p { margin: 4px 0 0; color: var(--muted); font-size: 12.5px; line-height: 1.45; }

.gh-ex-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding-top: 16px; border-top: 1px solid var(--line); }
.gh-ex-field { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.gh-ex-field.wide { grid-column: 1 / -1; }
.gh-ex-field > label { color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: 0.2px; }
.gh-ex-control { position: relative; display: flex; align-items: center; }
.gh-ex-control > i:first-child { position: absolute; left: 13px; z-index: 1; color: var(--hl); font-size: 1rem; pointer-events: none; }
.gh-ex-control input, .gh-ex-control select { width: 100%; min-width: 0; height: 46px; padding: 0 14px 0 40px; outline: none; color: var(--title); color-scheme: dark; font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 12px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-ex-control select { padding-right: 38px; cursor: pointer; appearance: none; -webkit-appearance: none; text-overflow: ellipsis; }
.gh-ex-control select option { background: #15171b; color: #f4f4f5; }
.gh-ex-control input::placeholder { color: var(--muted-2); }
.gh-ex-control input:focus, .gh-ex-control select:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-ex-control input:disabled, .gh-ex-control select:disabled { opacity: 0.6; cursor: not-allowed; }
.gh-ex-chev { position: absolute; right: 14px; color: var(--muted-2); font-size: 0.8rem; pointer-events: none; }
.gh-btn.gh-ex-submit { grid-column: 1 / -1; justify-self: end; min-width: 230px; }

.gh-ex-list { display: grid; gap: 10px; }
.gh-ex-row { --t: var(--hl); display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 3%, transparent); }
.gh-ex-row.cerrado { --t: #f87171; }
.gh-ex-row.especial { --t: #facc15; }
.gh-ex-row.abierto { --t: var(--ok); }
.gh-ex-badge { width: 40px; height: 40px; display: grid; place-items: center; color: var(--t); font-size: 1.05rem; border-radius: 11px; background: color-mix(in srgb, var(--t) 14%, transparent); }
.gh-ex-info { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.gh-ex-title { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
.gh-ex-title strong { color: var(--title); font-size: 13.5px; font-weight: 700; text-transform: capitalize; }
.gh-ex-tag { padding: 2px 8px; color: var(--t); font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 999px; background: color-mix(in srgb, var(--t) 14%, transparent); }
.gh-ex-info small { color: var(--muted); font-size: 12px; line-height: 1.4; overflow-wrap: anywhere; }
.gh-ex-del { height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; cursor: pointer; color: #f87171; font: 700 12.5px 'Inter', sans-serif; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 10px; background: rgba(239, 68, 68, 0.08); transition: background 0.16s ease; }
.gh-ex-del:hover:not(:disabled) { background: rgba(239, 68, 68, 0.18); }
.gh-ex-del:disabled { opacity: 0.5; cursor: wait; }
.gh-ex-empty { margin: 0; padding: 14px; color: var(--muted-2); font-size: 12.5px; text-align: center; border: 1px dashed var(--line-2); border-radius: 12px; }

.gh-ex-state { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; font-size: 12.5px; line-height: 1.5; border: 1px solid; border-radius: 12px; }
.gh-ex-state i { flex: none; margin-top: 2px; font-size: 1rem; }
.gh-ex-state strong { font-weight: 800; }
.gh-ex-state.open { color: #5eead4; border-color: rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.08); }
.gh-ex-state.closed { color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08); }

@media (max-width: 620px) {
  .gh-exceptions { padding: 14px; gap: 14px; border-radius: 14px; }
  .gh-ex-head { align-items: flex-start; gap: 12px; }
  .gh-ex-icon { width: 38px; height: 38px; }
  .gh-ex-head h3 { font-size: 17px; }
  .gh-ex-form { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .gh-ex-control input, .gh-ex-control select { height: 48px; font-size: 16px; }
  .gh-btn.gh-ex-submit { justify-self: stretch; width: 100%; min-width: 0; }
  .gh-ex-row { grid-template-columns: 40px minmax(0, 1fr); }
  .gh-ex-del { grid-column: 1 / -1; width: 100%; height: 40px; }
}
</style>