<template>
  <div @click="$emit('click')" class="bg-slate-900 rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 hover:bg-slate-800/50 transition-all flex flex-col justify-between h-32 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute -end-6 -top-6 text-7xl opacity-5 select-none pointer-events-none">{{ wallet.icon || '💰' }}</div>
    
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-2">
        <span class="text-2xl">{{ wallet.icon || '💰' }}</span>
        <h3 class="font-bold text-white text-lg">{{ wallet.name }}</h3>
      </div>
      <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700">
        {{ getTypeName(wallet.type) }}
      </span>
    </div>

    <div>
      <div class="text-sm text-slate-500 mb-1">الرصيد الحالي</div>
      <div class="text-2xl font-bold text-white tracking-tight">{{ formatMoney(wallet.currentBalance) }}</div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from '../utils/formatters.js'

defineProps({
  wallet: {
    type: Object,
    required: true
  }
})
defineEmits(['click'])

const getTypeName = (type) => {
  const types = {
    cash: 'نقدي',
    zain_cash: 'زين كاش',
    super_cash: 'سوبر كاش',
    credit_card: 'كريدت كارد',
    bank: 'بنكي',
    other: 'أخرى'
  }
  return types[type] || 'أخرى'
}
</script>
