<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

type Bloque = { id: number; dia: string; titulo: string; color: string; inicio: string; fin: string };
type Sucursal = { ID_Sede: number; ID_Gym: number; Nombre_Gym: string; Nombre_Sede: string };
const props = withDefaults(defineProps<{ sedeId?: number | string | null; mostrarSelector?: boolean }>(), { sedeId: null, mostrarSelector: true });
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const dias = [
  { clave: 'monday', nombre: 'LUNES' }, { clave: 'tuesday', nombre: 'MARTES' },
  { clave: 'wednesday', nombre: 'MIÉRCOLES' }, { clave: 'thursday', nombre: 'JUEVES' },
  { clave: 'friday', nombre: 'VIERNES' }
];
const nombres = ['Glute Bands', 'Circuito', 'GAP', 'Tabata', 'Entrenamiento Funcional', 'Zumba', 'Meta HIT', 'Core'];
const colores = ['#34D399', '#FDBA74', '#60A5FA', '#FB7185', '#C4B5FD', '#F472B6', '#A5B4FC', '#2DD4BF'];
const sedeActual = ref<string>(props.sedeId == null ? '' : String(props.sedeId));
const sucursales = ref<Sucursal[]>([]);
const bloques = ref<Bloque[]>([]);
const cargando = ref(false);
const error = ref('');
const nombreSede = ref('');
let solicitud = 0;
const hoy = new Date().getDay();
const diaActual = hoy === 0 ? 'sunday' : ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][hoy] ?? '';
const horas = computed(() => [...new Set(bloques.value.map(b => `${b.inicio}|${b.fin}`))].sort((a, b) => a.localeCompare(b)));
const manana = computed(() => horas.value.filter(h => Number(h.slice(0, 2)) < 12));
const tarde = computed(() => horas.value.filter(h => Number(h.slice(0, 2)) >= 12));
const coloresLeyenda = computed(() => {
  const lista = new Map<string, string>();
  for (const b of bloques.value) if (!lista.has(b.titulo)) lista.set(b.titulo, b.color);
  return [...lista].map(([titulo, color]) => ({ titulo, color }));
});
const obtenerBloque = (dia: string, hora: string) => bloques.value.find(b => b.dia === dia && `${b.inicio}|${b.fin}` === hora);
const hexValido = (color: string) => /^#[0-9a-f]{6}$/i.test(color) ? color : '#A78BFA';
const estiloBloque = (b?: Bloque) => b ? { '--clase-color': hexValido(b.color) } : {};
const hora12 = (h: string) => {
  const [hh = '0', mm = '00'] = h.split(':');
  const n = Number(hh);
  return `${n % 12 || 12}:${mm}`;
};
const etiquetaHora = (rango: string) => {
  const [inicio = '00:00', fin = '00:00'] = rango.split('|');
  const pm = Number(inicio.slice(0, 2)) >= 12;
  return `${hora12(inicio)} – ${hora12(fin)} ${pm ? 'PM' : 'AM'}`;
};
async function cargarSucursales() {
  if (!props.mostrarSelector) return;
  try {
    const r = await fetch(`${API}/api/public/sucursales`, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('No se pudieron consultar las sucursales.');
    const j = await r.json();
    const lista = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
    sucursales.value = lista.filter((s: Sucursal) => Number(s.ID_Sede) > 0);
    if (!sedeActual.value && sucursales.value.length) sedeActual.value = String(sucursales.value[0]?.ID_Sede ?? '');
  } catch (e) { if (!sedeActual.value) error.value = e instanceof Error ? e.message : 'Error al cargar sucursales.'; }
}
async function cargarHorario() {
  const id = Number(sedeActual.value);
  const indice = ++solicitud;
  bloques.value = [];
  nombreSede.value = '';
  error.value = '';
  if (!Number.isSafeInteger(id) || id <= 0) return;
  cargando.value = true;
  try {
    const respuesta = await fetch(`${API}/api/public/horario-clases/${id}`, { headers: { Accept: 'application/json' } });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(json?.message || `No se pudo consultar el horario (${respuesta.status}).`);
    if (indice !== solicitud) return;
    bloques.value = Array.isArray(json?.bloques) ? json.bloques.map((b: Bloque) => ({ ...b, color: hexValido(String(b.color || '')), inicio: String(b.inicio).slice(0, 5), fin: String(b.fin).slice(0, 5) })) : [];
    nombreSede.value = String(json?.sede || '');
  } catch (e) { if (indice === solicitud) error.value = e instanceof Error ? e.message : 'Error de conexión.'; }
  finally { if (indice === solicitud) cargando.value = false; }
}
watch(() => props.sedeId, id => { if (id != null) sedeActual.value = String(id); });
watch(sedeActual, () => { void cargarHorario(); });
function cambioSedeGlobal() { if (props.sedeId != null) return; const id = sessionStorage.getItem('selected_sede_id'); if (id) sedeActual.value = id; }
onMounted(async () => {
  if (!sedeActual.value) cambioSedeGlobal();
  await cargarSucursales();
  if (sedeActual.value) await cargarHorario();
  window.addEventListener('factorfit:branch-changed', cambioSedeGlobal);
});
onUnmounted(() => { solicitud++; window.removeEventListener('factorfit:branch-changed', cambioSedeGlobal); });
</script>

<template>
  <section id="horarios" class="horario-ff">
    <div class="horario-top">
      <div><h2>HORARIO DE <span>CLASES</span></h2><p>Consulta las actividades semanales de tu sucursal.</p></div>
      <label v-if="mostrarSelector && sucursales.length" class="selector-sede"><span>Sucursal</span><select v-model="sedeActual"><option v-for="s in sucursales" :key="s.ID_Sede" :value="String(s.ID_Sede)">{{ s.Nombre_Gym }} — {{ s.Nombre_Sede }}</option></select></label>
      <span v-else-if="nombreSede" class="sede-nombre">{{ nombreSede }}</span>
    </div>
    <div v-if="cargando" class="mensaje">Cargando horario...</div>
    <div v-else-if="error" class="mensaje error"><span>{{ error }}</span><button type="button" @click="cargarHorario">Reintentar</button></div>
    <div v-else-if="!bloques.length" class="mensaje">Aún no hay clases registradas para esta sucursal.</div>
    <template v-else>
      <div class="tabla-desplazable"><div class="horario-grid">
        <div class="encabezado hora-cabecera">HORA</div>
        <div v-for="d in dias" :key="d.clave" class="encabezado dia-cabecera" :class="{ actual: d.clave === diaActual }">{{ d.nombre }}<small v-if="d.clave === diaActual">HOY</small></div>
        <template v-for="(grupo, gi) in [{titulo:'MAÑANA', valores:manana},{titulo:'TARDE Y NOCHE', valores:tarde}]" :key="gi">
          <div v-if="grupo.valores.length" class="separador">{{ grupo.titulo }}</div>
          <template v-for="rango in grupo.valores" :key="rango">
            <div class="hora-etiqueta">{{ etiquetaHora(rango) }}</div>
            <div v-for="dia in dias" :key="`${dia.clave}-${rango}`" class="celda">
              <div v-if="obtenerBloque(dia.clave,rango)" class="clase" :style="estiloBloque(obtenerBloque(dia.clave,rango))" :title="`${obtenerBloque(dia.clave,rango)?.titulo} · ${etiquetaHora(rango)}`">{{ obtenerBloque(dia.clave,rango)?.titulo }}</div>
              <div v-else class="sin-clase" aria-label="Sin clase">—</div>
            </div>
          </template>
        </template>
      </div></div>
      <div class="leyenda"><span v-for="c in coloresLeyenda" :key="c.titulo" class="leyenda-item"><i :style="{ backgroundColor:c.color, boxShadow:`0 0 10px ${c.color}88` }"></i>{{ c.titulo }}</span></div>
    </template>
  </section>
</template>

<style scoped>
.horario-ff{--panel:rgba(255,255,255,.11);position:relative;padding:clamp(18px,3vw,34px);border-radius:24px;background:linear-gradient(145deg,#30224e,#42236c 65%,#321e58);color:#fff;font-family:Inter,system-ui,sans-serif;overflow:hidden}.horario-ff:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 78% 8%,rgba(184,124,255,.18),transparent 43%)}.horario-top{position:relative;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px}.horario-top h2{font-size:clamp(24px,3vw,36px);margin:0;font-weight:900;letter-spacing:-.6px}.horario-top h2 span{color:#f3b38a}.horario-top p{color:#d5c4e8;margin:5px 0 0;font-size:13px}.selector-sede{display:flex;gap:8px;align-items:center;font-size:12px;font-weight:700}.selector-sede select{max-width:260px;background:#493768;border:1px solid #866eab;color:white;padding:11px;border-radius:12px;font:inherit}.sede-nombre{padding:9px 15px;border:1px solid #9078b6;border-radius:12px}.tabla-desplazable{position:relative;overflow-x:auto}.horario-grid{display:grid;grid-template-columns:120px repeat(5,minmax(130px,1fr));gap:7px;min-width:810px}.encabezado{display:flex;justify-content:center;align-items:center;min-height:54px;font-weight:900;font-size:13px}.hora-cabecera{font-size:11px;color:#d7c4e9;justify-content:flex-start}.dia-cabecera{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.19);border-radius:13px;flex-direction:column;gap:1px}.dia-cabecera.actual{background:linear-gradient(120deg,#a97dff,#7d38f4);border-color:#dcc2ff;box-shadow:0 4px 18px #240b4d75}.dia-cabecera small{font-size:9px}.separador{grid-column:1/-1;font-size:11px;font-weight:900;letter-spacing:.9px;color:#d5b2ee;margin-top:15px;padding:10px 0 4px;border-bottom:1px solid #ffffff30}.hora-etiqueta{min-height:60px;display:flex;align-items:center;font-size:13px;font-weight:800;white-space:nowrap}.celda{min-height:60px}.clase{height:100%;min-height:60px;padding:9px 6px;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:13px;border:1px solid var(--clase-color);border-top:3px solid var(--clase-color);background:linear-gradient(160deg,color-mix(in srgb,var(--clase-color) 34%,#2e2445),color-mix(in srgb,var(--clase-color) 12%,#282040));font-size:12px;font-weight:900;line-height:1.15;text-transform:uppercase;text-shadow:0 1px 3px #0008}.sin-clase{height:100%;display:grid;place-items:center;color:#aa95c8;border:1px dashed #ffffff1f;border-radius:13px}.leyenda{position:relative;display:flex;flex-wrap:wrap;gap:13px;margin-top:25px;padding-top:15px;border-top:1px dashed #ffffff38}.leyenda-item{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700}.leyenda-item i{width:10px;height:10px;border-radius:50%;flex:none}.mensaje{position:relative;text-align:center;border-radius:12px;border:1px solid #ffffff31;background:#ffffff13;padding:22px}.mensaje.error{border-color:#fa8da5;color:#ffd0da}.mensaje button{margin-left:10px;background:#fff;color:#3b2459;border:0;border-radius:8px;padding:7px 12px;cursor:pointer}@media(max-width:650px){.horario-ff{border-radius:16px;padding:16px}.horario-top h2{font-size:25px}.horario-grid{gap:5px}.selector-sede{width:100%;justify-content:space-between}.selector-sede select{max-width:70%}} 
</style>
