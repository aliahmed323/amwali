<template>
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <div class="text-5xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-bold text-slate-300 text-center">{{ title }}</h3>
    <p class="text-sm text-slate-500 mt-2 text-center max-w-xs">{{ description }}</p>
    <div class="mt-6" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>
