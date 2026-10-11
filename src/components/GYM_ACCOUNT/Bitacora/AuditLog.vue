<template>
  <HeadingGYM_ACCOUNT>
    <main class="main-content tone-blue">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ tx('Auditoría del sistema', 'System audit') }}</h1>
          <span class="title-underline"></span>
          <p class="main-subtitle">{{ tx('Consulta las acciones realizadas por el personal en las sucursales.', 'Review staff activity across branches.') }}</p>
        </div>

        <div class="actions-bar" id="tutorial-step-0">
          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <select class="status-select" v-model="branch">
              <option value="">{{ tx('Todas las sedes', 'All branches') }}</option>
              <option v-for="s in branches" :key="s" :value="s">{{ s }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <select class="status-select" v-model="action">
              <option value="">{{ tx('Todas las acciones', 'All actions') }}</option>
              <option v-for="a in actions" :key="a" :value="a">{{ tx(a, actionEN[a]) }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="date-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <input type="date" class="date-input" v-model="date" :title="tx('Filtrar por fecha', 'Filter by date')" />
          </div>

          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" :placeholder="tx('Buscar empleado, módulo...', 'Search employee, module...')" v-model="search">
            <button v-if="search" class="search-clear" type="button" @click="search = ''" aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <button v-if="hasFilters" class="btn-ghost" type="button" @click="reset">{{ tx('Limpiar', 'Clear') }}</button>

        </div>
      </header>

      <!-- RESUMEN -->
      <section class="stats-row">
        <div class="stat-card" v-for="s in stats" :key="s.label" :class="'stat-' + s.tone">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </section>

      <!-- ESCRITORIO -->
      <div class="table-container desktop-only" :id="!isMobile ? 'tutorial-step-1' : undefined">
        <table class="user-table">
          <thead>
            <tr>
              <th>{{ tx('Fecha y hora', 'Date and time') }}</th>
              <th>{{ tx('Empleado', 'Employee') }}</th>
              <th>{{ tx('Sucursal', 'Branch') }}</th>
              <th>{{ tx('Módulo', 'Module') }}</th>
              <th>{{ tx('Acción', 'Action') }}</th>
              <th>{{ tx('Descripción', 'Description') }}</th>
              <th class="th-right"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(x, index) in paged" :key="x.id">
              <td class="text-muted nowrap">{{ x.fecha }}</td>
              <td>
                <div class="person-cell">
                  <div class="avatar-small" :style="avatarStyle(x.id)">{{ getInitials(x.usuario) }}</div>
                  <div class="person-info">
                    <span class="text-bold">{{ x.usuario }}</span>
                    <span class="text-muted small">{{ x.rol }}</span>
                  </div>
                </div>
              </td>
              <td><span class="type-chip">{{ x.sede }}</span></td>
              <td>{{ x.modulo }}</td>
              <td><span :class="['status-badge2', actionClass(x.accion)]">{{ tx(x.accion, actionEN[x.accion]) }}</span></td>
              <td class="desc-cell">{{ x.descripcion }}</td>
              <td class="td-right"><div class="details-cell" :id="!isMobile && index === 0 ? 'tutorial-step-2' : undefined"><button class="btn-link" type="button" @click="selected = x">{{ tx('Detalles', 'Details') }}</button></div></td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty-state-cell">
                <div class="empty-state">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>{{ tx('No se encontraron actividades.', 'No activities found.') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">{{ filtered.length }} {{ tx('resultados', 'results') }}</div>
      </div>

      <!-- MÓVIL -->
      <div class="mobile-only">
        <div v-for="(x, index) in paged" :key="x.id" class="user-card" :id="isMobile && index === 0 ? 'tutorial-step-1' : undefined">
          <div class="card-top-section">
            <div class="avatar-small" :style="avatarStyle(x.id)">{{ getInitials(x.usuario) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ x.usuario }}</div>
              <div class="badges-row">
                <span :class="['status-badge2', actionClass(x.accion)]">{{ tx(x.accion, actionEN[x.accion]) }}</span>
                <span class="type-chip">{{ x.sede }}</span>
              </div>
            </div>
          </div>
          <div class="card-meta">
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>{{ x.fecha }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>{{ x.modulo }} · {{ x.rol }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>{{ x.descripcion }}</span>
          </div>
          <button class="btn-card" type="button" :id="isMobile && index === 0 ? 'tutorial-step-2' : undefined" @click="selected = x">{{ tx('Detalles', 'Details') }}</button>
        </div>

        <div v-if="filtered.length === 0" class="empty-state-mobile">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{{ tx('No se encontraron actividades.', 'No activities found.') }}</span>
        </div>
      </div>

      <!-- PAGINACIÓN (solo con más de 40 resultados) -->
      <nav v-if="showPager" class="pager" :aria-label="tx('Paginación', 'Pagination')">
        <button class="pager-btn" type="button" :disabled="page <= 1" :aria-label="tx('Página anterior', 'Previous page')" @click="goPage(page - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page >= totalPages" :aria-label="tx('Página siguiente', 'Next page')" @click="goPage(page + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>

      <!-- Modal detalle -->
      <Teleport to="body">
        <Transition name="rep-pop">
          <div v-if="selected" class="rep-overlay" @click.self="selected = null">
            <div class="rep-modal" role="dialog" aria-modal="true">
              <button class="rep-close" type="button" :aria-label="tx('Cerrar', 'Close')" @click="selected = null">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
        <div class="rep-scroll modal-body-custom">
          <div class="modal-icon-container info-bg">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h2>{{ tx('Detalle de auditoría', 'Audit details') }}</h2>
          <dl class="detail-list">
            <div class="detail-row" v-for="r in detailRows" :key="r.k"><dt>{{ r.k }}</dt><dd>{{ r.v || '—' }}</dd></div>
          </dl>
        </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>
  </HeadingGYM_ACCOUNT>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
// @ts-ignore: useLang.js no trae archivo de tipos
import { useLang } from '../useLang.js';

const { lang } = useLang();
const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') selected.value = null; };
onMounted(() => window.addEventListener('keydown', onEsc));
onUnmounted(() => window.removeEventListener('keydown', onEsc));

const isMobile = ref<boolean>(window.innerWidth <= 900);
const updateWidth = (): void => { isMobile.value = window.innerWidth <= 900; };
onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));
const tx = (es: string, en: string) => (lang.value === 'en' ? en : es);

type Action = 'Crear' | 'Modificar' | 'Eliminar' | 'Acceso';
interface Audit { id: number; fecha: string; usuario: string; rol: string; sede: string; modulo: string; accion: Action; descripcion: string; antes: string; despues: string }


const records = ref<Audit[]>([
  { id: 1001, fecha: '2026-10-09 09:20', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Membresías', accion: 'Modificar', descripcion: 'Actualizó el precio mensual', antes: '$450', despues: '$500' },
  { id: 1002, fecha: '2026-10-09 10:15', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Clientes', accion: 'Crear', descripcion: 'Registró un cliente', antes: '', despues: 'Cliente #125' },
  { id: 1003, fecha: '2026-10-09 12:40', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Promociones', accion: 'Eliminar', descripcion: 'Desactivó una promoción', antes: 'Promoción activa', despues: 'Promoción eliminada' },
  { id: 1004, fecha: '2026-10-10 08:00', usuario: 'Luis Torres', rol: 'Gerente', sede: 'Sur', modulo: 'Sistema', accion: 'Acceso', descripcion: 'Inició sesión', antes: '', despues: 'Sesión iniciada' },
  { id: 1005, fecha: '2026-10-10 09:30', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Pagos', accion: 'Modificar', descripcion: 'Actualizó referencia de pago', antes: 'REF-102', despues: 'REF-103' },
  { id: 1006, fecha: '2026-10-10 09:45', usuario: 'María García', rol: 'Recepcionista', sede: 'Centro', modulo: 'Clientes', accion: 'Crear', descripcion: 'Registró un nuevo cliente', antes: '', despues: 'Cliente #126' },
  { id: 1007, fecha: '2026-10-10 10:00', usuario: 'Pedro Martínez', rol: 'Administrador', sede: 'Norte', modulo: 'Membresías', accion: 'Modificar', descripcion: 'Cambió la duración de una membresía', antes: '1 Mes', despues: '3 Meses' },
  { id: 1008, fecha: '2026-10-10 10:15', usuario: 'Sofía Hernández', rol: 'Gerente', sede: 'Sur', modulo: 'Empleados', accion: 'Crear', descripcion: 'Registró un nuevo entrenador', antes: '', despues: 'Empleado #45' },
  { id: 1009, fecha: '2026-10-10 10:30', usuario: 'Jorge Ramírez', rol: 'Recepcionista', sede: 'Centro', modulo: 'Pagos', accion: 'Crear', descripcion: 'Registró un pago mensual', antes: '', despues: 'Pago #305 - $500' },
  { id: 1010, fecha: '2026-10-10 10:45', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Configuración', accion: 'Modificar', descripcion: 'Actualizó el horario de apertura', antes: '06:00', despues: '05:30' },
  { id: 1011, fecha: '2026-10-10 11:00', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Clientes', accion: 'Modificar', descripcion: 'Actualizó el teléfono de un cliente', antes: '4811234567', despues: '4819876543' },
  { id: 1012, fecha: '2026-10-10 11:15', usuario: 'Luis Torres', rol: 'Gerente', sede: 'Sur', modulo: 'Promociones', accion: 'Crear', descripcion: 'Registró una promoción de inscripción', antes: '', despues: 'Descuento del 20%' },
  { id: 1013, fecha: '2026-10-10 11:30', usuario: 'María García', rol: 'Recepcionista', sede: 'Centro', modulo: 'Asistencias', accion: 'Crear', descripcion: 'Registró la entrada de un cliente', antes: '', despues: 'Entrada 11:30' },
  { id: 1014, fecha: '2026-10-10 11:45', usuario: 'Pedro Martínez', rol: 'Administrador', sede: 'Norte', modulo: 'Empleados', accion: 'Modificar', descripcion: 'Actualizó el puesto de un empleado', antes: 'Recepcionista', despues: 'Supervisor' },
  { id: 1015, fecha: '2026-10-10 12:00', usuario: 'Sofía Hernández', rol: 'Gerente', sede: 'Sur', modulo: 'Inventario', accion: 'Crear', descripcion: 'Registró nuevo equipo de gimnasio', antes: '', despues: 'Caminadora #12' },
  { id: 1016, fecha: '2026-10-10 12:15', usuario: 'Jorge Ramírez', rol: 'Recepcionista', sede: 'Centro', modulo: 'Pagos', accion: 'Modificar', descripcion: 'Corrigió el monto de un pago', antes: '$450', despues: '$500' },
  { id: 1017, fecha: '2026-10-10 12:30', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Usuarios', accion: 'Crear', descripcion: 'Creó una cuenta de empleado', antes: '', despues: 'Usuario #78' },
  { id: 1018, fecha: '2026-10-10 12:45', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Membresías', accion: 'Modificar', descripcion: 'Renovó una membresía vencida', antes: 'Vencida', despues: 'Activa' },
  { id: 1019, fecha: '2026-10-10 13:00', usuario: 'Luis Torres', rol: 'Gerente', sede: 'Sur', modulo: 'Inventario', accion: 'Modificar', descripcion: 'Actualizó el estado de una máquina', antes: 'Disponible', despues: 'Mantenimiento' },
  { id: 1020, fecha: '2026-10-10 13:15', usuario: 'María García', rol: 'Recepcionista', sede: 'Centro', modulo: 'Clientes', accion: 'Modificar', descripcion: 'Actualizó el correo de un cliente', antes: 'cliente1@example.com', despues: 'cliente2@example.com' },
  { id: 1021, fecha: '2026-10-10 13:30', usuario: 'Pedro Martínez', rol: 'Administrador', sede: 'Norte', modulo: 'Promociones', accion: 'Eliminar', descripcion: 'Eliminó una promoción vencida', antes: 'Promoción octubre', despues: 'Eliminada' },
  { id: 1022, fecha: '2026-10-10 13:45', usuario: 'Sofía Hernández', rol: 'Gerente', sede: 'Sur', modulo: 'Horarios', accion: 'Modificar', descripcion: 'Cambió el horario de una clase', antes: '17:00', despues: '18:00' },
  { id: 1023, fecha: '2026-10-10 14:00', usuario: 'Jorge Ramírez', rol: 'Recepcionista', sede: 'Centro', modulo: 'Pagos', accion: 'Crear', descripcion: 'Registró un pago quincenal', antes: '', despues: 'Pago #306 - $250' },
  { id: 1024, fecha: '2026-10-10 14:15', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Configuración', accion: 'Modificar', descripcion: 'Actualizó el límite de usuarios', antes: '500', despues: '1000' },
  { id: 1025, fecha: '2026-10-10 14:30', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Clientes', accion: 'Crear', descripcion: 'Registró un cliente nuevo', antes: '', despues: 'Cliente #127' },
  { id: 1026, fecha: '2026-10-10 14:45', usuario: 'Luis Torres', rol: 'Gerente', sede: 'Sur', modulo: 'Reportes', accion: 'Eliminar', descripcion: 'Exportó el reporte de ingresos', antes: '', despues: 'Reporte PDF generado' },
  { id: 1027, fecha: '2026-10-10 15:00', usuario: 'María García', rol: 'Recepcionista', sede: 'Centro', modulo: 'Asistencias', accion: 'Crear', descripcion: 'Registró la salida de un cliente', antes: '', despues: 'Salida 15:00' },
  { id: 1028, fecha: '2026-10-10 15:15', usuario: 'Pedro Martínez', rol: 'Administrador', sede: 'Norte', modulo: 'Usuarios', accion: 'Modificar', descripcion: 'Cambió los permisos de un usuario', antes: 'Recepcionista', despues: 'Gerente' },
  { id: 1029, fecha: '2026-10-10 15:30', usuario: 'Sofía Hernández', rol: 'Gerente', sede: 'Sur', modulo: 'Inventario', accion: 'Eliminar', descripcion: 'Retiró equipo fuera de servicio', antes: 'Bicicleta #08', despues: 'Equipo retirado' },
  { id: 1030, fecha: '2026-10-10 15:45', usuario: 'Jorge Ramírez', rol: 'Recepcionista', sede: 'Centro', modulo: 'Pagos', accion: 'Modificar', descripcion: 'Cambió el método de pago', antes: 'Efectivo', despues: 'Transferencia' },
  { id: 1031, fecha: '2026-10-10 16:00', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Sistema', accion: 'Acceso', descripcion: 'Inició sesión administrativa', antes: '', despues: 'Sesión iniciada' },
  { id: 1032, fecha: '2026-10-10 16:15', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Membresías', accion: 'Modificar', descripcion: 'Cambió el tipo de membresía', antes: 'Mensual', despues: 'Quincenal' },
  { id: 1033, fecha: '2026-10-10 16:30', usuario: 'Luis Torres', rol: 'Gerente', sede: 'Sur', modulo: 'Empleados', accion: 'Modificar', descripcion: 'Actualizó el horario de un entrenador', antes: '08:00 - 14:00', despues: '09:00 - 15:00' },
  { id: 1034, fecha: '2026-10-10 16:45', usuario: 'María García', rol: 'Recepcionista', sede: 'Centro', modulo: 'Clientes', accion: 'Modificar', descripcion: 'Actualizó la dirección de un cliente', antes: 'Colonia Centro', despues: 'Colonia Obrera' },
  { id: 1035, fecha: '2026-10-10 17:00', usuario: 'Pedro Martínez', rol: 'Administrador', sede: 'Norte', modulo: 'Configuración', accion: 'Modificar', descripcion: 'Actualizó el horario de cierre', antes: '22:00', despues: '23:00' },
  { id: 1036, fecha: '2026-10-10 17:15', usuario: 'Sofía Hernández', rol: 'Gerente', sede: 'Sur', modulo: 'Promociones', accion: 'Modificar', descripcion: 'Actualizó el descuento promocional', antes: '10%', despues: '15%' },
  { id: 1037, fecha: '2026-10-10 17:30', usuario: 'Jorge Ramírez', rol: 'Recepcionista', sede: 'Centro', modulo: 'Pagos', accion: 'Crear', descripcion: 'Registró un pago de inscripción', antes: '', despues: 'Pago #307 - $300' },
  { id: 1038, fecha: '2026-10-10 17:45', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Usuarios', accion: 'Modificar', descripcion: 'Desactivó una cuenta de usuario', antes: 'Activo', despues: 'Inactivo' },
  { id: 1039, fecha: '2026-10-10 18:00', usuario: 'Carlos Ruiz', rol: 'Recepcionista', sede: 'Norte', modulo: 'Clientes', accion: 'Modificar', descripcion: 'Actualizó el estado de un cliente', antes: 'Pendiente', despues: 'Activo' },
  { id: 1040, fecha: '2026-10-10 18:15', usuario: 'Luis Torres', rol: 'Gerente', sede: 'Sur', modulo: 'Reportes', accion: 'Crear', descripcion: 'Descargó el reporte de asistencias', antes: '', despues: 'Reporte Excel generado' },
  { id: 1041, fecha: '2026-10-10 18:30', usuario: 'María García', rol: 'Recepcionista', sede: 'Centro', modulo: 'Membresías', accion: 'Crear', descripcion: 'Asignó una membresía trimestral', antes: '', despues: 'Membresía 3 Meses' },
  { id: 1042, fecha: '2026-10-10 18:45', usuario: 'Pedro Martínez', rol: 'Administrador', sede: 'Norte', modulo: 'Sistema', accion: 'Acceso', descripcion: 'Cerró sesión administrativa', antes: 'Sesión activa', despues: 'Sesión cerrada' },
  { id: 1043, fecha: '2026-10-10 19:00', usuario: 'Sofía Hernández', rol: 'Gerente', sede: 'Sur', modulo: 'Horarios', accion: 'Crear', descripcion: 'Programó una clase de spinning', antes: '', despues: 'Clase 19:00 - 20:00' },
  { id: 1044, fecha: '2026-10-10 19:15', usuario: 'Jorge Ramírez', rol: 'Recepcionista', sede: 'Centro', modulo: 'Pagos', accion: 'Modificar', descripcion: 'Corrigió la referencia de una transferencia', antes: 'REF-205', despues: 'REF-250' },
  { id: 1045, fecha: '2026-10-10 19:30', usuario: 'Ana López', rol: 'Administrador', sede: 'Centro', modulo: 'Sistema', accion: 'Acceso', descripcion: 'Cerró sesión del sistema', antes: 'Sesión activa', despues: 'Sesión cerrada' }
]);


const actionEN: Record<Action, string> = { Crear: 'Create', Modificar: 'Modify', Eliminar: 'Delete', Acceso: 'Login' };
const actions: Action[] = ['Crear', 'Modificar', 'Eliminar', 'Acceso'];
const actionClass = (a: Action) => ({ Crear: 'tag-green', Modificar: 'tag-blue', Eliminar: 'tag-red', Acceso: 'tag-purple' }[a]);

const search = ref('');
const branch = ref('');
const action = ref('');
const date = ref('');
const page = ref(1);
const selected = ref<Audit | null>(null);

const branches = computed(() => [...new Set(records.value.map(x => x.sede))]);
const scoped = computed(() => records.value.filter(x => !branch.value || x.sede === branch.value));
const filtered = computed(() => {
  const term = search.value.toLowerCase().trim();
  return scoped.value.filter(x =>
    (!action.value || x.accion === action.value) &&
    (!date.value || x.fecha.startsWith(date.value)) &&
    Object.values(x).join(' ').toLowerCase().includes(term)
  );
});
const PAGE_SIZE = 40;
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));
const showPager = computed(() => filtered.value.length > PAGE_SIZE);
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const goPage = (n: number): void => {
  page.value = Math.min(Math.max(1, n), totalPages.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const hasFilters = computed(() => !!(search.value || branch.value || action.value || date.value));

watch([search, branch, action, date], () => { page.value = 1; });
watch(totalPages, n => { if (page.value > n) page.value = n; });

const reset = () => { search.value = ''; branch.value = ''; action.value = ''; date.value = ''; };

const stats = computed(() => [
  { label: tx('Total de eventos', 'Total events'), value: String(scoped.value.length), tone: 'blue' },
  { label: tx('Modificaciones', 'Modifications'), value: String(scoped.value.filter(x => x.accion === 'Modificar').length), tone: 'green' },
  { label: tx('Eliminaciones', 'Deletions'), value: String(scoped.value.filter(x => x.accion === 'Eliminar').length), tone: 'red' },
  { label: tx('Usuarios involucrados', 'Users involved'), value: String(new Set(scoped.value.map(x => x.usuario)).size), tone: 'purple' }
]);

const detailRows = computed(() => {
  const s = selected.value;
  if (!s) return [];
  return [
    { k: 'ID', v: String(s.id) },
    { k: tx('Fecha', 'Date'), v: s.fecha },
    { k: tx('Usuario', 'User'), v: s.usuario },
    { k: tx('Rol', 'Role'), v: s.rol },
    { k: tx('Sucursal', 'Branch'), v: s.sede },
    { k: tx('Módulo', 'Module'), v: s.modulo },
    { k: tx('Acción', 'Action'), v: tx(s.accion, actionEN[s.accion]) },
    { k: tx('Descripción', 'Description'), v: s.descripcion },
    { k: tx('Valor anterior', 'Previous value'), v: s.antes },
    { k: tx('Valor nuevo', 'New value'), v: s.despues }
  ];
});

const avatarGradients: string[] = [
  'linear-gradient(135deg, #7e22ce, #4c1d95)',
  'linear-gradient(135deg, #ea580c, #9a3412)',
  'linear-gradient(135deg, #db2777, #9d174d)',
  'linear-gradient(135deg, #dc2626, #7f1d1d)',
  'linear-gradient(135deg, #2563eb, #1e3a8a)',
  'linear-gradient(135deg, #059669, #064e3b)'
];
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};
const avatarStyle = (id: number) => ({ backgroundImage: avatarGradients[id % avatarGradients.length] });

</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');

.main-content {
  --tone-main: #34d399;
  --accent: var(--color-highlight, #3b82f6);
  --income: #34d399;
  --card-bg: var(--bg-cards, #121416);
  --radius: var(--app-border-radius, 14px);
  --radius-small: 10px;
  --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent);
  --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);
  --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 68%, transparent);
}

.main-content *,
.main-content *::before,
.main-content *::after { box-sizing: border-box; }

.main-content {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 34px 36px 55px;
  color: var(--color-texto-general, #e5e7eb);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* HEADER */
.header-section { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.title-wrapper { min-width: 240px; display: flex; flex-direction: column; gap: 6px; }
.main-title {
  margin: 0;
  color: var(--color-titulos, #ffffff);
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.title-underline { display: block; width: 58px; height: 3px; margin-top: 2px; border-radius: 999px; background: linear-gradient(90deg, var(--tone-main), transparent); }
.main-subtitle { max-width: 560px; margin: 1px 0 0; color: var(--muted); font-size: 0.82rem; font-weight: 500; line-height: 1.5; }

/* ACCIONES */
.actions-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.search-wrapper, .select-wrapper, .date-wrapper { position: relative; display: flex; align-items: center; }
.search-icon, .select-icon { position: absolute; z-index: 2; left: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }
.select-arrow { position: absolute; z-index: 2; right: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }

.search-input, .status-select, .date-input {
  height: 44px;
  border: 1px solid var(--line);
  border-radius: var(--radius-small);
  background: var(--card-bg);
  color: var(--color-texto-general, #ffffff);
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
  transition: width 0.2s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.search-input:hover, .status-select:hover, .date-input:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 25%, transparent); }
.search-input:focus, .status-select:focus, .date-input:focus {
  border-color: var(--tone-main);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone-main) 16%, transparent);
}

.search-input { width: 240px; padding: 0 38px 0 40px; }
.search-input:focus { width: 270px; }
.search-input::placeholder { color: var(--muted); opacity: 0.68; }

.search-clear {
  position: absolute; right: 10px; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 50%;
  background: color-mix(in srgb, var(--color-texto-general, #ffffff) 10%, transparent);
  color: var(--muted); cursor: pointer; transition: background 0.15s ease;
}
.search-clear:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 20%, transparent); }

.status-select { min-width: 190px; padding: 0 38px 0 40px; appearance: none; -webkit-appearance: none; cursor: pointer; color-scheme: dark; }
.status-select option { background: #111315; color: #ffffff; }

.date-input { min-width: 170px; padding: 0 12px 0 40px; color-scheme: dark; cursor: pointer; }

.btn-ghost {
  height: 44px; padding: 0 14px;
  border: 1px solid var(--line); border-radius: var(--radius-small);
  background: transparent; color: var(--muted);
  font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
  cursor: pointer; transition: background 0.15s ease, color 0.15s ease;
}
.btn-ghost:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 6%, transparent); color: var(--color-texto-general, #ffffff); }

/* BOTÓN PRINCIPAL */
.btn-bulk {
  min-height: 44px; display: inline-flex; align-items: center; gap: 10px;
  padding: 5px 16px 5px 7px;
  border: 1px solid color-mix(in srgb, var(--tone-main) 34%, transparent);
  border-radius: var(--radius-small);
  background: color-mix(in srgb, var(--tone-main) 8%, transparent);
  color: var(--color-texto-general, #ffffff);
  font-family: 'Inter', sans-serif;
  white-space: nowrap; cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.btn-bulk-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 8px; background: color-mix(in srgb, var(--tone-main) 14%, transparent); color: var(--tone-main); }
.btn-text-wrapper { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; line-height: 1.1; }
.btn-label { color: var(--muted); font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.highlight-text-custom { color: var(--tone-main); font-size: 0.88rem; font-weight: 700; letter-spacing: -0.01em; }
.btn-bulk:hover { border-color: color-mix(in srgb, var(--tone-main) 60%, transparent); background: color-mix(in srgb, var(--tone-main) 13%, transparent); box-shadow: 0 8px 20px color-mix(in srgb, var(--tone-main) 10%, transparent); transform: translateY(-1px); }
.btn-bulk:active { transform: translateY(0); }

/* RESUMEN */
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.stat-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 3px; padding: 15px 18px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); }
.stat-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone, var(--accent)); }
.stat-green { --tone: #34d399; }
.stat-blue { --tone: #60a5fa; }
.stat-orange { --tone: #fbbf24; }
.stat-red { --tone: #f87171; }
.stat-purple { --tone: #c084fc; }
.stat-value { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.5rem; font-weight: 600; line-height: 1.15; white-space: nowrap; }
.stat-label { color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }

.desktop-only { display: block; }
.mobile-only { display: none; }

/* TABLA */
.table-container { position: relative; width: 100%; overflow-x: auto; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
.table-container::before { content: ''; position: sticky; display: block; z-index: 3; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--tone-main), transparent); opacity: 0.7; pointer-events: none; }
.user-table { width: 100%; border-collapse: collapse; color: var(--color-texto-general, #e5e7eb); text-align: left; }
.user-table thead { background: color-mix(in srgb, var(--card-bg) 95%, var(--color-texto-general, #ffffff)); }
.user-table th { padding: 15px 18px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.065em; text-transform: uppercase; white-space: nowrap; }
.user-table td { padding: 13px 18px; border-top: 1px solid var(--line-soft); font-size: 0.82rem; vertical-align: middle; }
.user-table tbody tr:first-child td { border-top: none; }
.user-table tbody tr { transition: background 0.17s ease, box-shadow 0.17s ease; }
.th-right, .td-right { text-align: right; }
.nowrap { white-space: nowrap; }
.desc-cell { min-width: 220px; color: var(--color-texto-general, #e5e7eb); }

@media (hover: hover) {
  .user-table tbody tr:hover { background: color-mix(in srgb, var(--tone-main) 4%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--tone-main) 80%, transparent); }
}

/* PAGINACIÓN */
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.pager-btn { width: 40px; height: 40px; display: grid; place-items: center; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-small); background: var(--card-bg); color: var(--color-texto-general, #e5e7eb); cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease; }
.pager-btn:hover:not(:disabled) { border-color: var(--tone-main); background: color-mix(in srgb, var(--tone-main) 12%, transparent); color: var(--color-titulos, #ffffff); transform: translateY(-1px); }
.pager-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pager-info { min-width: 64px; color: var(--muted); font-size: 0.8rem; font-weight: 600; text-align: center; }
.pager-info b { color: var(--color-titulos, #ffffff); font-weight: 700; }
.table-footer { padding: 11px 18px; border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 0.72rem; font-weight: 500; text-align: right; }
.details-cell { display: inline-flex; }

/* AVATAR / TEXTO */
.avatar-small {
  width: 41px; height: 41px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 11px; color: #ffffff;
  font-size: 0.74rem; font-weight: 700; letter-spacing: 0.02em;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24);
}
.person-cell { display: flex; align-items: center; gap: 12px; }
.person-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.small { font-size: 0.72rem; }
.text-bold { color: var(--color-titulos, #ffffff); font-weight: 600; }
.text-muted { color: var(--muted); }
.text-warn { color: #fbbf24; font-weight: 700; }

.type-chip {
  display: inline-flex; align-items: center; min-height: 26px; padding: 3px 10px;
  border: 1px solid var(--line); border-radius: 8px;
  background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent);
  color: var(--color-texto-general, #e5e7eb); font-size: 0.7rem; font-weight: 600; white-space: nowrap;
}

/* ETIQUETAS DE ESTADO */
.status-badge2 { min-height: 26px; display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border: 1px solid; border-radius: 999px; font-size: 0.69rem; font-weight: 650; line-height: 1; white-space: nowrap; }
.tag-purple { color: #c084fc; border-color: rgba(192, 132, 252, 0.25); background: rgba(192, 132, 252, 0.08); }
.tag-orange { color: #fb923c; border-color: rgba(251, 146, 60, 0.25); background: rgba(251, 146, 60, 0.08); }
.tag-yellow { color: #fbbf24; border-color: rgba(251, 191, 36, 0.25); background: rgba(251, 191, 36, 0.08); }
.tag-red { color: #f87171; border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.08); }
.tag-blue { color: #60a5fa; border-color: rgba(96, 165, 250, 0.25); background: rgba(96, 165, 250, 0.08); }
.tag-green { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }

/* MONTO */
.status-badge { min-height: 27px; display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px; border: 1px solid transparent; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.status-badge.income { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.status-badge.income::before { content: ''; width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.12); }

.btn-link { padding: 6px 10px; border: none; border-radius: 8px; background: transparent; color: var(--tone-main); font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; transition: background 0.15s ease; }
.btn-link:hover { background: color-mix(in srgb, var(--tone-main) 10%, transparent); }

.badges-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }

.card-meta { display: flex; flex-direction: column; gap: 7px; color: var(--muted); font-size: 0.78rem; }
.meta-row { min-width: 0; display: flex; align-items: center; gap: 7px; }
.meta-row svg { flex-shrink: 0; opacity: 0.65; }

/* EMPTY */
.empty-state-cell { padding: 0 !important; border-top: none !important; }
.empty-state, .empty-state-mobile { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 45px 20px; color: var(--muted); font-size: 0.82rem; font-weight: 500; text-align: center; }
.empty-state svg, .empty-state-mobile svg { opacity: 0.4; }

/* MODAL DE DETALLE */
.modal-body-custom { }
.modal-icon-container { width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border-radius: 15px; }
.info-bg { border: 1px solid color-mix(in srgb, var(--tone-main) 25%, transparent); background: color-mix(in srgb, var(--tone-main) 10%, transparent); color: var(--tone-main); }
.modal-body-custom h2 { margin: 0 0 14px; color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.25rem; font-weight: 600; }
.detail-list { margin: 0 0 20px; text-align: left; }
.detail-row { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 12px; padding: 10px 0; border-top: 1px solid var(--line-soft); font-size: 0.8rem; }
.detail-row dt { color: var(--muted); font-weight: 600; }
.detail-row dd { margin: 0; color: var(--color-texto-general, #ffffff); overflow-wrap: anywhere; }
.modal-buttons { display: flex; gap: 10px; }
.btn-modal { min-height: 42px; flex: 1; padding: 0 16px; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; transition: background 0.18s ease, transform 0.18s ease; }
.btn-modal.secondary { border: 1px solid var(--line); background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); color: var(--color-texto-general, #d1d5db); }
.btn-modal.secondary:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 8%, transparent); transform: translateY(-1px); }

.search-input:focus-visible, .status-select:focus-visible, .date-input:focus-visible, .btn-bulk:focus-visible,
.btn-modal:focus-visible, .search-clear:focus-visible, .btn-link:focus-visible, .pager-btn:focus-visible { outline: 2px solid var(--tone-main); outline-offset: 2px; }

/* TABLET */
@media (max-width: 1150px) {
  .main-content { padding: 30px 24px 48px; }
  .header-section { align-items: flex-start; flex-direction: column; gap: 17px; }
  .actions-bar { width: 100%; justify-content: flex-start; }
  .search-wrapper { flex: 1; min-width: 220px; }
  .search-input, .search-input:focus { width: 100%; }
}

/* MÓVIL */
@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .main-content { width: 100%; max-width: 100%; padding: 20px 14px 36px; overflow-x: hidden; }
  .header-section { width: 100%; align-items: stretch; margin-bottom: 16px; }
  .title-wrapper { width: 100%; min-width: 0; }
  .main-title { font-size: 1.85rem; }
  .main-subtitle { max-width: 100%; font-size: 0.76rem; }

  .actions-bar { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .search-wrapper { width: 100%; min-width: 0; grid-column: 1 / -1; grid-row: 1; }
  .search-input, .search-input:focus { width: 100%; }
  .select-wrapper, .date-wrapper { width: 100%; min-width: 0; }
  .status-select, .date-input { width: 100%; min-width: 0; text-overflow: ellipsis; }
  .btn-ghost, .btn-bulk { width: 100%; min-width: 0; grid-column: 1 / -1; min-height: 44px; }

  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 14px; }
  .stat-card { padding: 12px 14px; }
  .stat-value { font-size: 1.2rem; }

  .user-card { position: relative; width: 100%; overflow: hidden; margin-bottom: 11px; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 9px 28px rgba(0, 0, 0, 0.17); }
  .user-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone-main); }
  .card-top-section { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
  .user-card .avatar-small { width: 44px; height: 44px; border-radius: 12px; font-size: 0.78rem; }
  .card-user-titles { min-width: 0; display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 7px; }
  .name-text { width: 100%; overflow: hidden; color: var(--color-titulos, #ffffff); font-size: 0.88rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
  .card-meta { display: grid; gap: 8px; padding: 11px 12px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent); font-size: 0.75rem; }
  .btn-card { width: 100%; min-height: 40px; margin-top: 11px; border: 1px solid color-mix(in srgb, var(--tone-main) 30%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--tone-main) 8%, transparent); color: var(--tone-main); font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; }
  .empty-state-mobile { min-height: 240px; margin-top: 8px; border: 1px dashed var(--line); border-radius: var(--radius); background: var(--card-bg); }
  .detail-row { grid-template-columns: 110px minmax(0, 1fr); }
}

/* TELÉFONOS */
@media (max-width: 560px) {
  .main-content { padding: 17px 11px 30px; }
  .main-title { font-size: 1.7rem; }
  .actions-bar { grid-template-columns: 1fr; }
  .search-wrapper, .select-wrapper, .date-wrapper, .btn-bulk, .btn-ghost { grid-column: 1; }
  .search-wrapper { grid-row: auto; }
  .user-card { padding: 15px; }
}

@media (max-width: 380px) {
  .main-content { padding-left: 9px; padding-right: 9px; }
  .main-title { font-size: 1.55rem; }
  .stat-value { font-size: 1.05rem; }
  .status-badge, .status-badge2 { font-size: 0.65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .search-input, .status-select, .date-input, .btn-bulk, .user-table tbody tr, .btn-modal, .pager-btn { transition: none !important; }
}
.main-content.tone-blue{--tone-main:#60a5fa}

/* ---------- Modal propio ---------- */
.rep-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(4, 4, 8, 0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.rep-modal { position: relative; width: min(460px, 100%); max-height: min(86vh, 720px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid color-mix(in srgb, var(--color-texto-general, #fff) 14%, transparent); border-radius: calc(var(--app-border-radius, 16px) * 1.1); background: var(--bg-cards, #121212); box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8); }
.rep-close { position: absolute; top: 14px; right: 14px; z-index: 2; width: 34px; height: 34px; display: grid; place-items: center; padding: 0; border: 1px solid color-mix(in srgb, var(--color-texto-general, #fff) 14%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--color-texto-general, #fff) 7%, transparent); color: var(--color-texto-general, #cbd5e1); cursor: pointer; transition: background .18s ease, color .18s ease, transform .18s ease, border-color .18s ease; }
.rep-close:hover { background: color-mix(in srgb, var(--tone-main, #34d399) 18%, transparent); border-color: color-mix(in srgb, var(--tone-main, #34d399) 55%, transparent); color: var(--color-titulos, #fff); transform: rotate(90deg); }
.rep-close:focus-visible { outline: 2px solid var(--tone-main, #34d399); outline-offset: 2px; }
.rep-scroll { overflow-y: auto; overscroll-behavior: contain; padding: 34px 28px 26px; text-align: center; color: var(--color-texto-general, #fff); scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--color-texto-general, #fff) 30%, transparent) transparent; scrollbar-gutter: stable both-edges; }
.rep-scroll::-webkit-scrollbar { width: 8px; }
.rep-scroll::-webkit-scrollbar-track { background: transparent; margin: 18px 0; }
.rep-scroll::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: color-mix(in srgb, var(--color-texto-general, #fff) 26%, transparent); background-clip: content-box; }
.rep-scroll::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--tone-main, #34d399) 75%, transparent); background-clip: content-box; }
.rep-pop-enter-active, .rep-pop-leave-active { transition: opacity .18s ease; }
.rep-pop-enter-active .rep-modal, .rep-pop-leave-active .rep-modal { transition: transform .2s cubic-bezier(.2,.8,.2,1), opacity .18s ease; }
.rep-pop-enter-from, .rep-pop-leave-to { opacity: 0; }
.rep-pop-enter-from .rep-modal, .rep-pop-leave-to .rep-modal { transform: translateY(14px) scale(.97); opacity: 0; }
@media (max-width: 560px) { .rep-overlay { padding: 12px; } .rep-scroll { padding: 30px 18px 22px; } }
@media (prefers-reduced-motion: reduce) { .rep-close, .rep-pop-enter-active, .rep-pop-leave-active, .rep-pop-enter-active .rep-modal, .rep-pop-leave-active .rep-modal { transition: none !important; } }
</style>