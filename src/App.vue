<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import BottomNav from './components/BottomNav.vue';
import QuickAddFAB from './components/QuickAddFAB.vue';
import AddTransactionModal from './components/AddTransactionModal.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoginRoute = computed(() => route.path === '/login');
const showNavigation = computed(() => authStore.isAuthenticated && !isLoginRoute.value);

const showAddModal = ref(false);
const openAddModal = () => { showAddModal.value = true; };
const closeAddModal = () => { showAddModal.value = false; };

import { useSettingsStore } from './stores/settings';

// بمجرد أن يتأكد Firebase من الجلسة، نوجه المستخدم للصفحة الصحيحة
watch(() => authStore.authReady, (ready) => {
  if (!ready) return;
  if (authStore.isAuthenticated) {
    const settingsStore = useSettingsStore();
    settingsStore.fetchSettings();
  }

  if (authStore.isAuthenticated && isLoginRoute.value) {
    router.replace('/');
  } else if (!authStore.isAuthenticated && !isLoginRoute.value) {
    router.replace('/login');
  }
});
</script>

<template>
  <!-- شاشة التحميل أثناء التحقق من الجلسة — تمنع أي توجيه خاطئ -->
  <div v-if="!authStore.authReady" class="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div class="text-5xl">💰</div>
    <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    <p class="text-slate-400 text-sm">أموالي</p>
  </div>

  <div v-else class="min-h-screen bg-slate-950 text-white font-cairo safe-top pb-24">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <template v-if="showNavigation">
      <BottomNav />
      <QuickAddFAB @click="openAddModal" />
      <AddTransactionModal :show="showAddModal" @close="closeAddModal" />
    </template>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
