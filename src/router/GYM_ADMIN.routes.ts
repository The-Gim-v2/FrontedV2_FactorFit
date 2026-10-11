export const GYM_ADMINRoutes = [
  {
    path: '/GYM_ADMIN',
    component: () => import('@/views/GYM_ADMIN/GYM_ADMINLayout.vue'),
    meta: { allowedRole: 'GYM_ADMIN' },
    children: [
      // --- DASHBOARD ---
      {
        path: 'dashboard',
        name: 'GYM_ADMIN-dashboard',
        component: () => import('@/components/GYM_ADMIN/Dashboard.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },

      // --- GRUPO DE REGISTRO ---
      {
        path: 'register-clients',
        name: 'GYM_ADMIN-register-clients',
        component: () => import('@/components/GYM_ADMIN/Register/RegisterClients.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'register-staff',
        name: 'GYM_ADMIN-register-staff',
        component: () => import('@/components/GYM_ADMIN/Register/RegisterStaff.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },

      // --- GRUPO DE VISTAS DE USUARIOS ---
      {
        path: 'view-clients',
        name: 'GYM_ADMIN-view-clients',
        component: () => import('@/components/GYM_ADMIN/Views/ViewClients.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'view-staff',
        name: 'GYM_ADMIN-view-staff',
        component: () => import('@/components/GYM_ADMIN/Views/ViewStaff.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },

      // --- GRUPO DE EDICIONES Y ACCIONES POR ID ---
      {
        path: 'editar-usuario/:id',
        name: 'GYM_ADMIN-edit-user',
        component: () => import('@/components/GYM_ADMIN/Edits/EditUser.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'editar-staff/:id',
        name: 'GYM_ADMIN-edit-staff',
        component: () => import('@/components/GYM_ADMIN/Edits/EditStaff.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'pay/:id',
        name: 'GYM_ADMIN-pay',
        component: () => import('@/components/GYM_ADMIN/Payments/Payments.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'recovery/:id',
        name: 'GYM_ADMIN-recovery',
        component: () => import('@/components/GYM_ADMIN/Componets/Account-Recovery.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'statistics/:id',
        name: 'GYM_ADMIN-statistics',
        component: () => import('@/components/GYM_ADMIN/Statistics/Statistics.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'mail/:id',
        name: 'GYM_ADMIN-mail',
        component: () => import('@/components/GYM_ADMIN/Componets/Mail.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },

      // --- BITÁCORAS Y REPORTES ---
      {
        path: 'attendance',
        name: 'GYM_ADMIN-attendance-log',
        component: () => import('@/components/GYM_ADMIN/Bitacora/AttendanceLog.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'debtors',
        name: 'GYM_ADMIN-debtors-list',
        component: () => import('@/components/GYM_ADMIN/Bitacora/DebtorsList.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'renewals',
        name: 'GYM_ADMIN-renewals',
        component: () => import('@/components/GYM_ADMIN/Bitacora/Renewals.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'revenue',
        name: 'GYM_ADMIN-revenue-log',
        component: () => import('@/components/GYM_ADMIN/Bitacora/RevenueLog.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      // --- BITÁCORAS Y REPORTES ADICIONALES ---
      {
        path: 'audit-log',
        name: 'GYM_ADMIN-audit-log',
        component: () => import('@/components/GYM_ADMIN/Bitacora/AuditLog.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'cash-history',
        name: 'GYM_ADMIN-cash-history',
        component: () => import('@/components/GYM_ADMIN/Bitacora/CashHistory.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'membership-history',
        name: 'GYM_ADMIN-membership-history',
        component: () => import('@/components/GYM_ADMIN/Bitacora/MembershipHistory.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      // --- FINANZAS, PAGOS Y CORTES ---
      {
        path: 'payments',
        name: 'GYM_ADMIN-payments',
        component: () => import('@/components/GYM_ADMIN/Payments/PaymentsList.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'earnings',
        name: 'GYM_ADMIN-earnings',
        component: () => import('@/components/GYM_ADMIN/Componets/Earnings.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'cut',
        name: 'GYM_ADMIN-cut',
        component: () => import('@/components/GYM_ADMIN/Componets/Cut.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },

      // --- CONFIGURACIÓN Y GESTIÓN ---
      {
        path: 'pricing',
        name: 'GYM_ADMIN-pricing-management',
        component: () => import('@/components/GYM_ADMIN/ConfigGYM_ADMIN/PricingManagement.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'fees',
        name: 'GYM_ADMIN-fees-management',
        component: () => import('@/components/GYM_ADMIN/ConfigGYM_ADMIN/FeesManagement.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'settings',
        name: 'GYM_ADMIN-settings',
        component: () => import('@/components/GYM_ADMIN/Settings.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },

      // --- HERRAMIENTAS ADICIONALES Y MARKETING ---
      {
        path: 'graph',
        name: 'GYM_ADMIN-graph',
        component: () => import('@/components/GYM_ADMIN/Componets/Attendance.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'bulk-email',
        name: 'GYM_ADMIN-bulk-email',
        component: () => import('@/components/GYM_ADMIN/Componets/Bulk-Email.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'promos',
        name: 'GYM_ADMIN-promos',
        component: () => import('@/components/GYM_ADMIN/Payments/Promos.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'help',
        name: 'GYM_ADMIN-help',
        component: () => import('@/components/GYM_ADMIN/Componets/Help.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      },
      {
        path: 'profile',
        name: 'GYM_ADMIN-profile',
        component: () => import('@/components/GYM_ADMIN/Componets/Profile.vue'),
        meta: { allowedRole: 'GYM_ADMIN' }
      }
    ]
  }
];