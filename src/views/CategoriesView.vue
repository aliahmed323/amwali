<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="الأقسام">
      <template #actions>
        <button 
          @click="openAddModal" 
          class="w-10 h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 active:scale-95 transition-all" 
          aria-label="إضافة قسم"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </TopBar>

    <FirebaseRulesBanner />

    <div class="p-4 space-y-4">
      <!-- تبويب النوع (مصروفات / إيرادات) -->
      <div class="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 gap-1 shadow-md">
        <button 
          @click="activeType = 'expense'" 
          :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5', 
            activeType === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200']"
        >
          <span>⬇</span>
          <span>أقسام المصروفات ({{ categoriesStore.expenseCategories.length }})</span>
        </button>
        <button 
          @click="activeType = 'income'" 
          :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5', 
            activeType === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200']"
        >
          <span>⬆</span>
          <span>أقسام الإيرادات ({{ categoriesStore.incomeCategories.length }})</span>
        </button>
      </div>

      <!-- تنبيه تنظيف الأقسام القديمة إن وُجدت -->
      <div v-if="hasOldCategories" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <p class="text-xs font-bold text-amber-300">يوجد أقسام قديمة (إيراد التاكسي / راتب الزوجة)</p>
          <p class="text-[11px] text-amber-200/80">انقر هنا لتنظيفها وتحديث الأقسام الرسمية فوراً</p>
        </div>
        <button 
          @click="cleanCategories"
          class="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex-shrink-0"
        >
          🧹 تنظيف الآن
        </button>
      </div>

      <!-- إشعار نجاح العملية -->
      <div v-if="toastMessage" class="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs text-center font-bold animate-fade-in">
        {{ toastMessage }}
      </div>

      <!-- القائمة -->
      <div v-if="visibleCategories.length > 0" class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div
          v-for="(cat, i) in visibleCategories"
          :key="cat.id"
          class="flex items-center gap-3 p-4 transition-colors hover:bg-slate-850"
          :class="i < visibleCategories.length - 1 ? 'border-b border-slate-800/60' : ''"
        >
          <div class="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-2xl flex-shrink-0">
            {{ cat.icon || '📦' }}
          </div>
          <div class="flex-1 font-bold text-slate-100 text-base">
            {{ cat.name }}
          </div>
          <button 
            @click="askDelete(cat)" 
            class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all" 
            aria-label="حذف القسم"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <EmptyState
        v-else-if="!categoriesStore.loading"
        icon="🗂️"
        title="لا توجد أقسام مسجلة"
        :description="activeType === 'expense' ? 'أضف أول قسم للمصروفات أو استعد الأقسام الافتراضية' : 'أضف أول قسم للإيرادات أو استعد الأقسام الافتراضية'"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button 
          @click="openAddModal" 
          class="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl px-6 py-3.5 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
        >
          <span>＋</span>
          <span>إضافة قسم جديد</span>
        </button>
        <button 
          @click="restoreDefaults" 
          :disabled="restoring" 
          class="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-slate-200 font-bold rounded-xl px-6 py-3.5 border border-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <span>↺</span>
          <span>{{ restoring ? 'جاري الاستعادة...' : 'استعادة الأقسام الافتراضية' }}</span>
        </button>
      </div>
    </div>

    <!-- نافذة إضافة قسم -->
    <div v-if="showAddModal" class="fixed inset-0 z-[70] flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showAddModal = false"></div>
      <div class="relative bg-slate-900 rounded-t-3xl w-full flex flex-col overflow-hidden shadow-2xl border-t border-slate-800" style="max-height: 90vh;">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <h3 class="text-xl font-bold">إضافة قسم جديد</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2 rounded-lg">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="overflow-y-auto flex-1 p-5 space-y-4">
          <div class="flex bg-slate-800 rounded-xl p-1 gap-1">
            <button 
              @click="newCategory.type = 'expense'" 
              :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-all', 
                newCategory.type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400']"
            >
              ⬇ مصروف
            </button>
            <button 
              @click="newCategory.type = 'income'" 
              :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-all', 
                newCategory.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400']"
            >
              ⬆ إيراد
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم القسم</label>
            <input 
              v-model="newCategory.name" 
              type="text" 
              placeholder="مثال: مطاعم، هدايا، أقساط، فواتير" 
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 outline-none"
            >
            <p v-if="isDuplicate" class="text-amber-400 text-xs mt-1.5 px-1">⚠ يوجد قسم بنفس هذا الاسم بالفعل.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الأيقونة</label>
            <div class="grid grid-cols-6 gap-2">
              <button 
                v-for="icon in icons" 
                :key="icon" 
                @click="newCategory.icon = icon" 
                type="button"
                class="h-12 flex items-center justify-center text-2xl rounded-xl border transition-all active:scale-95"
                :class="newCategory.icon === icon ? 'bg-blue-600/30 border-blue-500 scale-105' : 'bg-slate-800 border-slate-700 hover:border-slate-600'"
              >
                {{ icon }}
              </button>
            </div>
          </div>
          
          <div class="h-2"></div>
        </div>

        <div class="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-900">
          <button 
            @click="saveCategory" 
            :disabled="!isValid"
            class="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl px-6 py-4 transition-all shadow-lg shadow-blue-600/30"
          >
            حفظ القسم
          </button>
        </div>
      </div>
    </div>

    <!-- تأكيد الحذف -->
    <ConfirmDialog
      :show="!!categoryToDelete"
      title="حذف القسم"
      :message="`هل تريد حذف قسم «${categoryToDelete?.name || ''}»؟ لن يتم حذف أي معاملات قديمة مرتبطة به.`"
      confirmText="تأكيد الحذف"
      variant="danger"
      @confirm="deleteCategory"
      @cancel="categoryToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import TopBar from '@/components/TopBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FirebaseRulesBanner from '@/components/FirebaseRulesBanner.vue'

