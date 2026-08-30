<template>
  <div @click="$emit('click')" class="bg-slate-900 rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
          {{ box.icon || '📦' }}
        </div>
        <div>
          <h3 class="font-bold text-white">{{ box.title }}</h3>
          <div v-if="box.autoDeposit" class="text-[10px] text-blue-400 mt-0.5 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            تحويل تلقائي
          </div>
        </div>
      </div>
      <span :class="['text-xs px-2 py-1 rounded-lg border', isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20']">
        {{ isCompleted ? 'مكتمل✅' : 'جاري⏳' }}
      </span>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex justify-between text-sm">
        <span class="text-white font-semibold">{{ formatMoney(box.currentAmount) }}</span>
        <span class="text-slate-500">من {{ formatMoney(box.targetAmount) }}</span>
      </div>
      <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          :class="['h-full rounded-full transition-all duration-500', isCompleted ? 'bg-emerald-500' : 'bg-amber-500']"
          :style="{ width: `${Math.min(progress, 100)}%` }"
        ></div>
      </div>
      <div class="text-xs text-end" :class="isCompleted ? 'text-emerald-400' : 'text-slate-400'">
        {{ progress }}% مكتمل (المتبقي {{ Math.max(0, 100 - progress) }}%)
      </div>
    </div>

    <div v-if="box.dailyAmount > 0" class="flex items-center justify-between mb-4 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
      <div class="flex items-center gap-2">
        <span class="text-sm">🎯</span>
        <div>
          <p class="text-xs font-bold text-slate-300">يومي: {{ formatMoney(box.dailyAmount) }}</p>
          <p class="text-[10px]" :class="isTodayDone ? 'text-emerald-400' : 'text-amber-400'">
            {{ isTodayDone ? '✅ تمت إضافة اليوم' : '⏰ لم يتم إضافة اليوم' }}
          </p>
        </div>
      </div>
      <button v-if="!isTodayDone" @click.stop="$emit('quickAdd', box)" class="text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">
        + إضافة
      </button>
    </div>

    <div class="flex gap-2" @click.stop>
      <button @click="$emit('deposit', box)" class="flex-1 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition-colors">
        إيداع
      </button>
      <button @click="$emit('withdraw', box)" class="flex-1 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-sm font-medium transition-colors">
        سحب
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '../utils/formatters.js'

const props = defineProps({
  box: {
    type: Object,
    required: true
  }
})
defineEmits(['click', 'deposit', 'withdraw', 'quickAdd'])

const isTodayDone = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return props.box.lastContributionDate === todayStr
})

const progress = computed(() => {
  if (!props.box.targetAmount || Number(props.box.targetAmount) === 0) return 0
  return Math.round((Number(props.box.currentAmount) || 0) / Number(props.box.targetAmount) * 100)
})

const isCompleted = computed(() => {
  if (!props.box.targetAmount || Number(props.box.targetAmount) === 0) return false
  return props.box.status === 'completed' || Number(props.box.currentAmount) >= Number(props.box.targetAmount)
})
</script>
