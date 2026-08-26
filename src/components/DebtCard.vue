<template>
  <div @click="$emit('click')" class="bg-slate-900 rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
    <div class="flex justify-between items-start mb-3">
      <div>
        <span :class="['text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block', isOwe ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400']">
          {{ isOwe ? 'ديون علينا' : 'ديون لنا' }}
        </span>
        <h3 class="font-bold text-white text-lg">{{ debt.personName }}</h3>
      </div>
      <div v-if="debt.dueDate" class="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
        تستحق: {{ formatDate(debt.dueDate) }}
      </div>
    </div>

    <div class="bg-slate-800/50 rounded-xl p-3 mb-3">
      <div class="flex justify-between items-end mb-1">
        <div class="text-sm text-slate-400">المتبقي</div>
        <div class="text-xl font-bold" :class="isOwe ? 'text-rose-400' : 'text-emerald-400'">
          {{ formatMoney(debt.remainingAmount) }}
        </div>
      </div>
      <div class="flex justify-between items-center text-xs text-slate-500 mt-1">
        <span>الإجمالي: {{ formatMoney(debt.totalAmount) }}</span>
        <span>المدفوع: {{ formatMoney(debt.paidAmount) }}</span>
      </div>
      <!-- Progress -->
      <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
        <div 
          :class="['h-full rounded-full', isOwe ? 'bg-rose-500' : 'bg-emerald-500']"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <div class="flex justify-between items-center" @click.stop>
      <div class="text-xs text-slate-500 truncate max-w-[60%]">
        {{ debt.notes || 'لا توجد ملاحظات' }}
      </div>
      <button v-if="debt.status === 'active'" @click="$emit('pay', debt)" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        تسديد
      </button>
      <span v-else class="text-emerald-400 text-sm font-medium px-4 py-1.5 bg-emerald-500/10 rounded-lg">
        مكتمل ✅
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney, formatDate } from '../utils/formatters.js'

const props = defineProps({
  debt: {
    type: Object,
    required: true
  }
})
defineEmits(['click', 'pay'])

const isOwe = computed(() => props.debt.type === 'owe_others')

const progress = computed(() => {
  if (!props.debt.totalAmount || props.debt.totalAmount === 0) return 0
  return Math.round((props.debt.paidAmount / props.debt.totalAmount) * 100)
})
</script>