const route = useRoute()
const categoriesStore = useCategoriesStore()

const activeType = ref(route.query.type === 'income' ? 'income' : 'expense')
const toastMessage = ref('')

onMounted(() => {
  categoriesStore.fetchCategories()
  if (route.query.add) openAddModal()
})

watch(() => route.query, (q) => {
  if (q.type === 'income' || q.type === 'expense') activeType.value = q.type
  if (q.add) openAddModal()
})

const visibleCategories = computed(() =>
  activeType.value === 'income' ? categoriesStore.incomeCategories : categoriesStore.expenseCategories
)

const hasOldCategories = computed(() => {
  return categoriesStore.categories.some(c => 
    c.name?.includes('تاكسي') || 
    c.name?.includes('الزوجة')
  )
})

const cleanCategories = async () => {
  const count = await categoriesStore.cleanOldCategories()
  showToast(`تم تنظيف وتحديث الأقسام بنجاح!`)
}

const icons = ['🏠', '⛽', '🛒', '💊', '📱', '🎓', '👕', '🔧', '💡', '🚌', '🎉', '📦', '🍔', '☕', '🎁', '👶', '🧾', '✈️', '💰', '💵', '💼', '📈', '🏦']
const showAddModal = ref(false)
const newCategory = ref({ name: '', icon: '📦', type: 'expense' })

const openAddModal = () => {
  newCategory.value = { 
    name: '', 
    icon: activeType.value === 'income' ? '💵' : '📦', 
    type: activeType.value 
  }
  showAddModal.value = true
}

const isDuplicate = computed(() => {
  const name = newCategory.value.name.trim()
  if (!name) return false
  return categoriesStore.categories.some(c => c.type === newCategory.value.type && c.name.trim().toLowerCase() === name.toLowerCase())
})

const isValid = computed(() => newCategory.value.name.trim().length > 0 && !isDuplicate.value)

const saveCategory = async () => {
  if (!isValid.value) return
  const data = { ...newCategory.value }
  activeType.value = data.type
  showAddModal.value = false

  await categoriesStore.addCategory(data)
  showToast(`تمت إضافة قسم «${data.name}» بنجاح`)
}

// حذف قسم
const categoryToDelete = ref(null)
const askDelete = (cat) => { categoryToDelete.value = cat }

const deleteCategory = async () => {
  const cat = categoryToDelete.value
  categoryToDelete.value = null
  if (!cat) return
  
  await categoriesStore.deleteCategory(cat.id)
  showToast(`تم حذف قسم «${cat.name}»`)
}

// استعادة الافتراضي
const restoring = ref(false)
const restoreDefaults = async () => {
  restoring.value = true
  try {
    const added = await categoriesStore.restoreDefaultCategories()
    showToast(added > 0 ? `تم استعادة ${added} قسم بنجاح` : 'جميع الأقسام الافتراضية موجودة بالفعل')
  } catch (err) {
    console.warn('Restore categories:', err)
  } finally {
    restoring.value = false
  }
}

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3500)
}
</script>
