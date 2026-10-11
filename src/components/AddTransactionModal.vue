<template>
  <div v-if="show" class="fixed inset-0 z-[70] flex flex-col justify-end">
    <!-- Backdrop with stop click to prevent ghost-clicks -->
    <div 
      class="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
      @click.self="handleBackdropClick"
    ></div>

    <div 
      class="relative bg-slate-900 rounded-t-3xl w-full flex flex-col overflow-hidden shadow-2xl border-t border-slate-800 z-10" 
      style="max-height: 92vh;"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0 bg-slate-900">
        <h2 class="text-xl font-bold text-white">إضافة معاملة جديدة</h2>
        <button 
          @click="$emit('close')" 
          type="button"
          class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-400 hover:text-white flex items-center justify-center transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto flex-1 p-5 space-y-5">
        <!-- نوع المعاملة -->
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-2">نوع العملية</label>
          <div class="flex bg-slate-800 rounded-2xl p-1 gap-1">
            <button 
              type="button"
              @click="setType('income')" 
              :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1', 
                form.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200']"
            >
              <span>⬆</span>
              <span>إيراد</span>
            </button>
            <button 
              type="button"
              @click="setType('expense')" 
              :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1', 
                form.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200']"
            >
              <span>⬇</span>
              <span>مصروف</span>
            </button>
            <button 
              type="button"
              @click="setType('transfer')" 
              :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1', 
                form.type === 'transfer' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200']"
            >
              <span>↔</span>
              <span>تحويل</span>
            </button>
          </div>
        </div>

        <!-- المبلغ -->
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-2">المبلغ (د.ع)</label>
          <div class="relative flex items-center">
            <input
              type="text"
              inputmode="numeric"
              v-model="displayAmount"
              @input="onAmountInput"
              @focus="selectAll"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-2xl text-white text-center text-3xl font-extrabold px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="0"
            />
            <button 
              type="button"
              @click="showCalc = true" 
              class="absolute start-3 p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-blue-400 active:scale-90 transition-all"
              title="الحاسبة"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </button>
          </div>
          <p v-if="form.amount > 0" class="text-center text-slate-400 text-sm mt-1.5 font-bold">
            {{ formatMoney(form.amount) }}
          </p>
        </div>

        <!-- اختيار المحفظة (أزرار تفاعلية بدلاً من القائمة المنسدلة التي كانت تغلق الصفحة) -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xs font-bold text-slate-400">
              {{ form.type === 'transfer' ? 'من محفظة (المصدر):' : 'المحفظة:' }}
            </label>
            <span v-if="selectedWalletName" class="text-xs text-blue-400 font-bold">
              المحددة: {{ selectedWalletName }}
            </span>
          </div>

          <div v-if="walletsStore.wallets.length > 0" class="grid grid-cols-2 gap-2.5">
            <button
              v-for="w in walletsStore.wallets"
              :key="w.id"
              type="button"
              @click="form.walletId = w.id"
              class="p-3 rounded-2xl border text-start transition-all flex items-center gap-2.5 active:scale-95"
              :class="form.walletId === w.id 
                ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10 scale-[1.02]' 
                : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'"
            >
              <span class="text-2xl flex-shrink-0">{{ w.icon || (w.type === 'credit_card' ? '💳' : '💵') }}</span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-sm text-white truncate">{{ w.name }}</p>
                <p class="text-[11px] text-slate-400 font-medium">{{ formatMoney(w.currentBalance) }}</p>
              </div>
              <span v-if="form.walletId === w.id" class="text-blue-400 font-bold text-sm">✓</span>
            </button>
          </div>
          <p v-else class="text-amber-400 text-xs bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            ⚠ لا توجد محافظ مسجلة بعد.
          </p>
        </div>

        <!-- المحفظة المستلمة (في التحويل فقط) -->
        <div v-if="form.type === 'transfer'">
          <label class="block text-xs font-bold text-slate-400 mb-2">إلى محفظة (المستلم):</label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              v-for="w in walletsStore.wallets.filter(w => w.id !== form.walletId)"
              :key="w.id"
              type="button"
              @click="form.toWalletId = w.id"
              class="p-3 rounded-2xl border text-start transition-all flex items-center gap-2.5 active:scale-95"
              :class="form.toWalletId === w.id 
                ? 'bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02]' 
                : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'"
            >
              <span class="text-2xl flex-shrink-0">{{ w.icon || '💳' }}</span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-sm text-white truncate">{{ w.name }}</p>
                <p class="text-[11px] text-slate-400 font-medium">{{ formatMoney(w.currentBalance) }}</p>
              </div>
              <span v-if="form.toWalletId === w.id" class="text-emerald-400 font-bold text-sm">✓</span>
            </button>
          </div>
        </div>

        <!-- اختيار القسم (أزرار تفاعلية بدلاً من القائمة المنسدلة التي كانت تغلق الصفحة) -->
        <div v-if="form.type !== 'transfer'">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xs font-bold text-slate-400">القسم:</label>
            <button 
              type="button" 
              @click="goToCategories(true)" 
              class="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>＋ إدارة الأقسام</span>
            </button>
          </div>

          <div v-if="filteredCategories.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <button
              v-for="c in filteredCategories"
              :key="c.id"
              type="button"
              @click="form.categoryId = c.id"
              class="p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95"
              :class="form.categoryId === c.id 
                ? (form.type === 'income' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 scale-105' 
                    : 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10 scale-105')
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'"
            >
              <span class="text-2xl">{{ c.icon || '📦' }}</span>
              <span class="text-xs font-bold truncate max-w-full leading-tight">{{ c.name }}</span>
            </button>
          </div>

          <div v-else class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 space-y-2 text-center">
            <p class="font-bold">⚠ لا توجد أقسام مسجلة لهذا النوع بعد.</p>
            <div class="flex gap-2">
              <button 
                type="button" 
                @click="goToCategories(true)" 
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 transition-all"
              >
                إنشاء قسم
              </button>
              <button 
                type="button" 
                @click="restoreDefaults" 
                :disabled="restoring" 
                class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl py-2.5 transition-all"
              >
                {{ restoring ? 'جاري...' : 'الأقسام الافتراضية' }}
              </button>
            </div>
          </div>
        </div>

        <!-- العنوان -->
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-2">الوصف / العنوان (اختياري)</label>
          <input 
            type="text" 
            v-model="form.title"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-2xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder-slate-500"
            placeholder="مثال: مشتريات سوبرماركت، صيانة، هدية..." 
          />
        </div>

        <!-- التاريخ -->
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-2">التاريخ</label>
          <input 
            type="date" 
            v-model="form.date"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-2xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <!-- ملاحظات -->
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-2">ملاحظات إضافية (اختياري)</label>
          <textarea 
            v-model="form.notes" 
            rows="2"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-2xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-500"
            placeholder="أي تفاصيل تود تذكرها..."
          ></textarea>
        </div>

        <!-- رسالة خطأ -->
        <div v-if="errorMsg" class="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-2xl text-xs font-bold text-center">
          {{ errorMsg }}
        </div>
      </div>

      <!-- زر الحفظ الثابت في الأسفل -->
      <div class="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-900">
        <button 
          @click="save" 
          :disabled="loading || !isValid"
          class="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl px-6 py-4 transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2"
        >
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ loading ? 'جاري الحفظ...' : 'حفظ المعاملة' }}</span>
        </button>
      </div>
    </div>

    <CalculatorModal 
      :show="showCalc" 
      @close="showCalc = false" 
      @use-result="val => { setAmount(val); showCalc = false }" 
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatMoney } from '../utils/formatters.js'
import CalculatorModal from './CalculatorModal.vue'
import { useWalletsStore } from '../stores/wallets'
import { useCategoriesStore } from '../stores/categories'
import { useTransactionsStore } from '../stores/transactions'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: Boolean,
  initialType: { type: String, default: 'expense' }
})
const emit = defineEmits(['close', 'saved'])

