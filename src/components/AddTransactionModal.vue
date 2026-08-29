<template>
  <div v-if="show" class="fixed inset-0 z-[70] flex flex-col justify-end">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" @touchmove.prevent></div>
    <div class="relative bg-slate-900 rounded-t-3xl w-full overflow-hidden flex flex-col" style="max-height: 88vh;">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
        <h2 class="text-xl font-bold text-white">إضافة معاملة</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto flex-1 p-5 space-y-4">
        
        <!-- نوع المعاملة -->
        <div class="flex bg-slate-800 rounded-xl p-1 gap-1">
          <button @click="form.type = 'income'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', form.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400']">
            ⬆ إيراد
          </button>
          <button @click="form.type = 'expense'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', form.type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400']">
            ⬇ مصروف
          </button>
          <button @click="form.type = 'transfer'" :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', form.type === 'transfer' ? 'bg-blue-500 text-white' : 'text-slate-400']">
            ↔ تحويل
          </button>
        </div>

        <!-- المبلغ -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">المبلغ (د.ع)</label>
          <div class="relative flex items-center">
            <input
              type="text"
              inputmode="numeric"
              v-model="displayAmount"
              @input="onAmountInput"
              @focus="selectAll"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-3xl font-bold px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <button @click="showCalc = true" class="absolute start-3 p-2 text-blue-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </button>
          </div>
          <p v-if="form.amount > 0" class="text-center text-slate-400 text-sm mt-1">
            {{ formatMoney(form.amount) }}
          </p>
        </div>

        <!-- المحفظة المصدر -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">
            {{ form.type === 'transfer' ? 'من محفظة' : 'المحفظة' }}
          </label>
          <select v-model="form.walletId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
            <option value="" disabled>اختر المحفظة</option>
            <option v-for="w in walletsStore.wallets" :key="w.id" :value="w.id">
              {{ w.icon }} {{ w.name }} — {{ formatMoney(w.currentBalance) }}
            </option>
          </select>
          <p v-if="walletsStore.wallets.length === 0" class="text-amber-400 text-xs mt-1 px-1">
            ⚠ لا توجد محافظ. أنشئ محفظة أولاً من قسم المحافظ.
          </p>
        </div>

        <!-- المحفظة المستلمة (تحويل فقط) -->
        <div v-if="form.type === 'transfer'">
          <label class="block text-sm font-medium text-slate-300 mb-2">إلى محفظة</label>
          <select v-model="form.toWalletId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
            <option value="" disabled>اختر المحفظة</option>
            <option v-for="w in walletsStore.wallets.filter(w => w.id !== form.walletId)" :key="w.id" :value="w.id">
              {{ w.icon }} {{ w.name }} — {{ formatMoney(w.currentBalance) }}
            </option>
          </select>
        </div>

        <!-- القسم -->
        <div v-if="form.type !== 'transfer'">
          <label class="block text-sm font-medium text-slate-300 mb-2">القسم</label>
          <select v-model="form.categoryId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
            <option value="" disabled>اختر القسم</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
              {{ c.icon }} {{ c.name }}
            </option>
          </select>
          <p v-if="filteredCategories.length === 0" class="text-amber-400 text-xs mt-1 px-1">
            ⚠ لا توجد أقسام لهذا النوع. أنشئ قسماً من قسم الإعدادات.
          </p>
        </div>

        <!-- العنوان -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">العنوان (اختياري)</label>
          <input type="text" v-model="form.title"
            class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500"
            placeholder="مثال: راتب، إيجار، سوبر ماركت..." />
        </div>

        <!-- التاريخ -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">التاريخ</label>
          <input type="date" v-model="form.date"
            class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- ملاحظات -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">ملاحظات (اختياري)</label>
          <textarea v-model="form.notes" rows="2"
            class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500"
            placeholder="تفاصيل إضافية..."></textarea>
        </div>

        <!-- رسالة خطأ -->
        <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm text-center">
          {{ errorMsg }}
        </div>

        <!-- زر الحفظ -->
        <button @click="save" :disabled="loading || !isValid"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl px-6 py-4 transition-colors flex justify-center items-center gap-2">
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ loading ? 'جاري الحفظ...' : 'حفظ المعاملة' }}</span>
        </button>

        <!-- مسافة اضافية تمنع تغطية زر الحفظ -->
        <div class="h-4"></div>
      </div>
    </div>

    <CalculatorModal :show="showCalc" @close="showCalc = false" @use-result="val => { setAmount(val); showCalc = false }" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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

const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()

const loading = ref(false)
const showCalc = ref(false)
const errorMsg = ref('')
const displayAmount = ref('')

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

// فلترة الأقسام حسب نوع المعاملة
const filteredCategories = computed(() =>
  categoriesStore.categories.filter(c => c.type === form.value.type)
)

// التحقق من صحة البيانات
const isValid = computed(() => {
  if (!form.value.amount || form.value.amount <= 0) return false
  if (!form.value.walletId) return false
  if (form.value.type === 'transfer' && (!form.value.toWalletId || form.value.walletId === form.value.toWalletId)) return false
  if (form.value.type !== 'transfer' && !form.value.categoryId) return false
  return true
})

// دالة تنسيق المبلغ بالفوارز أثناء الكتابة
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

// إعادة تعيين النموذج عند الفتح
watch(() => props.show, (newVal) => {
  if (newVal) {
    errorMsg.value = ''
    displayAmount.value = ''
    form.value = {
      type: props.initialType,
      amount: 0,
      walletId: walletsStore.wallets[0]?.id || '',
      toWalletId: '',
      categoryId: '',
      title: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    }
    // جلب البيانات إذا لم تكن محملة
    if (walletsStore.wallets.length === 0) walletsStore.fetchWallets()
    if (categoriesStore.categories.length === 0) categoriesStore.fetchCategories()
  }
})

// عند تغيير النوع نعيد اختيار القسم
watch(() => form.value.type, () => {
  form.value.categoryId = ''
})

const save = async () => {
  errorMsg.value = ''
  if (!isValid.value) return
  loading.value = true
  try {
    await transactionsStore.addTransaction({
      ...form.value,
      fromWalletId: form.value.walletId
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
