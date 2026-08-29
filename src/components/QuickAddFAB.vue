<template>
  <button 
    @click="$emit('click')"
    class="fixed bottom-24 left-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/40 flex items-center justify-center active:scale-90 transition-transform"
  >
    <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>