const router = useRouter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()

const loading = ref(false)
const showCalc = ref(false)
const errorMsg = ref('')
const displayAmount = ref('')
const restoring = ref(false)

const form = ref({
  type: props.initialType,
  amount: 0,
  walletId: '',
  toWalletId: '',
  categoryId: '',
  title: '',
  notes: '',
  date: new Date().toISOString().split('T')[0]
})

const handleBackdropClick = () => {
  emit('close')
}

const setType = (t) => {
  form.value.type = t
  form.value.categoryId = ''
  // اختيار أول قسم متاح تلقائياً لتسهيل التجربة
  const available = categoriesStore.categories.filter(c => c.type === t)
  if (available.length > 0) {
    form.value.categoryId = available[0].id
  }
}

const selectedWalletName = computed(() => {
  const w = walletsStore.wallets.find(x => x.id === form.value.walletId)
  return w ? `${w.icon || ''} ${w.name}` : ''
})

// فلترة الأقسام حسب النوع المختار
const filteredCategories = computed(() =>
  categoriesStore.categories.filter(c => c.type === form.value.type)
)

const isValid = computed(() => {
  if (!form.value.amount || form.value.amount <= 0) return false
  if (!form.value.walletId) return false
  if (form.value.type === 'transfer' && (!form.value.toWalletId || form.value.walletId === form.value.toWalletId)) return false
  if (form.value.type !== 'transfer' && !form.value.categoryId) return false
  return true
})

