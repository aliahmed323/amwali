<template>
  <div @click="$emit('click')" class="bg-slate-900 rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors relative overflow-hidden">
    <div v-if="isCompleted" class="absolute top-0 end-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
      مكتمل ✅
    </div>

    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl">
        🔄
      </div>
      <div>
        <h3 class="font-bold text-white">{{ group.title }}</h3>
        <div class="text-xs text-slate-500 mt-0.5">تبدأ: {{ formatDate(group.startDate) }}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-slate-800 rounded-xl p-3">
        <div class="text-xs text-slate-400 mb-1">القسط الشهري</div>
        <div class="font-bold text-white">{{ formatMoney(group.monthlyShare) }}</div>
      </div>
      <div class="bg-slate-800 rounded-xl p-3">
        <div class="text-xs text-slate-400 mb-1">المبلغ الإجمالي</div>
        <div class="font-bold text-amber-400">{{ formatMoney(group.totalAmount) }}</div>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-slate-400">المدفوع:</span>
        <span class="text-white font-medium">{{ paidCount }} من {{ group.totalMonths }} أشهر</span>
      </div>
      <div class="text-sm">
        <span class="text-slate-400">دورنا: </span>
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/30">
          {{ group.myTurnMonth }}
        </span>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
      <div 
        class="h-full rounded-full bg-blue-500 transition-all duration-500"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <div class="flex gap-2" @click.stop>
      <button 
        v-if="group.status === 'active'"
        @click="$emit('pay-installment', group)" 
        class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
      >
        دفع القسط
      </button>
      <div 
        v-if="group.isPayoutReceived" 
        class="flex-1 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        تم استلام الدور
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney, formatDate } from '../utils/formatters.js'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})
defineEmits(['click', 'pay-installment'])

const paidCount = computed(() => props.group.paidMonths?.length || 0)
const isCompleted = computed(() => props.group.status === 'completed')

const progress = computed(() => {
  if (!props.group.totalMonths) return 0
  return Math.round((paidCount.value / props.group.totalMonths) * 100)
})
</script>
