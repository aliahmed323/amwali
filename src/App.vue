<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

// Import components (assuming they will be created)
import BottomNav from './components/BottomNav.vue';
import QuickAddFAB from './components/QuickAddFAB.vue';
import AddTransactionModal from './components/AddTransactionModal.vue';

const route = useRoute();
const authStore = useAuthStore();

const isLoginRoute = computed(() => route.path === '/login');
const showNavigation = computed(() => authStore.isAuthenticated && !isLoginRoute.value);

const showAddModal = ref(false);

const openAddModal = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white font-cairo safe-top pb-24">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Navigation and Quick Add for authenticated users -->
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
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
