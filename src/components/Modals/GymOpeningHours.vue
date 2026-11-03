<template>
  <div class="gh-overlay" @click.self="emit('close')">
    <section class="gh-panel" role="dialog" aria-modal="true" aria-labelledby="gh-title">
      <!-- ================= HEADER ================= -->
      <header class="gh-head">
        <div class="gh-title">
          <span class="gh-symbol"><i class="bi bi-clock-history"></i></span>
          <div>
            <small>CONFIGURACIÓN DEL GIMNASIO</small>
            <h2 id="gh-title">HORARIO <span>DEL GIMNASIO</span></h2>
            <p>Define los días y las horas en que abre tu sede.</p>
          </div>
        </div>
        <button class="gh-close" type="button" aria-label="Cerrar" @click="emit('close')"><i class="bi bi-x-lg"></i></button>
      </header>

      <div class="gh-body">
        <!-- ================= RESUMEN ================= -->
        <div class="gh-stats">
          <article class="gh-stat">
            <span class="gh-stat-icon"><i class="bi bi-building"></i></span>
            <div><strong>Sede {{ sede }}</strong><small>SEDE SELECCIONADA</small></div>
          </article>
          <article class="gh-stat">
            <span class="gh-stat-icon ok"><i class="bi bi-door-open"></i></span>
            <div><strong>{{ abiertos }} <em>de 7</em></strong><small>DÍAS ABIERTOS</small></div>
          </article>
          <article class="gh-stat">
            <span class="gh-stat-icon warm"><i class="bi bi-stopwatch"></i></span>
            <div><strong>{{ horasSemana }} h</strong><small>HORAS A LA SEMANA</small></div>
          </article>
        </div>

        <p v-if="error" class="gh-alert error" role="alert"><i class="bi bi-exclamation-triangle"></i>{{ error }}</p>
        <p v-if="exito" class="gh-alert success" role="status"><i class="bi bi-check-circle"></i>{{ exito }}</p>

        <!-- ================= BARRA DE HERRAMIENTAS ================= -->
        <div class="gh-toolbar">
          <div class="gh-segmented" role="tablist" :style="{ '--i': vista === 'semana' ? 1 : 0 }">
            <span class="gh-thumb"></span>
            <button type="button" role="tab" :aria-selected="vista === 'dia'" :class="{ active: vista === 'dia' }" @click="vista = 'dia'">
              <i class="bi bi-sliders"></i>Por día
            </button>
            <button type="button" role="tab" :aria-selected="vista === 'semana'" :class="{ active: vista === 'semana' }" @click="vista = 'semana'">
              <i class="bi bi-calendar-week"></i>Semana
            </button>
          </div>

          <div class="gh-presets">
            <button type="button" class="gh-chip" :disabled="bloqueado" @click="abrirLunesViernes"><i class="bi bi-briefcase"></i>Lun – Vie</button>
            <button type="button" class="gh-chip" :disabled="bloqueado" @click="abrirTodos"><i class="bi bi-calendar-check"></i>Todos los días</button>
            <button type="button" class="gh-chip" :disabled="bloqueado || !abiertos" @click="copiarATodos" title="Copia el horario del primer día abierto a los demás días abiertos">
              <i class="bi bi-copy"></i>Copiar a todos
            </button>
          </div>
        </div>

        <!-- ================= VISTA: POR DÍA ================= -->
        <div v-if="vista === 'dia'" class="gh-list">
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

        <!-- ================= VISTA: SEMANA ================= -->
        <div v-else class="gh-week">
          <div class="gh-scale">
            <span class="gh-scale-label">DÍA</span>
            <div class="gh-scale-track">
              <span v-for="h in marcas" :key="h" :style="{ left: pct(h * 60) + '%' }">{{ etiquetaHora(h) }}</span>
            </div>
          </div>

          <div v-for="(dia, i) in horarios" :key="dia.dia" class="gh-week-row" :class="{ today: i === hoy }">
            <div class="gh-week-day">
              <strong>{{ dias[i]?.slice(0, 3).toUpperCase() }}</strong>
              <small v-if="i === hoy">HOY</small>
            </div>
            <div class="gh-lane">
              <i v-for="h in marcas" :key="h" class="gh-grid-line" :style="{ left: pct(h * 60) + '%' }"></i>
              <div v-if="dia.abierto && duracion(dia) > 0" class="gh-bar" :style="barra(dia)">
                <span>{{ dia.apertura }} – {{ dia.cierre }}</span>
              </div>
              <span v-else class="gh-closed-tag"><i class="bi bi-moon-stars"></i>Cerrado</span>
            </div>
          </div>

          <p class="gh-week-hint"><i class="bi bi-hand-index"></i>Cambia a «Por día» para editar los horarios.</p>
        </div>

        <div class="gh-note">
          <i class="bi bi-info-circle"></i>
          <span>Este horario define cuándo abre el gimnasio. Las clases, torneos y demás actividades se administran por separado en «Añadir eventos».</span>
        </div>
      </div>

      <!-- ================= FOOTER ================= -->
      <footer class="gh-footer">
        <button type="button" class="gh-btn ghost" @click="emit('close')">Cancelar</button>
        <button type="button" class="gh-btn primary" :disabled="bloqueado" @click="guardar">
          <i class="bi" :class="guardando ? 'bi-arrow-repeat gh-spin' : 'bi-check-lg'"></i>
          {{ guardando ? 'Guardando...' : 'Guardar horario' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const emit = defineEmits(['close', 'saved']);

type Dia = { dia: string; abierto: boolean; apertura: string; cierre: string };

const ids = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const nuevos = (): Dia[] => ids.map(dia => ({ dia, abierto: false, apertura: '06:00', cierre: '22:00' }));

const horarios = ref<Dia[]>(nuevos());
const sede = ref(1);
const abiertos = ref(0);
const cargando = ref(false);
const guardando = ref(false);
const error = ref('');
const exito = ref('');
const vista = ref<'dia' | 'semana'>('dia');
const bloqueado = computed(() => guardando.value || cargando.value);
const hoy = (new Date().getDay() + 6) % 7;

watch(horarios, () => {
  abiertos.value = horarios.value.filter(x => x.abierto).length;
}, { deep: true, immediate: true });

/* ---------- Utilidades de tiempo ---------- */
const minutos = (hhmm: string) => {
  const [h = 0, m = 0] = String(hhmm || '').split(':').map(Number);
  return h * 60 + m;
};
const duracion = (d: Dia) => minutos(d.cierre) - minutos(d.apertura);
const textoDuracion = (d: Dia) => {
  const total = duracion(d);
  if (total <= 0) return 'Revisar';
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};
const horasSemana = computed(() => {
  const total = horarios.value.reduce((sum, d) => (d.abierto && duracion(d) > 0 ? sum + duracion(d) : sum), 0);
  return Math.round((total / 60) * 10) / 10;
});

/* ---------- Vista semanal: escala dinámica ---------- */
const rango = computed(() => {
  const activos = horarios.value.filter(d => d.abierto && duracion(d) > 0);
  if (!activos.length) return { ini: 6 * 60, fin: 22 * 60 };
  const ini = Math.floor(Math.min(...activos.map(d => minutos(d.apertura))) / 60) * 60;
  const fin = Math.ceil(Math.max(...activos.map(d => minutos(d.cierre))) / 60) * 60;
  const iniAjustado = Math.max(0, ini - 60);
  const finAjustado = Math.min(24 * 60, fin + 60);
  return { ini: iniAjustado, fin: Math.max(finAjustado, iniAjustado + 4 * 60) };
});
const pct = (min: number) => ((min - rango.value.ini) / (rango.value.fin - rango.value.ini)) * 100;
const marcas = computed(() => {
  const ini = Math.ceil(rango.value.ini / 60);
  const fin = Math.floor(rango.value.fin / 60);
  const paso = fin - ini > 14 ? 3 : fin - ini > 8 ? 2 : 1;
  const out: number[] = [];
  for (let h = ini; h <= fin; h += paso) out.push(h);
  return out;
});
const etiquetaHora = (h: number) => {
  const hh = h % 24;
  const sufijo = hh < 12 ? 'a.m.' : 'p.m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12} ${sufijo}`;
};
const barra = (d: Dia) => {
  const left = Math.max(0, pct(minutos(d.apertura)));
  const right = Math.min(100, pct(minutos(d.cierre)));
  return { left: left + '%', width: Math.max(2, right - left) + '%' };
};

/* ---------- Atajos ---------- */
const abrirLunesViernes = () => {
  horarios.value.forEach((d, i) => { d.abierto = i < 5; });
};
const abrirTodos = () => {
  horarios.value.forEach(d => { d.abierto = true; });
};
const copiarATodos = () => {
  const base = horarios.value.find(d => d.abierto);
  if (!base) return;
  horarios.value.forEach(d => {
    if (d.abierto) { d.apertura = base.apertura; d.cierre = base.cierre; }
  });
};

/* ---------- API ---------- */
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
    if (h.abierto && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h.apertura) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.cierre) || h.apertura >= h.cierre)) {
      error.value = `Revisa las horas de ${dias[ids.indexOf(h.dia)]}. El cierre debe ser posterior a la apertura.`;
      vista.value = 'dia';
      return;
    }
  }
  guardando.value = true;
  try {
    await request('PUT', { horarios: horarios.value });
    exito.value = 'El horario del gimnasio se guardó correctamente.';
    emit('saved', horarios.value);
  } catch (e: any) {
    error.value = e?.message || 'No se pudo guardar.';
  } finally {
    guardando.value = false;
  }
};

