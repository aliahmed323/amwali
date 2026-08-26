<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="الديون">
      <template #actions>
        <button @click="showAddModal = true" class="w-10 h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </TopBar>

    <div class="p-4 space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
          <p class="text-xs text-rose-400 mb-1">ديون علينا</p>
          <p class="text-xl font-bold text-white">{{ formatMoney(debtsStore.totalOwedByUs) }}</p>
        </div>
        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p class="text-xs text-emerald-400 mb-1">ديون لنا</p>
          <p class="text-xl font-bold text-white">{{ formatMoney(debtsStore.totalOwedToUs) }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
        <button v-for="tab in tabs" :key="tab.id" 
                @click="currentTab = tab.id"
                class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="currentTab === tab.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
          {{ tab.label }}
        </button>
      </div>

      <!-- Debts List -->
      <div v-if="filteredDebts.length > 0" class="space-y-3">
        <DebtCard 
          v-for="debt in filteredDebts" 
          :key="debt.id" 
          :debt="debt"
          @click="openDebtDetail(debt)"
          @pay="openPaymentModal(debt)"
        />
      </div>
      
      <EmptyState 
        v-else 
        icon="🤝" 
        title="لا توجد ديون" 
        :description="getEmptyStateDescription()"
      >
        <button v-if="currentTab !== 'settled'" @click="showAddModal = true" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-3 transition-colors">
          إضافة دين
        </button>
      </EmptyState>
    </div>

    <!-- Add Debt Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0">
          <h3 class="text-xl font-bold">إضافة دين جديد</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4">
          <div class="flex gap-2 p-1 bg-slate-800 rounded-xl mb-2">
            <button @click="newDebt.type = 'owe_others'" class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors" :class="newDebt.type === 'owe_others' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'">
              دين علينا (مطلوبين)
            </button>
            <button @click="newDebt.type = 'others_owe_us'" class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors" :class="newDebt.type === 'others_owe_us' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'">
              دين لنا (نطلب)
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم الشخص</label>
            <input v-model="newDebt.personName" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">المبلغ الإجمالي</label>
            <div class="relative">
              <input v-model.number="newDebt.totalAmount" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 focus:ring-2 focus:ring-blue-500 outline-none">
              <div class="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400">د.ع</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">تاريخ الاستحقاق (اختياري)</label>
            <input v-model="newDebt.dueDate" type="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">ملاحظات (اختياري)</label>
            <textarea v-model="newDebt.notes" rows="2" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-800 bg-slate-900 z-10 sticky bottom-0">
          <button @click="saveDebt" :disabled="!isNewDebtValid" class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 transition-colors">
            حفظ الدين
          </button>
        </div>
      </div>
    </div>

    <!-- Debt Detail Modal -->
    <div v-if="selectedDebt" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedDebt = null">
      <div class="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-bold">{{ selectedDebt.personName }}</h3>
            <span class="px-2 py-1 text-xs rounded-md" :class="selectedDebt.type === 'owe_others' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'">
              {{ selectedDebt.type === 'owe_others' ? 'علينا' : 'لنا' }}
            </span>
          </div>
          <button @click="selectedDebt = null" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-6">
          <!-- Progress -->
          <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div class="flex justify-between items-center mb-4">
              <div>
                <p class="text-sm text-slate-400 mb-1">المتبقي</p>
                <p class="text-2xl font-bold text-white">{{ formatMoney(selectedDebt.remainingAmount) }}</p>
              </div>
              <div class="text-end">
                <p class="text-sm text-slate-400 mb-1">الإجمالي</p>
                <p class="text-lg font-medium text-white">{{ formatMoney(selectedDebt.totalAmount) }}</p>
              </div>
            </div>
            
            <div class="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div class="h-2 rounded-full transition-all" 
                   :class="selectedDebt.type === 'owe_others' ? 'bg-rose-500' : 'bg-emerald-500'"
                   :style="`width: ${Math.min((selectedDebt.paidAmount / selectedDebt.totalAmount) * 100, 100)}%`">
              </div>
            </div>
            <p class="text-xs text-center text-slate-400">تم سداد {{ formatMoney(selectedDebt.paidAmount) }}</p>
          </div>

          <div v-if="selectedDebt.status === 'active'" class="flex gap-2">
            <button @click="openPaymentModal(selectedDebt)" class="flex-1 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 font-medium rounded-xl py-3 border border-blue-500/20 transition-colors">
              تسديد دفعة
            </button>
            <button @click="markDebtAsPaid" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl py-3 border border-slate-700 transition-colors">
              تصفية الدين
            </button>
          </div>

          <div class="border-t border-slate-800 pt-4">
            <button @click="confirmDeleteDebt" class="w-full text-rose-400 text-sm font-medium py-2">
              حذف السجل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Modal -->
    <div v-if="paymentModal.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-800">
        <h3 class="text-xl font-bold mb-4">تسديد دفعة</h3>
        
        <div class="mb-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-sm">
          <div class="flex justify-between mb-1">
            <span class="text-slate-400">المبلغ المتبقي:</span>
            <span class="font-bold text-white">{{ formatMoney(paymentModal.debt?.remainingAmount) }}</span>
          </div>
          <div v-if="paymentModal.amount > 0" class="flex justify-between mt-2 pt-2 border-t border-slate-700">
            <span class="text-slate-400">بعد الدفعة:</span>
            <span class="font-bold text-white">{{ formatMoney(paymentModal.debt?.remainingAmount - paymentModal.amount) }}</span>
          </div>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">مبلغ الدفعة</label>
            <div class="relative">
              <input v-model.number="paymentModal.amount" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 focus:ring-2 focus:ring-blue-500 outline-none">
              <div class="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400">د.ع</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">ملاحظة (اختياري)</label>
            <input v-model="paymentModal.note" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
        </div>
        
        <div class="flex gap-3">
          <button @click="paymentModal.show = false" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl py-3 transition-colors">
            إلغاء
          </button>
          <button @click="submitPayment" :disabled="!isPaymentValid" class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl py-3 transition-colors">
            تأكيد
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="حذف الدين"
      message="هل أنت متأكد من حذف هذا الدين؟ سيتم حذف جميع سجلات الدفع المرتبطة به."
      confirmText="حذف"
      variant="danger"
      @confirm="deleteDebt"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDebtsStore } from '@/stores/debts'
