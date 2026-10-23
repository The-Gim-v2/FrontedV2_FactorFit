import { createRouter, createWebHistory } from 'vue-router'
import { GYM_ACCOUNTRoutes } from './GYM_ACCOUNT.routes.ts'
import { GYM_RECEPCIONISTRoutes } from './GYM_RECEPCIONIST.route.ts'
import { GYM_ADMINRoutes } from './GYM_ADMIN.routes.ts'
import { GYM_MANAGERRoutes } from './GYM_MANAGER.routes.ts'
import { AdminRoutes } from './admin.routes.ts'
import { MemberRoutes } from './members.routes.ts'
import Main from '@/landing/Main.vue'
import Login from '@/landing/Menu/Login.vue'
import RecoverPassword from '@/landing/Menu/Recover-password.vue'
import Record from '@/landing/Menu/Record.vue'
import LoginClient from '@/components/Login.vue'
import RecoverPasswordClient from '@/components/Record/Recover-password.vue'
import RecordClient from '@/components/Record/Record-Client.vue'

const dashboardRoutes: Record<string, string> = {
  GYM_ACCOUNT: 'GYM_ACCOUNT-dashboard',
  GYM_RECEPCIONIST: 'GYM_RECEPCIONIST-dashboard',
  GYM_ADMIN: 'GYM_ADMIN-dashboard',
  GYM_MANAGER: 'GYM_MANAGER-dashboard',
  Admin: 'Admin-dashboard',
  Member: 'Member-dashboard'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Main },
    { path: '/login', name: 'login', component: Login },
    { path: '/recover-password', name: 'recover-password', component: RecoverPassword },
    { path: '/record', name: 'record', component: Record },
    { path: '/loginclient', name: 'loginclient', component: LoginClient },
    { path: '/recover-password-client', name: 'recover-password-client', component: RecoverPasswordClient },
    { path: '/record-client', name: 'record-client', component: RecordClient },
    ...GYM_ACCOUNTRoutes,
    ...GYM_RECEPCIONISTRoutes,
    ...AdminRoutes,
    ...GYM_ADMINRoutes,
    ...GYM_MANAGERRoutes,
    ...MemberRoutes,
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/components/NotFound.vue') }
  ]
})

const clearSession = () => {
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('user_role')
  sessionStorage.removeItem('gym_account')
  localStorage.removeItem('user_role')
}

router.beforeEach((to) => {
  const token = sessionStorage.getItem('auth_token')
  const userRole = sessionStorage.getItem('user_role')?.trim()
  const requiredRole = to.meta.allowedRole as string | undefined
  const dashboard = userRole ? dashboardRoutes[userRole] : undefined

  if (requiredRole) {
    if (!token || !userRole) {
      clearSession()
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (userRole !== requiredRole) {
      if (dashboard && router.hasRoute(dashboard) && to.name !== dashboard) return { name: dashboard }
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  if ((to.name === 'login' || to.name === 'loginclient') && token && dashboard && router.hasRoute(dashboard)) {
    return { name: dashboard }
  }

  return true
})

router.onError((error, to) => {
  console.error('Error de navegación:', to.fullPath, error)
})

export default router