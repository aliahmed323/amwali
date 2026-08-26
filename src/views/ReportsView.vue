<template>
  <div class="min-h-screen bg-slate-950 pb-24 dir-rtl">
    <TopBar :title="'التقارير'" />

    <main class="px-4 pt-4 space-y-6">
      <!-- Period Selector -->
      <div class="flex overflow-x-auto space-x-2 space-x-reverse pb-1 hide-scrollbar">
        <button 
          v-for="period in periods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            selectedPeriod === period.value 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
          ]"
        >
          {{ period.label }}
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-4">
        <StatsCard 
          title="إجمالي الإيرادات" 
          :value="formatMoney(reportData.income)" 
          icon="📥" 
          color="emerald" 
        />
        <StatsCard 
          title="إجمالي المصروفات" 
          :value="formatMoney(reportData.expense)" 
          icon="📤" 
          color="rose" 
        />
        <StatsCard 
          title="صافي الربح" 
          :value="formatMoney(reportData.net)" 
          icon="📊" 
          color="blue" 
        />
        <StatsCard 
          title="معدل التوفير" 
          :value="`${reportData.savingsRate}%`" 
          icon="🎯" 
          color="amber" 
        />
      </div>

      <template v-if="filteredTransactions.length > 0">
        <!-- Monthly Comparison -->
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 class="text-sm font-bold text-slate-300 mb-4">مقارنة شهرية</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>الإيرادات مقارنة بالشهر السابق</span>
                <span :class="reportData.incomeChange >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ Math.abs(reportData.incomeChange).toFixed(1) }}% {{ reportData.incomeChange >= 0 ? '↑' : '↓' }}
                </span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                <div class="bg-emerald-500/50 h-2" :style="{ width: '50%' }"></div>
                <div class="bg-emerald-400 h-2" :style="{ width: '50%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>المصروفات مقارنة بالشهر السابق</span>
                <span :class="reportData.expenseChange <= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ Math.abs(reportData.expenseChange).toFixed(1) }}% {{ reportData.expenseChange >= 0 ? '↑' : '↓' }}
                </span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                <div class="bg-rose-500/50 h-2" :style="{ width: '50%' }"></div>
                <div class="bg-rose-400 h-2" :style="{ width: '50%' }"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Expenses by Category -->
        <section>
          <h3 class="text-lg font-bold text-white mb-3">المصروفات حسب القسم</h3>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div v-for="cat in expensesByCategory" :key="cat.name" class="space-y-1">
              <div class="flex justify-between items-center text-sm">
                <div class="flex items-center space-x-2 space-x-reverse">
                  <span v-if="cat.icon">{{ cat.icon }}</span>
                  <span class="text-slate-300">{{ cat.name }}</span>
                </div>
                <span class="text-white font-bold">{{ formatMoney(cat.amount) }}</span>
              </div>
              <div class="flex items-center space-x-2 space-x-reverse">
                <div class="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-rose-500 h-1.5 rounded-full" :style="{ width: `${cat.percentage}%` }"></div>
                </div>
                <span class="text-xs text-slate-500 w-8 text-end">{{ cat.percentage.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Expenses by Person -->
        <section>
          <h3 class="text-lg font-bold text-white mb-3">المصروفات حسب الشخص</h3>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div v-for="person in expensesByPerson" :key="person.name" class="space-y-1">
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-300">{{ person.name }}</span>
                <span class="text-white font-bold">{{ formatMoney(person.amount) }}</span>
              </div>
              <div class="flex items-center space-x-2 space-x-reverse">
                <div class="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-blue-500 h-1.5 rounded-full" :style="{ width: `${person.percentage}%` }"></div>
                </div>
                <span class="text-xs text-slate-500 w-8 text-end">{{ person.percentage.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Top Expenses -->
        <section>
          <h3 class="text-lg font-bold text-white mb-3">أعلى 5 مصروفات</h3>
          <div class="space-y-3">
            <div 
              v-for="tx in topExpenses" 
              :key="tx.id"
              class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center"
            >
              <div>
                <h4 class="text-white text-sm font-medium">{{ tx.title || tx.categoryName }}</h4>
                <p class="text-slate-500 text-xs">{{ formatDate(tx.date) }}</p>
              </div>
              <span class="text-rose-400 font-bold text-sm">{{ formatMoney(tx.amount) }}</span>
            </div>
          </div>
        </section>
      </template>
      
      <EmptyState 
        v-else 
        icon="📊" 
        title="لا توجد بيانات كافية" 
        description="لا توجد معاملات في هذه الفترة لعرض التقارير" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import TopBar from '@/components/TopBar.vue';
import StatsCard from '@/components/StatsCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useTransactionsStore } from '@/stores/transactions';
import { formatMoney, formatDate } from '@/utils/formatters';

const transactionsStore = useTransactionsStore();

const periods = [
  { label: 'هذا الشهر', value: 'this_month' },
  { label: 'الشهر السابق', value: 'last_month' },
  { label: 'آخر 3 أشهر', value: 'last_3_months' },
  { label: 'سنوي', value: 'this_year' },
];

const selectedPeriod = ref('this_month');

// Filter transactions by selected period
const filteredTransactions = computed(() => {
  const txs = transactionsStore.transactions;
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);
  
  if (selectedPeriod.value === 'this_month') {
    return txs.filter(tx => tx.date.startsWith(currentMonthStr));
  } 
  else if (selectedPeriod.value === 'last_month') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    return txs.filter(tx => tx.date.startsWith(lastMonthStr));
  }
  else if (selectedPeriod.value === 'last_3_months') {
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const dateLimit = threeMonthsAgo.toISOString().slice(0, 10);
    return txs.filter(tx => tx.date >= dateLimit);
  }
  else if (selectedPeriod.value === 'this_year') {
    const currentYear = now.getFullYear().toString();
    return txs.filter(tx => tx.date.startsWith(currentYear));
  }
  
  return txs;
});

// Overall Report Data
const reportData = computed(() => {
  let income = 0;
  let expense = 0;
  
  filteredTransactions.value.forEach(tx => {
    if (tx.type === 'income') income += tx.amount;
    else if (tx.type === 'expense') expense += tx.amount;
  });

  const net = income - expense;
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;
  
  // Fake calculation for monthly change just for UI demo purposes (would need historical data processing ideally)
  const incomeChange = 5.2; // Example positive growth
  const expenseChange = -2.1; // Example expense reduction

  return { income, expense, net, savingsRate, incomeChange, expenseChange };
});

// Expenses by Category
const expensesByCategory = computed(() => {
  const categories = {};
  let totalExp = 0;

  filteredTransactions.value.filter(tx => tx.type === 'expense').forEach(tx => {
    totalExp += tx.amount;
    if (!categories[tx.categoryName]) {
      categories[tx.categoryName] = { name: tx.categoryName, amount: 0, icon: '' };
    }
    categories[tx.categoryName].amount += tx.amount;
    // Assuming icon can be extracted if we have it, or just name based
  });

  return Object.values(categories)
    .map(c => ({
      ...c,
      percentage: totalExp > 0 ? (c.amount / totalExp) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
});

// Expenses by Person
const expensesByPerson = computed(() => {
  const persons = {
    'الزوج': { name: 'الزوج', amount: 0 },
    'الزوجة': { name: 'الزوجة', amount: 0 }
  };
  let totalExp = 0;

  filteredTransactions.value.filter(tx => tx.type === 'expense').forEach(tx => {
    if (tx.spenderName && persons[tx.spenderName]) {
      persons[tx.spenderName].amount += tx.amount;
      totalExp += tx.amount;
    }
  });

  return Object.values(persons).map(p => ({
    ...p,
    percentage: totalExp > 0 ? (p.amount / totalExp) * 100 : 0
  })).filter(p => p.amount > 0);
});

// Top 5 expenses
const topExpenses = computed(() => {
  return [...filteredTransactions.value]
    .filter(tx => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
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
