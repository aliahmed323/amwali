<template>
  <div class="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between h-full">
    <div class="flex items-start justify-between mb-3">
      <div 
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0',
          colorClass
        ]"
      >
        {{ icon }}
      </div>
    </div>
    
    <div>
      <h4 class="text-sm text-slate-400 mb-1">{{ title }}</h4>
      <div :class="['text-xl font-bold truncate', textClass]">{{ value }}</div>
      <div v-if="subtitle" class="text-xs text-slate-500 mt-1 truncate">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: String, default: '📊' },
  color: { type: String, default: 'blue' }, // 'emerald' | 'rose' | 'amber' | 'blue'
  subtitle: { type: String, default: '' }
})

const colorClass = computed(() => {
  const map = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-400',
    amber: 'bg-amber-500/10 text-amber-400',
    blue: 'bg-blue-500/10 text-blue-400'
  }
  return map[props.color] || map.blue
})

const textClass = computed(() => {
  const map = {
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400'
  }
  return map[props.color] || 'text-white'
})
</script>
