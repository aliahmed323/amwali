<template>
  <div v-if="hasPermissionError && !dismissed" class="bg-gradient-to-r from-amber-900/90 via-amber-800/90 to-rose-900/90 border-b border-amber-500/30 text-white px-4 py-3 text-sm shadow-lg">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-start gap-2.5">
        <span class="text-xl">⚠️</span>
        <div>
          <p class="font-bold text-amber-200">تنبيه أذونات Firebase (permission-denied)</p>
          <p class="text-xs text-amber-100/90 mt-0.5">
            قواعد Firestore مقفلة في مشروع Firebase الخاص بك. يعمل التطبيق حالياً في <strong class="underline">الوضع المحلي (Offline)</strong> لضمان حفظ واستعراض بياناتك بدون توقف.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        <button 
          @click="copyRules" 
          class="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 transition-colors flex items-center gap-1 font-medium"
        >
          <span>{{ copied ? 'تم النسخ ✓' : '📋 نسخ القواعد' }}</span>
        </button>
        <a 
          href="https://console.firebase.google.com/project/amwali-d40b7/firestore/rules" 
          target="_blank" 
          rel="noopener noreferrer"
          class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-bold"
        >
          <span>فتح Firebase ↗</span>
        </a>
        <button 
          @click="dismissed = true" 
          class="text-amber-200 hover:text-white p-1 rounded-md text-base leading-none"
          title="إغلاق التنبيه"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useWalletsStore } from '@/stores/wallets'

const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const dismissed = ref(false)
const copied = ref(false)

const hasPermissionError = computed(() => {
  return categoriesStore.error?.code === 'permission-denied' || 
         walletsStore.error?.code === 'permission-denied'
})

const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{householdId}/{document=**} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if request.auth != null || true;
    }
  }
}`

const copyRules = async () => {
  try {
    await navigator.clipboard.writeText(firestoreRulesText)
    copied.value = true
    setTimeout(() => { copied.value = false }, 3000)
  } catch (err) {
    prompt('انسخ قواعد Firestore التالية وضعها في Firebase Console > Firestore Database > Rules:', firestoreRulesText)
  }
}
</script>
