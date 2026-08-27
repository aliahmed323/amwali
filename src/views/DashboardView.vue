<template>
  <div class="min-h-screen bg-slate-950 pb-24 dir-rtl">
    <TopBar :title="'أموالي'">
      <template #actions>
        <div class="flex items-center space-x-2 space-x-reverse">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {{ authStore.userInitial }}
          </div>
        </div>
      </template>
    </TopBar>

    <main class="px-4 pt-4 space-y-6">
      <!-- Welcome Section -->
      <div>
        <h2 class="text-xl font-bold text-white mb-1">مرحباً يا {{ authStore.userName }} 👋</h2>
        <p class="text-sm text-slate-400">{{ todayDate }}</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4">
        <StatsCard 
          title="إيراد اليوم" 
          :value="formatMoney(transactionsStore.todayIncome)" 
          icon="📥" 
          color="emerald" 
        />
        <StatsCard 
          title="مصروف اليوم" 
          :value="formatMoney(transactionsStore.todayExpense)" 
          icon="📤" 
          color="rose" 
        />
        <StatsCard 
          title="صافي الربح الشهري" 
          :value="formatMoney(transactionsStore.monthlyNetProfit)" 
          icon="📊" 
          color="blue" 
        />
        <StatsCard 
          title="إجمالي الرصيد" 
          :value="formatMoney(walletsStore.totalBalance)" 
          icon="💰" 
          color="amber" 
        />
      </div>

      <!-- Wallets Section -->
      <section v-if="walletsStore.wallets.length > 0">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold text-white">الأرصدة</h3>
          <router-link to="/wallets" class="text-sm text-blue-400 hover:text-blue-300">عرض الكل</router-link>
        </div>
        <div class="flex overflow-x-auto space-x-3 space-x-reverse pb-2 snap-x hide-scrollbar">
          <div 
            v-for="wallet in walletsStore.wallets" 
            :key="wallet.id"
            @click="$router.push('/wallets')"
            class="snap-start shrink-0 w-40 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between cursor-pointer"
          >
            <div class="flex items-center space-x-2 space-x-reverse mb-3">
              <span class="text-xl">{{ wallet.icon }}</span>
              <span class="text-sm text-slate-300 truncate">{{ wallet.name }}</span>
            </div>
            <div class="font-bold text-white text-lg">
              {{ formatMoney(wallet.currentBalance) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Alerts Section -->
      <section v-if="alerts.length > 0" class="space-y-3">
        <h3 class="text-lg font-bold text-white mb-2">تنبيهات</h3>
        <div 
          v-for="(alert, index) in alerts" 
          :key="index"
          class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start space-x-3 space-x-reverse"
        >
          <div class="text-amber-400 mt-0.5">{{ alert.icon }}</div>
          <div class="flex-1">
            <h4 class="text-amber-400 text-sm font-medium">{{ alert.title }}</h4>
            <p class="text-slate-400 text-xs mt-1">{{ alert.message }}</p>
          </div>
        </div>
      </section>

      <!-- مساهمات القاصات اليومية -->
      <section v-if="cashBoxesStore.pendingTodayBoxes.length > 0 || cashBoxesStore.doneTodayBoxes.length > 0">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold text-white">مساهمات اليوم 🎯</h3>
          <router-link to="/cash-boxes" class="text-sm text-blue-400">إدارة</router-link>
        </div>
        <div v-if="cashBoxesStore.pendingTodayBoxes.length > 0" class="space-y-2">
          <div v-for="box in cashBoxesStore.pendingTodayBoxes" :key="box.id"
            class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
            <span class="text-2xl">{{ box.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-amber-400 truncate">{{ box.title }}</p>
              <p class="text-xs text-slate-400">المطلوب: {{ formatMoney(box.dailyAmount) }}</p>
            </div>
            <button @click="addTodayContribution(box)" :disabled="addingId === box.id"
              class="shrink-0 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg">
              {{ addingId === box.id ? '...' : '+ إضافة' }}
            </button>
          </div>
        </div>
        <div v-if="cashBoxesStore.doneTodayBoxes.length > 0" class="space-y-2 mt-2">
          <div v-for="box in cashBoxesStore.doneTodayBoxes" :key="box.id"
            class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
            <span class="text-2xl">{{ box.icon }}</span>
            <div class="flex-1">
              <p class="text-sm font-bold text-emerald-400">{{ box.title }}</p>
              <p class="text-xs text-slate-400">تمت إضافة {{ formatMoney(box.dailyAmount) }} اليوم</p>
            </div>
            <span class="text-xl">✅</span>
          </div>
        </div>
      </section>

      <!-- Cash Boxes Preview -->
      <section v-if="cashBoxesStore.activeBoxes.length > 0">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold text-white">القاصات</h3>
          <router-link to="/cash-boxes" class="text-sm text-blue-400 hover:text-blue-300">عرض الكل</router-link>
        </div>
        <div class="space-y-3">
          <div 
            v-for="box in cashBoxesStore.activeBoxes.slice(0, 3)" 
            :key="box.id"
            @click="$router.push('/cash-boxes')"
            class="bg-slate-900 border border-slate-800 rounded-xl p-3 cursor-pointer"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center space-x-2 space-x-reverse">
                <span>{{ box.icon }}</span>
                <span class="text-sm text-white font-medium">{{ box.title }}</span>
              </div>
              <span class="text-xs text-emerald-400 font-medium">
                {{ Math.round((box.currentAmount / box.targetAmount) * 100) }}%
              </span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div class="bg-emerald-500 h-1.5 rounded-full" :style="{ width: `${Math.min(100, (box.currentAmount / box.targetAmount) * 100)}%` }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Transactions -->
      <section>
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold text-white">آخر المعاملات</h3>
          <router-link to="/transactions" class="text-sm text-blue-400 hover:text-blue-300">عرض الكل</router-link>
        </div>
        
        <div v-if="transactionsStore.recentTransactions.length > 0" class="space-y-3">
          <TransactionItem 
            v-for="tx in transactionsStore.recentTransactions" 
            :key="tx.id" 
            :transaction="tx"
            @delete="transactionsStore.deleteTransaction"
          />
        </div>
        <EmptyState 
          v-else 
          icon="📝" 
          title="لا توجد معاملات" 
          description="لم تقم بإضافة أي معاملات بعد" 
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TopBar from '@/components/TopBar.vue';
import StatsCard from '@/components/StatsCard.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import EmptyState from '@/components/EmptyState.vue';
import { formatMoney, formatDate } from '@/utils/formatters';

import { useAuthStore } from '@/stores/auth';
import { useWalletsStore } from '@/stores/wallets';
import { useTransactionsStore } from '@/stores/transactions';
import { useCashBoxesStore } from '@/stores/cashBoxes';
import { useDebtsStore } from '@/stores/debts';
import { useSavingsGroupsStore } from '@/stores/savingsGroups';

const authStore = useAuthStore();
const walletsStore = useWalletsStore();
const transactionsStore = useTransactionsStore();
const cashBoxesStore = useCashBoxesStore();
const debtsStore = useDebtsStore();
const savingsGroupsStore = useSavingsGroupsStore();

const addingId = ref(null);

const addTodayContribution = async (box) => {
  addingId.value = box.id;
  await cashBoxesStore.addDailyContribution(box.id, walletsStore);
  addingId.value = null;
};

const todayDate = computed(() => {
  return new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

// Generate alerts based on due dates and progress
const alerts = computed(() => {
  const generatedAlerts = [];
  
  // Debts due soon (within 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  debtsStore.activeDebts.forEach(debt => {
    if (debt.dueDate) {
      const dueDate = new Date(debt.dueDate);
      if (dueDate >= today && dueDate <= nextWeek) {
        generatedAlerts.push({
          icon: '⚠️',
          title: 'دين مستحق قريباً',
          message: `دين "${debt.personName}" يستحق في ${formatDate(debt.dueDate)}`
        });
      }
    }
  });

  // Savings group installments (rough estimation for example purposes)
  savingsGroupsStore.activeGroups.forEach(group => {
    // If not paid for current month
    const currentMonth = new Date().getMonth() + 1;
    const isPaidThisMonth = group.paidMonths?.includes(currentMonth) || false;
    if (!isPaidThisMonth) {
       generatedAlerts.push({
        icon: '👥',
        title: 'قسط سلفة مستحق',
        message: `يرجى دفع قسط شهر ${currentMonth} لسلفة "${group.title}"`
      });
    }
  });

  // Cash boxes nearly complete
  cashBoxesStore.activeBoxes.forEach(box => {
    const percentage = (box.currentAmount / box.targetAmount) * 100;
    if (percentage >= 90 && percentage < 100) {
      generatedAlerts.push({
        icon: '🎯',
        title: 'قاصة قاربت على الاكتمال',
        message: `قاصة "${box.title}" وصلت إلى ${Math.round(percentage)}% من الهدف`
      });
    }
  });

  return generatedAlerts;
});

onMounted(async () => {
  // Wait for auth to be ready
  if (authStore.user) {
    await Promise.all([
      walletsStore.fetchWallets(),
      transactionsStore.fetchTransactions(),
      cashBoxesStore.fetchCashBoxes(),
      debtsStore.fetchDebts(),
      savingsGroupsStore.fetchGroups()
    ]);
    
    // تشغيل المساهمات التلقائية للقاصات
    setTimeout(() => {
      cashBoxesStore.runAutoContributions(walletsStore);
    }, 1000);
  }
});
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
