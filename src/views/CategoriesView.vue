<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="الأقسام">
      <template #actions>
        <button @click="openAddModal" class="w-10 h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors" aria-label="إضافة قسم">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </TopBar>

    <div class="p-4 space-y-4">
      <!-- تبويب النوع -->
      <div class="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
        <button @click="activeType = 'expense'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', activeType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400']">
          ⬇ أقسام المصروفات ({{ categoriesStore.expenseCategories.length }})
        </button>
        <button @click="activeType = 'income'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', activeType === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400']">
          ⬆ أقسام الإيرادات ({{ categoriesStore.incomeCategories.length }})
        </button>
      </div>

      <!-- خطأ في التحميل -->
      <div v-if="categoriesStore.error" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm">
        تعذر تحميل الأقسام: {{ categoriesStore.error.code || categoriesStore.error.message }}
      </div>

      <!-- القائمة -->
      <div v-if="visibleCategories.length > 0" class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div
          v-for="(cat, i) in visibleCategories"
          :key="cat.id"
          class="flex items-center gap-3 p-4"
          :class="i < visibleCategories.length - 1 ? 'border-b border-slate-800/50' : ''"
        >
          <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">{{ cat.icon || '📦' }}</div>
          <div class="flex-1 font-medium text-slate-200">{{ cat.name }}</div>
          <button @click="askDelete(cat)" class="p-2 text-slate-500 hover:text-rose-400 transition-colors" aria-label="حذف القسم">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <EmptyState
        v-else-if="!categoriesStore.loading"
        icon="🗂️"
        title="لا توجد أقسام"
        :description="activeType === 'expense' ? 'أضف قسماً للمصروفات أو استعد الأقسام الافتراضية' : 'أضف قسماً للإيرادات أو استعد الأقسام الافتراضية'"
      />

      <div class="grid grid-cols-1 gap-3">
        <button @click="openAddModal" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 transition-colors">
          ＋ إضافة قسم جديد
        </button>
        <button @click="restoreDefaults" :disabled="restoring" class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-medium rounded-xl px-6 py-3 border border-slate-800 transition-colors">
          {{ restoring ? 'جاري الاستعادة...' : '↺ استعادة الأقسام الافتراضية' }}
        </button>
      </div>
    </div>

    <!-- نافذة إضافة قسم -->
    <div v-if="showAddModal" class="fixed inset-0 z-[70] flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddModal = false" @touchmove.prevent></div>
      <div class="relative bg-slate-900 rounded-t-3xl w-full flex flex-col overflow-hidden" style="max-height: 88vh;">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <h3 class="text-xl font-bold">إضافة قسم جديد</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2 rounded-lg">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 p-5 space-y-4">
          <div class="flex bg-slate-800 rounded-xl p-1 gap-1">
            <button @click="newCategory.type = 'expense'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', newCategory.type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400']">
              ⬇ مصروف
            </button>
            <button @click="newCategory.type = 'income'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', newCategory.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400']">
              ⬆ إيراد
            </button>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم القسم</label>
            <input v-model="newCategory.name" type="text" placeholder="مثال: مطاعم، هدايا، أقساط" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 px-4 py-3">
            <p v-if="isDuplicate" class="text-amber-400 text-xs mt-1 px-1">⚠ يوجد قسم بنفس الاسم لهذا النوع.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الأيقونة</label>
            <div class="grid grid-cols-6 gap-2">
              <button v-for="icon in icons" :key="icon" @click="newCategory.icon = icon" type="button"
                class="h-12 flex items-center justify-center text-2xl rounded-xl border transition-colors"
                :class="newCategory.icon === icon ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700'">
                {{ icon }}
              </button>
            </div>
          </div>
          <div v-if="addError" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm text-center">
            {{ addError }}
          </div>
          <div class="h-2"></div>
        </div>
        <div class="p-4 border-t border-slate-800 flex-shrink-0">
          <button @click="saveCategory" :disabled="!isValid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl px-6 py-4 transition-colors">
            حفظ القسم
          </button>
        </div>
      </div>
    </div>

    <!-- تأكيد الحذف -->
    <ConfirmDialog
      :show="!!categoryToDelete"
      title="حذف القسم"
      :message="`هل تريد حذف قسم «${categoryToDelete?.name || ''}»؟ المعاملات السابقة المرتبطة به ستبقى كما هي.`"
      confirmText="حذف"
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

const route = useRoute()
const categoriesStore = useCategoriesStore()

const activeType = ref(route.query.type === 'income' ? 'income' : 'expense')

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

// إضافة قسم
const icons = ['🏠', '⛽', '🛒', '💊', '📱', '🎓', '👕', '🔧', '💡', '🚌', '🎉', '📦', '🍔', '☕', '🎁', '👶', '🧾', '✈️', '🚕', '💰', '💵', '💼', '📈', '🏦']
const showAddModal = ref(false)
const addError = ref('')
const newCategory = ref({ name: '', icon: '📦', type: 'expense' })

const openAddModal = () => {
  addError.value = ''
  newCategory.value = { name: '', icon: activeType.value === 'income' ? '💵' : '📦', type: activeType.value }
  showAddModal.value = true
}

const isDuplicate = computed(() => {
  const name = newCategory.value.name.trim()
  if (!name) return false
  return categoriesStore.categories.some(c => c.type === newCategory.value.type && c.name.trim() === name)
})

const isValid = computed(() => newCategory.value.name.trim() !== '' && !isDuplicate.value)

const saveCategory = () => {
  if (!isValid.value) return
  const data = { ...newCategory.value }
  activeType.value = data.type
  showAddModal.value = false

  // Firestore يضيف القسم محلياً فوراً؛ لا ننتظر تأكيد الخادم حتى لا تتعلق الواجهة
  categoriesStore.addCategory(data).catch((err) => {
    console.error('Error adding category:', err)
    alert('تعذر إضافة القسم: ' + (err?.code || err?.message || 'خطأ غير معروف'))
  })
}

// حذف قسم
const categoryToDelete = ref(null)
const askDelete = (cat) => { categoryToDelete.value = cat }

const deleteCategory = () => {
  const cat = categoryToDelete.value
  categoryToDelete.value = null
  if (!cat) return
  categoriesStore.deleteCategory(cat.id).catch((err) => {
    console.error('Error deleting category:', err)
    alert(`تعذر حذف القسم «${cat.name}»: ` + (err?.code || err?.message || 'خطأ غير معروف'))
  })
}

// استعادة الافتراضي
const restoring = ref(false)
const restoreDefaults = async () => {
  restoring.value = true
  try {
    const added = await categoriesStore.restoreDefaultCategories()
    alert(added > 0 ? `تمت إضافة ${added} قسم افتراضي.` : 'جميع الأقسام الافتراضية موجودة بالفعل.')
  } catch (err) {
    console.error('Error restoring categories:', err)
    alert('تعذر استعادة الأقسام: ' + (err?.code || err?.message || 'خطأ غير معروف'))
  } finally {
    restoring.value = false
  }
}
</script>