function onAmountInput(e) {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  form.value.amount = raw ? parseInt(raw, 10) : 0
  displayAmount.value = raw ? parseInt(raw, 10).toLocaleString('en-US') : ''
}

function setAmount(val) {
  form.value.amount = val
  displayAmount.value = val ? parseInt(val, 10).toLocaleString('en-US') : ''
}

function selectAll(e) {
  e.target.select()
}

function goToCategories(openAdd = false) {
  const query = { type: form.value.type === 'income' ? 'income' : 'expense' }
  if (openAdd) query.add = '1'
  emit('close')
  router.push({ path: '/categories', query })
}

async function restoreDefaults() {
  restoring.value = true
  try {
    await categoriesStore.restoreDefaultCategories()
  } catch (err) {
    console.error('Error restoring categories:', err)
  } finally {
    restoring.value = false
  }
}

// إعادة ضبط النموذج عند الفتح
watch(() => props.show, (newVal) => {
  if (newVal) {
    errorMsg.value = ''
    displayAmount.value = ''
    
    // اختيار أول محفظة افتراضياً
    const firstWallet = walletsStore.wallets[0]?.id || ''
    
    // اختيار أول قسم افتراضياً
    const cats = categoriesStore.categories.filter(c => c.type === props.initialType)
    const firstCat = cats[0]?.id || ''

    form.value = {
      type: props.initialType,
      amount: 0,
      walletId: firstWallet,
      toWalletId: '',
      categoryId: firstCat,
      title: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    }

    if (walletsStore.wallets.length === 0) walletsStore.fetchWallets()
    if (categoriesStore.categories.length === 0) categoriesStore.fetchCategories()
  }
})

const save = async () => {
  errorMsg.value = ''
  if (!isValid.value) return

  loading.value = true
  try {
    const category = categoriesStore.categories.find(c => c.id === form.value.categoryId)
    const wallet = walletsStore.getWalletById(form.value.walletId)
    const toWallet = form.value.type === 'transfer' ? walletsStore.getWalletById(form.value.toWalletId) : null

    await transactionsStore.addTransaction({
      ...form.value,
      categoryId: form.value.type === 'transfer' ? '' : form.value.categoryId,
      categoryName: form.value.type === 'transfer' ? 'تحويل' : (category?.name || 'عام'),
      categoryIcon: form.value.type === 'transfer' ? '🔄' : (category?.icon || '📦'),
      walletName: wallet?.name || '',
      toWalletName: toWallet?.name || '',
      fromWalletId: form.value.walletId,
      createdBy: authStore.user?.email || ''
    })
    
    emit('saved')
    emit('close')
  } catch (err) {
    errorMsg.value = 'حدث خطأ أثناء الحفظ، يرجى المحاولة مجدداً.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
