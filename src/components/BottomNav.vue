<template>
  <nav class="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50 pb-[env(safe-area-inset-bottom)]">
    <div class="flex justify-around items-center h-16">
      <router-link to="/" class="flex flex-col items-center gap-1 w-1/5 transition-colors text-slate-500 hover:text-slate-300" active-class="!text-blue-400" exact-active-class="!text-blue-400">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span class="text-xs">الرئيسية</span>
      </router-link>
      <router-link to="/transactions" class="flex flex-col items-center gap-1 w-1/5 transition-colors text-slate-500 hover:text-slate-300" active-class="!text-blue-400">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        <span class="text-xs">المعاملات</span>
      </router-link>
      <div class="w-1/5 flex justify-center">
        <!-- Spacer for FAB -->
      </div>
      <router-link to="/cash-boxes" class="flex flex-col items-center gap-1 w-1/5 transition-colors text-slate-500 hover:text-slate-300" active-class="!text-blue-400">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span class="text-xs">القاصات</span>
      </router-link>
      <router-link to="/more" class="flex flex-col items-center gap-1 w-1/5 transition-colors text-slate-500 hover:text-slate-300" active-class="!text-blue-400">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        <span class="text-xs">المزيد</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
</script>
