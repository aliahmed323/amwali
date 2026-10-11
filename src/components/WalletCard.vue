<template>
  <div 
    @click="$emit('click', wallet)" 
    role="button"
    tabindex="0"
    class="bg-slate-900 rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 hover:bg-slate-850 active:scale-[0.98] transition-all flex flex-col justify-between h-32 relative overflow-hidden select-none shadow-md hover:shadow-lg"
  >
    <!-- Background Decor -->
    <div class="absolute -end-4 -top-4 text-7xl opacity-5 select-none pointer-events-none">{{ wallet.icon || (wallet.type === 'credit_card' ? '💳' : '💵') }}</div>
    
    <div class="flex justify-between items-start z-10">
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">{{ wallet.icon || (wallet.type === 'credit_card' ? '💳' : '💵') }}</span>
        <div>
          <h3 class="font-bold text-white text-base leading-tight">{{ wallet.name }}</h3>
          <span class="text-[11px] text-slate-400 font-medium">
            {{ isCreditCard ? '💳 بطاقة ائتمان' : '💵 نقدي (كاش)' }}
          </span>
        </div>
      </div>
      <span 
        class="text-[10px] font-bold px-2.5 py-1 rounded-lg border"
        :class="isCreditCard ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
      >
        {{ isCreditCard ? 'ائتماني' : 'كاش' }}
      </span>
    </div>

    <div class="z-10">
      <div class="text-xs text-slate-400 mb-0.5 font-medium">الرصيد الحالي</div>
      <div 
        class="text-2xl font-bold tracking-tight"
        :class="wallet.currentBalance >= 0 ? 'text-white' : 'text-rose-400'"
      >
        {{ formatMoney(wallet.currentBalance) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '../utils/formatters.js'

const props = defineProps({
  wallet: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const isCreditCard = computed(() => {
  return props.wallet.type === 'credit_card'
})
</script>
