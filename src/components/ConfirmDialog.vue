<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('cancel')"></div>
    <div class="relative bg-slate-900 rounded-2xl p-6 w-full max-w-sm mx-auto shadow-xl border border-slate-800 transform transition-all scale-100">
      <h3 class="text-lg font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-slate-400 text-sm mb-6">{{ message }}</p>
      
      <div class="flex gap-3 justify-end">
        <button 
          @click="$emit('cancel')" 
          class="px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex-1"
        >
          إلغاء
        </button>
        <button 
          @click="$emit('confirm')" 
          :class="[
            'px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors flex-1',
            variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: { type: String, default: 'تأكيد' },
  variant: { type: String, default: 'danger' } // 'danger' | 'warning'
})
defineEmits(['confirm', 'cancel'])
</script>