const cambioSede = () => { void cargar(); };
onMounted(() => {
  window.addEventListener('factorfit:branch-changed', cambioSede);
  void cargar();
});
onUnmounted(() => {
  window.removeEventListener('factorfit:branch-changed', cambioSede);
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
  width: min(860px, 100%); max-height: 94vh; display: flex; flex-direction: column; overflow: hidden;
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
.gh-close:hover { color: #f87171; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.09); }

/* ---------- Cuerpo ---------- */
.gh-body { flex: 1; min-height: 0; overflow-y: auto; padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: thin; }

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

/* ---------- Toolbar ---------- */
.gh-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.gh-segmented { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border: 1px solid var(--line-2); border-radius: 14px; background: var(--field); }
.gh-thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 10px; background: var(--hl); box-shadow: 0 6px 16px -6px var(--hl-line); transform: translateX(calc(var(--i, 0) * 100%)); transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1); }
.gh-segmented button { position: relative; z-index: 1; min-width: 110px; height: 38px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; cursor: pointer; color: var(--muted); font: 700 13px 'Inter', sans-serif; border: 0; border-radius: 10px; background: transparent; transition: color 0.2s ease; }
.gh-segmented button.active { color: #1a1208; }
.gh-presets { display: flex; flex-wrap: wrap; gap: 8px; }
.gh-chip { height: 38px; display: inline-flex; align-items: center; gap: 7px; padding: 0 13px; cursor: pointer; color: var(--muted); font: 600 12.5px 'Inter', sans-serif; border: 1px solid var(--line-2); border-radius: 999px; background: transparent; transition: all 0.18s ease; }
.gh-chip:hover:not(:disabled) { color: var(--title); border-color: var(--hl-line); background: var(--hl-soft); }
.gh-chip:disabled { opacity: 0.45; cursor: not-allowed; }
.gh-chip i { color: var(--hl); font-size: 0.9rem; }

/* ---------- Vista por día ---------- */
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
.gh-time-box input { width: 138px; height: 42px; padding: 0 10px 0 34px; outline: none; color: var(--title); color-scheme: dark; font: 500 14px 'Inter', sans-serif; border: 1.5px solid var(--line-2); border-radius: 11px; background: var(--field); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.gh-time-box input:focus { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
.gh-time-box input:disabled { cursor: not-allowed; }
.gh-arrow { align-self: flex-end; margin-bottom: 14px; color: var(--muted-2); font-size: 0.9rem; }
.gh-duration { align-self: flex-end; min-width: 74px; height: 42px; display: grid; place-items: center; padding: 0 10px; color: var(--ok); font-size: 12px; font-weight: 700; white-space: nowrap; border-radius: 11px; background: rgba(52, 211, 153, 0.1); }
.gh-duration.bad { color: #f87171; background: rgba(239, 68, 68, 0.1); }
.gh-times.off .gh-duration { color: var(--muted-2); background: transparent; }

/* ---------- Vista semanal ---------- */
.gh-week { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid var(--line-2); border-radius: 16px; background: color-mix(in srgb, var(--text) 2.5%, transparent); }
.gh-scale, .gh-week-row { display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 12px; }
.gh-scale-label { color: var(--muted-2); font-size: 10px; font-weight: 800; letter-spacing: 1px; }
.gh-scale-track { position: relative; height: 20px; }
.gh-scale-track span { position: absolute; top: 0; transform: translateX(-50%); color: var(--muted-2); font-size: 10.5px; font-weight: 600; white-space: nowrap; }
.gh-scale-track span:first-child { transform: none; }
.gh-week-row { padding: 4px 0; border-radius: 12px; }
.gh-week-day { display: flex; flex-direction: column; gap: 2px; padding-left: 4px; }
.gh-week-day strong { color: var(--text); font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.6px; }
.gh-week-day small { width: fit-content; padding: 1px 6px; color: var(--hl); font-size: 8.5px; font-weight: 800; letter-spacing: 0.6px; border-radius: 4px; background: var(--hl-soft); }
.gh-week-row.today .gh-week-day strong { color: var(--hl); }
.gh-lane { position: relative; height: 44px; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: var(--field); }
.gh-grid-line { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--line); }
.gh-bar { position: absolute; top: 6px; bottom: 6px; display: flex; align-items: center; justify-content: center; min-width: 0; padding: 0 10px; overflow: hidden; color: #1a1208; border-radius: 9px; background: linear-gradient(135deg, var(--hl), color-mix(in srgb, var(--hl) 70%, #ff7a59)); box-shadow: 0 6px 16px -8px var(--hl-line); }
.gh-bar span { overflow: hidden; font: 700 12px 'Inter', sans-serif; text-overflow: ellipsis; white-space: nowrap; }
.gh-week-row.today .gh-lane { border-color: var(--hl-line); }
.gh-closed-tag { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 7px; color: var(--muted-2); font-size: 12px; font-weight: 600; background: repeating-linear-gradient(135deg, transparent 0 8px, color-mix(in srgb, var(--text) 3%, transparent) 8px 16px); }
.gh-week-hint { display: flex; align-items: center; gap: 8px; margin: 6px 0 0; color: var(--muted-2); font-size: 11.5px; }

/* ---------- Nota + footer ---------- */
.gh-note { display: flex; align-items: flex-start; gap: 10px; padding: 13px 15px; color: var(--muted); font-size: 12px; line-height: 1.55; border: 1px solid var(--hl-line); border-radius: 13px; background: var(--hl-soft); }
.gh-note i { flex: none; margin-top: 2px; color: var(--hl); font-size: 1rem; }
.gh-footer { flex: none; display: flex; justify-content: flex-end; gap: 10px; padding: 16px 26px 20px; border-top: 1px solid var(--line); }
.gh-btn { height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 22px; cursor: pointer; font: 700 14px 'Inter', sans-serif; border-radius: 12px; transition: all 0.18s ease; }
.gh-btn.ghost { color: var(--text); border: 1px solid var(--line-2); background: transparent; }
.gh-btn.ghost:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
.gh-btn.primary { min-width: 180px; color: var(--btn-text); border: 0; background: var(--btn); box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--btn) 70%, transparent); }
.gh-btn.primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.gh-btn:disabled { opacity: 0.6; cursor: wait; }
.gh-spin { animation: gh-spin 0.8s linear infinite; }
@keyframes gh-spin { to { transform: rotate(360deg); } }
button:focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }

/* ---------- Responsive ---------- */
@media (max-width: 760px) {
  .gh-day { flex-direction: column; align-items: stretch; gap: 14px; }
  .gh-times { width: 100%; }
  .gh-time { flex: 1; min-width: 0; }
  .gh-time-box input { width: 100%; font-size: 16px; }
  .gh-duration { display: none; }
  .gh-arrow { display: none; }
}
@media (max-width: 620px) {
  .gh-overlay { padding: 0; align-items: flex-end; }
  .gh-panel { width: 100%; max-height: 96vh; border-radius: 22px 22px 0 0; }
  .gh-head, .gh-body, .gh-footer { padding-left: 16px; padding-right: 16px; }
  .gh-head h2 { font-size: 20px; }
  .gh-head p { display: none; }
  .gh-stats { grid-template-columns: 1fr; }
  .gh-stat { padding: 10px 12px; }
  .gh-toolbar { flex-direction: column; align-items: stretch; }
  .gh-segmented button { min-width: 0; }
  .gh-presets { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 2px; scrollbar-width: none; }
  .gh-chip { flex: none; }
  .gh-scale, .gh-week-row { grid-template-columns: 44px minmax(0, 1fr); gap: 8px; }
  .gh-week { padding: 12px; }
  .gh-footer { padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
  .gh-btn { flex: 1; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>