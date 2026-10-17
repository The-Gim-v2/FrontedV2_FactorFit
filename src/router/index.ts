import { createRouter, createWebHistory } from 'vue-router'
import { GYM_ACCOUNTRoutes } from './GYM_ACCOUNT.routes.ts'
import { GYM_RECEPCIONISTRoutes } from './GYM_RECEPCIONIST.route.ts'
import { GYM_ADMINRoutes } from './GYM_ADMIN.routes.ts'
import { GYM_MANAGERRoutes } from './GYM_MANAGER.routes.ts'
import { AdminRoutes } from './admin.routes.ts'
import { MemberRoutes } from './members.routes.ts' 

// Vistas públicas y de aterrizaje (Landing)
import Main from '@/landing/Main.vue'
import Login from '@/landing/Menu/Login.vue'
import RecoverPassword from '@/landing/Menu/Recover-password.vue'
import Record from '@/landing/Menu/Record.vue'

// Vistas de acceso para clientes/miembros
import LoginClient from '@/components/Login.vue'
import RecoverPasswordClient from '@/components/Record/Recover-password.vue'
import RecordClient from '@/components/Record/Record-Client.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- RUTAS PÚBLICAS Y LANDING ---
    {
      path: '/',
      name: 'home',
      component: Main,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/recover-password',
      name: 'recover-password',
      component: RecoverPassword,
    },
    {
      path: '/record',
      name: 'record',
      component: Record,
    },

    // --- RUTAS DE AUTENTICACIÓN / REGISTRO DE CLIENTES ---
    {
      path: '/loginclient',
      name: 'loginclient', 
      component: LoginClient,
    },
    {
      path: '/recover-password-client',
      name: 'recover-password-client',
      component: RecoverPasswordClient,
    },
    {
      path: '/record-client', 
      name: 'record-client',
      component: RecordClient,
    },
    //{
        //path: '/prueba-mascotas',
        //name: 'prueba-mascotas',
        //component: () => import('@/components/PruebaMascotas.vue')
      //},
    // --- MÓDULOS DEL SISTEMA (Spread de rutas por roles) ---
    ...GYM_ACCOUNTRoutes,
    ...GYM_RECEPCIONISTRoutes,
    ...AdminRoutes,
    ...GYM_ADMINRoutes,
    ...GYM_MANAGERRoutes,
    ...MemberRoutes, 

    // --- RUTA 404 (Not Found) ---
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/components/NotFound.vue') 
    }
  ],
})

// Guardia global de navegación blindada
router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('user_role');
  const roleRequerido = to.meta.allowedRole as string | undefined;

  // Si la ruta requiere un rol específico
  if (roleRequerido) {
    // Si no hay sesión o el rol no coincide, fuera al login
    if (!userRole || userRole !== roleRequerido) {
      localStorage.removeItem('user_role');
      return next({ name: 'login' });
    }
  }

  // Si ya está logueado e intenta ir al login por la URL de forma forzada, lo regresamos a su panel
  if (to.name === 'login' && userRole) {
    if (userRole === 'GYM_ACCOUNT') return next({ name: 'GYM_ACCOUNT-dashboard' }); // Ajusta el nombre de tu ruta de GYM_ACCOUNT
    if (userRole === 'GYM_RECEPCIONIST') return next({ name: 'GYM_RECEPCIONIST-dashboard' }); // Ajusta según tus rutas
    if (userRole === 'Admin') return next({ name: 'Admin-dashboard' }); // Ajusta según tus rutas
    if (userRole === 'GYM_ADMIN') return next({ name: 'GYM_ADMIN-dashboard' });
    if (userRole === 'Member') return next({ name: 'Member-dashboard' }); // Ajusta según tus rutas
    if (userRole === 'GYM_MANAGER') return next({ name: 'GYM_MANAGER-dashboard' }); // Ajusta según tus rutas
  }

  next();
});

export default router