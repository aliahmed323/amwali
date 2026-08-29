<template>
  <div class="relative group">
    <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 transition-colors">
      
      <!-- Icon -->
      <div :class="[
        'w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0',
        transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 
        transaction.type === 'expense' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
      ]">
        {{ transaction.categoryIcon || (transaction.type === 'transfer' ? '🔄' : '💰') }}
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h4 class="font-medium text-white truncate">{{ transaction.title || transaction.categoryName }}</h4>
          <span v-if="transaction.spenderName" class="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full whitespace-nowrap">{{ transaction.spenderName }}</span>
        </div>
        <div class="text-xs text-slate-500 truncate mt-0.5">
          <span v-if="transaction.type === 'transfer'">تحويل: من {{ transaction.walletName }} إلى {{ transaction.toWalletName || 'محفظة' }}</span>
          <span v-else-if="transaction.type === 'expense'">{{ transaction.categoryName }} • صُرف من: {{ transaction.walletName || 'غير معروف' }}</span>
          <span v-else>{{ transaction.categoryName }} • أُضيف إلى: {{ transaction.walletName || 'غير معروف' }}</span>
        </div>
      </div>

      <!-- Amount & Date -->
      <div class="text-end flex-shrink-0">
        <div :class="[
          'font-semibold',
          transaction.type === 'income' ? 'text-emerald-400' : 
          transaction.type === 'expense' ? 'text-rose-400' : 'text-blue-400'
        ]">
          <span v-if="transaction.type === 'income'">+</span>
          <span v-else-if="transaction.type === 'expense'">-</span>
          {{ formatMoney(transaction.amount) }}
        </div>
        <div class="text-xs text-slate-500 mt-1">{{ formatDate(transaction.date) }}</div>
      </div>

      <!-- Delete Button (shown on hover in desktop, or long press on mobile conceptually) -->
      <button @click="$emit('delete', transaction.id)" class="absolute end-2 top-1/2 -translate-y-1/2 p-2 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity md:hover:bg-rose-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { formatMoney, formatDate } from '../utils/formatters.js'

defineProps({
  transaction: {
    type: Object,
    required: true
  }
})
defineEmits(['delete'])
</script>
