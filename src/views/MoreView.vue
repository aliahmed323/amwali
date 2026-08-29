<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="المزيد" />

    <div class="p-4 space-y-6">
      
      <!-- Menu List -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <router-link to="/wallets" class="flex items-center gap-4 p-4 hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">💳</div>
          <div class="flex-1 font-medium text-slate-200">المحافظ</div>
          <div class="text-slate-500 text-sm transform -scale-x-100">➜</div>
        </router-link>
        
        <router-link to="/reports" class="flex items-center gap-4 p-4 hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">📊</div>
          <div class="flex-1 font-medium text-slate-200">التقارير</div>
          <div class="text-slate-500 text-sm transform -scale-x-100">➜</div>
        </router-link>
        
        <router-link to="/debts" class="flex items-center gap-4 p-4 hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">🤝</div>
          <div class="flex-1 font-medium text-slate-200">الديون</div>
          <div class="text-slate-500 text-sm transform -scale-x-100">➜</div>
        </router-link>
        
        <router-link to="/savings-groups" class="flex items-center gap-4 p-4 hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">🔄</div>
          <div class="flex-1 font-medium text-slate-200">الجمعيات</div>
          <div class="text-slate-500 text-sm transform -scale-x-100">➜</div>
        </router-link>

        <button @click="showCalculator = true" class="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">🧮</div>
          <div class="flex-1 font-medium text-start text-slate-200">الحاسبة</div>
          <div class="text-slate-500 text-sm transform -scale-x-100">➜</div>
        </button>
      </div>

      <!-- User Info & Logout -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
          {{ authStore.userInitial }}
        </div>
        <h3 class="text-lg font-bold text-white mb-1">{{ authStore.userName }}</h3>
        <p class="text-sm text-slate-400 mb-6">{{ authStore.user?.email }}</p>
        
        <button @click="showLogoutConfirm = true" class="w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-medium rounded-xl py-3 border border-rose-500/20 transition-colors">
          تسجيل الخروج
        </button>
        <p class="text-xs text-slate-500 mt-4">الإصدار v3.0.0</p>
      </div>
    </div>

    <!-- Calculator Modal -->
    <CalculatorModal 
      :show="showCalculator" 
      @close="showCalculator = false"
    />

    <!-- Logout Confirmation -->
    <ConfirmDialog
      :show="showLogoutConfirm"
      title="تسجيل الخروج"
      message="هل أنت متأكد من رغبتك في تسجيل الخروج من التطبيق؟"
      confirmText="تسجيل الخروج"
      variant="danger"
      @confirm="handleLogout"
      @cancel="showLogoutConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TopBar from '@/components/TopBar.vue'
import CalculatorModal from '@/components/CalculatorModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

const showCalculator = ref(false)
const showLogoutConfirm = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  showLogoutConfirm.value = false
  router.push('/login')
}
</script>
