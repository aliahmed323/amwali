<template>
  <div class="min-h-screen bg-slate-950 pb-24 dir-rtl">
    <TopBar :title="'المعاملات'" />

    <main class="px-4 pt-4 space-y-4">
      <!-- Search -->
      <div class="relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="ابحث في المعاملات..."
          class="w-full bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 pe-10"
        >
        <span class="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>

      <!-- Filters -->
      <div class="space-y-3">
        <!-- Type Filter -->
        <div class="flex overflow-x-auto space-x-2 space-x-reverse pb-1 hide-scrollbar">
          <button 
            v-for="type in typeFilters" 
            :key="type.value"
            @click="selectedType = type.value"
            :class="[
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              selectedType === type.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            ]"
          >
            {{ type.label }}
          </button>
        </div>

        <div class="flex space-x-2 space-x-reverse">
          <!-- Month Filter -->
          <div class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <label class="block text-xs text-slate-500 mb-1">الشهر</label>
            <select v-model="selectedMonth" class="w-full bg-transparent text-sm text-white focus:outline-none appearance-none">
              <option v-for="month in monthOptions" :key="month.value" :value="month.value" class="bg-slate-900">
                {{ month.label }}
              </option>
            </select>
          </div>
          
          <!-- Spender Filter -->
          <div class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <label class="block text-xs text-slate-500 mb-1">الشخص</label>
            <select v-model="selectedSpender" class="w-full bg-transparent text-sm text-white focus:outline-none appearance-none">
              <option value="all" class="bg-slate-900">الكل</option>
              <option value="الزوج" class="bg-slate-900">الزوج</option>
              <option value="الزوجة" class="bg-slate-900">الزوجة</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Bar -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center text-sm">
        <div class="text-center">
          <div class="text-slate-400 mb-1">الإيراد</div>
          <div class="text-emerald-400 font-bold">{{ formatMoney(filteredSummary.income) }}</div>
        </div>
        <div class="w-px h-8 bg-slate-800"></div>
        <div class="text-center">
          <div class="text-slate-400 mb-1">المصروف</div>
          <div class="text-rose-400 font-bold">{{ formatMoney(filteredSummary.expense) }}</div>
        </div>
        <div class="w-px h-8 bg-slate-800"></div>
        <div class="text-center">
          <div class="text-slate-400 mb-1">الصافي</div>
          <div class="text-blue-400 font-bold">{{ formatMoney(filteredSummary.net) }}</div>
        </div>
      </div>

      <!-- Transactions List -->
      <div v-if="Object.keys(groupedTransactions).length > 0" class="space-y-6">
        <div v-for="(group, dateLabel) in groupedTransactions" :key="dateLabel">
          <h3 class="text-xs font-bold text-slate-500 mb-3 px-2 sticky top-0 bg-slate-950/90 backdrop-blur-sm py-2 z-10">
            {{ dateLabel }}
          </h3>
          <div class="space-y-3">
            <TransactionItem 
              v-for="tx in group" 
              :key="tx.id" 
              :transaction="tx"
              @delete="transactionsStore.deleteTransaction"
            />
          </div>
        </div>
      </div>
      <EmptyState 
        v-else 
        icon="🔍" 
        title="لا توجد نتائج" 
        description="لم نجد أي معاملات تطابق معايير البحث الخاصة بك" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import TopBar from '@/components/TopBar.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useTransactionsStore } from '@/stores/transactions';
import { formatMoney, formatDate } from '@/utils/formatters';

const transactionsStore = useTransactionsStore();

// Filters state
const searchQuery = ref('');
const selectedType = ref('all');
const selectedMonth = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM
const selectedSpender = ref('all');

const typeFilters = [
  { label: 'الكل', value: 'all' },
  { label: 'إيراد', value: 'income' },
  { label: 'مصروف', value: 'expense' },
  { label: 'تحويل', value: 'transfer' },
];

// Generate last 12 months for selector
const monthOptions = computed(() => {
  const options = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = d.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat('ar-IQ', { month: 'long', year: 'numeric' }).format(d);
    options.push({ value, label });
  }
  return options;
});

// Computed filtered transactions
const filteredTransactions = computed(() => {
  let result = transactionsStore.transactions;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(tx => 
      (tx.title && tx.title.toLowerCase().includes(query)) || 
      (tx.notes && tx.notes.toLowerCase().includes(query))
    );
  }

  // Type filter
  if (selectedType.value !== 'all') {
    result = result.filter(tx => tx.type === selectedType.value);
  }

  // Month filter
  if (selectedMonth.value) {
    result = result.filter(tx => tx.date.startsWith(selectedMonth.value));
  }

  // Spender filter
  if (selectedSpender.value !== 'all') {
    result = result.filter(tx => tx.spenderName === selectedSpender.value);
  }

  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
});

// Calculate summary for filtered set
const filteredSummary = computed(() => {
  let income = 0;
  let expense = 0;
  
  filteredTransactions.value.forEach(tx => {
    if (tx.type === 'income') income += tx.amount;
    else if (tx.type === 'expense') expense += tx.amount;
  });

  return { income, expense, net: income - expense };
});

// Group by date for display
const groupedTransactions = computed(() => {
  const groups = {};
  
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  filteredTransactions.value.forEach(tx => {
    let dateLabel = tx.date;
    if (tx.date === today) {
      dateLabel = 'اليوم';
    } else if (tx.date === yesterday) {
      dateLabel = 'أمس';
    } else {
      dateLabel = formatDate(tx.date);
    }

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(tx);
  });

  return groups;
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
