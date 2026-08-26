<template>
  <header class="sticky top-0 w-full z-40 bg-slate-950/95 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
    <div class="flex justify-between items-center px-5 py-4">
      <div class="flex items-center">
        <slot name="actions"></slot>
      </div>
      <h1 class="text-xl font-bold text-white">{{ title }}</h1>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>
