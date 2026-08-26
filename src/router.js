import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('./views/TransactionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wallets',
    name: 'wallets',
    component: () => import('./views/WalletsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cash-boxes',
    name: 'cash-boxes',
    component: () => import('./views/CashBoxesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/debts',
    name: 'debts',
    component: () => import('./views/DebtsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/savings-groups',
    name: 'savings-groups',
    component: () => import('./views/SavingsGroupsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('./views/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/more',
    name: 'more',
    component: () => import('./views/MoreView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