import TopBar from '@/components/TopBar.vue'
import DebtCard from '@/components/DebtCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { formatMoney, formatDate } from '@/utils/formatters'

const debtsStore = useDebtsStore()

onMounted(() => {
  debtsStore.fetchDebts()
})

// Tabs
const tabs = [
  { id: 'owe_others', label: 'علينا' },
  { id: 'others_owe_us', label: 'لنا' },
  { id: 'settled', label: 'مُسددة' }
]
const currentTab = ref('owe_others')

const filteredDebts = computed(() => {
  if (currentTab.value === 'settled') {
    return debtsStore.settledDebts
  }
  return debtsStore.activeDebts.filter(d => d.type === currentTab.value)
})

const getEmptyStateDescription = () => {
  if (currentTab.value === 'owe_others') return 'ليس عليك أي ديون حالياً. ممتاز!'
  if (currentTab.value === 'others_owe_us') return 'لا يوجد أشخاص مدينين لك حالياً.'
  return 'لا توجد ديون مسددة.'
}

// Add Debt
const showAddModal = ref(false)
const newDebt = ref({
  type: 'owe_others',
  personName: '',
  totalAmount: null,
  dueDate: '',
  notes: ''
})

const isNewDebtValid = computed(() => {
  return newDebt.value.personName.trim() !== '' && newDebt.value.totalAmount > 0
})

const saveDebt = async () => {
  if (!isNewDebtValid.value) return
  await debtsStore.addDebt({
    ...newDebt.value,
    paidAmount: 0,
    remainingAmount: newDebt.value.totalAmount,
    status: 'active'
  })
  showAddModal.value = false
  newDebt.value = { type: 'owe_others', personName: '', totalAmount: null, dueDate: '', notes: '' }
}

// Debt Detail
const selectedDebt = ref(null)
const openDebtDetail = (debt) => {
  selectedDebt.value = debt
}

// Add Payment
const paymentModal = ref({
  show: false,
  amount: null,
  note: '',
  debt: null
})

const isPaymentValid = computed(() => {
  const amt = paymentModal.value.amount
  return amt > 0 && amt <= paymentModal.value.debt?.remainingAmount
})

const openPaymentModal = (debt) => {
  paymentModal.value = { show: true, amount: null, note: '', debt }
}

const submitPayment = async () => {
  const { amount, note, debt } = paymentModal.value
  if (!isPaymentValid.value) return

  await debtsStore.addPayment(debt.id, amount, note)
  
  if (selectedDebt.value && selectedDebt.value.id === debt.id) {
    selectedDebt.value = debtsStore.debts.find(d => d.id === debt.id)
  }
  
  paymentModal.value.show = false
}

const markDebtAsPaid = async () => {
  if (selectedDebt.value) {
    await debtsStore.markAsPaid(selectedDebt.value.id)
    selectedDebt.value = debtsStore.debts.find(d => d.id === selectedDebt.value.id)
  }
}

// Delete
const showDeleteConfirm = ref(false)
const confirmDeleteDebt = () => {
  showDeleteConfirm.value = true
}

const deleteDebt = async () => {
  if (selectedDebt.value) {
    await debtsStore.deleteDebt(selectedDebt.value.id)
    showDeleteConfirm.value = false
    selectedDebt.value = null
  }
}
</script>
