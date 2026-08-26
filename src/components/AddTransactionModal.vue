<template>
  <div v-if="show" class="fixed inset-0 z-50 flex flex-col justify-end">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-slate-900 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
      <div class="flex items-center justify-between p-5 border-b border-slate-800">
        <h2 class="text-xl font-bold text-white">إضافة معاملة</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="p-5 space-y-5">
        <!-- Type Selector -->
        <div class="flex bg-slate-800 rounded-xl p-1 gap-1">
          <button @click="form.type = 'income'" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', form.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-300']">إيراد</button>
          <button @click="form.type = 'expense'" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', form.type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-300']">مصروف</button>
          <button @click="form.type = 'transfer'" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', form.type === 'transfer' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-300']">تحويل</button>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2 text-center">المبلغ</label>
          <div class="relative flex items-center justify-center">
            <input type="number" v-model="form.amount" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-4 text-center text-3xl font-bold" placeholder="0" />
            <button @click="showCalc = true" class="absolute start-3 p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </button>
          </div>
        </div>

        <!-- Wallet -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">المحفظة</label>
          <select v-model="form.walletId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
             <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.icon }} {{ w.name }} ({{ formatMoney(w.currentBalance) }})</option>
          </select>
        </div>

        <!-- To Wallet (Transfer) -->
        <div v-if="form.type === 'transfer'">
          <label class="block text-sm font-medium text-slate-300 mb-2">المحفظة المستلمة</label>
          <select v-model="form.toWalletId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
             <option v-for="w in wallets.filter(w => w.id !== form.walletId)" :key="w.id" :value="w.id">{{ w.icon }} {{ w.name }} ({{ formatMoney(w.currentBalance) }})</option>
          </select>
        </div>

        <!-- Category -->
        <div v-if="form.type !== 'transfer'">
          <label class="block text-sm font-medium text-slate-300 mb-2">القسم</label>
          <select v-model="form.categoryId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
             <option v-for="c in filteredCategories" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name }}</option>
          </select>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">العنوان</label>
          <input type="text" v-model="form.title" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500" placeholder="عنوان المعاملة" />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">ملاحظات</label>
          <textarea v-model="form.notes" rows="2" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500" placeholder="تفاصيل إضافية..."></textarea>
        </div>

        <!-- Spender -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">من صرف؟</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.spenderName" value="الزوج" class="text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700">
              <span class="text-white">الزوج</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.spenderName" value="الزوجة" class="text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700">
              <span class="text-white">الزوجة</span>
            </label>
          </div>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">التاريخ</label>
          <input type="date" v-model="form.date" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500" />
        </div>

        <button @click="save" :disabled="loading || !isValid" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-4 mt-4 transition-colors disabled:opacity-50 flex justify-center items-center">
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          <span>حفظ</span>
        </button>
      </div>
    </div>
    
    <CalculatorModal :show="showCalc" @close="showCalc = false" @use-result="val => { form.amount = val; showCalc = false }" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatMoney } from '../utils/formatters.js'
import CalculatorModal from './CalculatorModal.vue'
// Mock stores for UI development. In real app, import from '../stores/...'
// import { useWalletsStore } from '../stores/wallets'
// import { useCategoriesStore } from '../stores/categories'
// import { useTransactionsStore } from '../stores/transactions'
// import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: Boolean,
  initialType: { type: String, default: 'expense' }
})
const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const showCalc = ref(false)

const form = ref({
  type: props.initialType,
  amount: '',
  walletId: '',
  toWalletId: '',
  categoryId: '',
  title: '',
  notes: '',
  spenderName: 'الزوج', // Default, should be authStore.userName
  date: new Date().toISOString().split('T')[0]
})

// Mocks
const wallets = ref([
  { id: '1', name: 'محفظة النقود', icon: '💵', currentBalance: 500000 },
  { id: '2', name: 'زين كاش', icon: '📱', currentBalance: 150000 }
])
const categories = ref([
  { id: 'c1', name: 'إيجار', icon: '🏠', type: 'expense' },
  { id: 'c2', name: 'إيراد التاكسي', icon: '🚕', type: 'income' }
])

const filteredCategories = computed(() => categories.value.filter(c => c.type === form.value.type))

watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value.type = props.initialType
    form.value.amount = ''
    form.value.title = ''
    form.value.notes = ''
    // form.value.walletId = wallets.value[0]?.id || ''
  }
})

const isValid = computed(() => {
  if (!form.value.amount || form.value.amount <= 0) return false
  if (!form.value.walletId) return false
  if (form.value.type === 'transfer' && (!form.value.toWalletId || form.value.walletId === form.value.toWalletId)) return false
  if (form.value.type !== 'transfer' && !form.value.categoryId) return false
  return true
})

const save = async () => {
  if (!isValid.value) return
  loading.value = true
  try {
    // await transactionsStore.addTransaction({...form.value})
    await new Promise(r => setTimeout(r, 500))
    emit('saved')
    emit('close')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
