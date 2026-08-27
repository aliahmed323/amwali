<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="القاصات">
      <template #actions>
        <button @click="showAddModal = true" class="w-10 h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </TopBar>

    <div class="p-4 space-y-6">
      <!-- Summary -->
      <div class="bg-gradient-to-br from-amber-900/40 to-slate-900 rounded-2xl border border-amber-900/30 p-5">
        <p class="text-sm text-slate-400 mb-1">إجمالي المدخرات</p>
        <h2 class="text-3xl font-bold text-amber-400 mb-4">{{ formatMoney(cashBoxesStore.totalSaved) }}</h2>
        <div class="flex gap-4 text-sm">
          <div class="flex items-center gap-1 text-slate-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{{ cashBoxesStore.activeBoxes.length }} نشطة</span>
          </div>
          <div class="flex items-center gap-1 text-slate-300">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{{ cashBoxesStore.completedBoxes.length }} مكتملة</span>
          </div>
        </div>
      </div>

      <!-- Cash Boxes List -->
      <div v-if="cashBoxesStore.cashBoxes.length > 0" class="space-y-4">
        <CashBoxCard 
          v-for="box in cashBoxesStore.cashBoxes" 
          :key="box.id" 
          :box="box"
          @click="openBoxDetail(box)"
          @deposit="openDepositModal(box)"
          @withdraw="openWithdrawModal(box)"
        />
      </div>
      
      <EmptyState 
        v-else 
        icon="📦" 
        title="لا توجد قاصات" 
        description="أنشئ قاصة جديدة للبدء في توفير الأموال لأهدافك"
      >
        <button @click="showAddModal = true" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-3 transition-colors">
          إنشاء قاصة
        </button>
      </EmptyState>
    </div>

    <!-- Add Cash Box Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div class="bg-slate-900 rounded-t-3xl w-full flex flex-col" style="max-height: 85vh;">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <h3 class="text-xl font-bold">إنشاء قاصة جديدة</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2 rounded-lg">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم القاصة</label>
            <input v-model="newBox.title" type="text" placeholder="مثال: سيارة جديدة، سفرة" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">المبلغ المستهدف (د.ع)</label>
            <input v-model.number="newBox.targetAmount" type="number" placeholder="0" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">تاريخ الهدف (اختياري)</label>
            <input v-model="newBox.targetDate" type="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الرمز</label>
            <div class="grid grid-cols-5 gap-2">
              <button v-for="icon in icons" :key="icon" @click="newBox.icon = icon" type="button"
                class="h-12 flex items-center justify-center text-2xl rounded-xl border transition-colors"
                :class="newBox.icon === icon ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-800 border-slate-700'">
                {{ icon }}
              </button>
            </div>
          </div>
          <div class="h-2"></div>
        </div>
        <div class="p-4 border-t border-slate-800 flex-shrink-0">
          <button @click="saveCashBox" :disabled="!isNewBoxValid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl px-6 py-4 transition-colors">
            حفظ القاصة
          </button>
        </div>
      </div>
    </div>

    <!-- Box Detail Modal -->
    <div v-if="selectedBox" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedBox = null">
      <div class="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
              {{ selectedBox.icon }}
            </div>
            <h3 class="text-xl font-bold">{{ selectedBox.title }}</h3>
          </div>
          <button @click="selectedBox = null" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-6">
          <!-- Progress -->
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-slate-400">الرصيد الحالي</span>
              <span class="text-slate-400">الهدف</span>
            </div>
            <div class="flex justify-between items-end mb-4">
              <span class="text-2xl font-bold text-white">{{ formatMoney(selectedBox.currentAmount) }}</span>
              <span class="text-lg font-medium text-slate-500">{{ formatMoney(selectedBox.targetAmount) }}</span>
            </div>
            
            <div class="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
              <div class="bg-amber-500 h-3 rounded-full transition-all" :style="`width: ${Math.min((selectedBox.currentAmount / selectedBox.targetAmount) * 100, 100)}%`"></div>
            </div>
            <div class="text-center text-sm font-medium text-amber-400">
              {{ Math.round((selectedBox.currentAmount / selectedBox.targetAmount) * 100) }}% مكتمل
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="openDepositModal(selectedBox)" class="flex-1 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 font-medium rounded-xl py-3 border border-emerald-500/20 transition-colors">
              إيداع
            </button>
            <button @click="openWithdrawModal(selectedBox)" class="flex-1 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 font-medium rounded-xl py-3 border border-rose-500/20 transition-colors">
              سحب
            </button>
          </div>

          <div class="border-t border-slate-800 pt-4">
            <button @click="confirmDeleteBox" class="w-full text-rose-400 text-sm font-medium py-2">
              حذف القاصة
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit/Withdraw Modal -->
    <div v-if="txModal.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-800">
        <h3 class="text-xl font-bold mb-4" :class="txModal.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'">
          {{ txModal.type === 'deposit' ? 'إيداع في القاصة' : 'سحب من القاصة' }}
        </h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">المبلغ</label>
            <div class="relative">
              <input v-model.number="txModal.amount" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 focus:ring-2 focus:ring-blue-500 outline-none">
              <div class="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400">د.ع</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">ملاحظة (اختياري)</label>
            <input v-model="txModal.note" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
        </div>
        
        <div class="flex gap-3">
          <button @click="txModal.show = false" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl py-3 transition-colors">
            إلغاء
          </button>
          <button @click="submitBoxTx" :disabled="!txModal.amount || txModal.amount <= 0" class="flex-1 font-medium rounded-xl py-3 transition-colors disabled:opacity-50 text-white" :class="txModal.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'">
            تأكيد
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="حذف القاصة"
      message="هل أنت متأكد من حذف هذه القاصة؟ سيتم إرجاع أموالها ولكن لا يمكن التراجع عن الحذف."
      confirmText="حذف القاصة"
      variant="danger"
      @confirm="deleteBox"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCashBoxesStore } from '@/stores/cashBoxes'
import { useWalletsStore } from '@/stores/wallets'
import TopBar from '@/components/TopBar.vue'
import CashBoxCard from '@/components/CashBoxCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { formatMoney } from '@/utils/formatters'

const cashBoxesStore = useCashBoxesStore()
const walletsStore = useWalletsStore()

onMounted(() => {
  cashBoxesStore.fetchCashBoxes()
})

// Add Box
const showAddModal = ref(false)
const icons = ['🏠', '🚗', '📚', '💊', '✈️', '🎁', '👶', '📱', '💡', '🔧']
const newBox = ref({
  title: '',
  targetAmount: null,
  targetDate: '',
  icon: '🏠'
})

const isNewBoxValid = computed(() => {
  return newBox.value.title.trim() !== '' && newBox.value.targetAmount > 0
})

const saveCashBox = async () => {
  if (!isNewBoxValid.value) return
  await cashBoxesStore.addCashBox({
    ...newBox.value,
    currentAmount: 0,
    status: 'active'
  })
  showAddModal.value = false
  newBox.value = { title: '', targetAmount: null, targetDate: '', icon: '🏠' }
}

// Box Detail
const selectedBox = ref(null)
const openBoxDetail = (box) => {
  selectedBox.value = box
}

// Deposit/Withdraw
const txModal = ref({
  show: false,
  type: 'deposit', // 'deposit' | 'withdraw'
  amount: null,
  note: '',
  box: null
})

const openDepositModal = (box) => {
  txModal.value = { show: true, type: 'deposit', amount: null, note: '', box }
}

const openWithdrawModal = (box) => {
  txModal.value = { show: true, type: 'withdraw', amount: null, note: '', box }
}

const submitBoxTx = async () => {
  const { type, amount, note, box } = txModal.value
  if (!amount || amount <= 0 || !box) return

  if (type === 'deposit') {
    await cashBoxesStore.deposit(box.id, amount, note)
  } else {
    // Only withdraw up to current amount
    const actualAmount = Math.min(amount, box.currentAmount)
    await cashBoxesStore.withdraw(box.id, actualAmount, note)
  }
  
  if (selectedBox.value && selectedBox.value.id === box.id) {
    selectedBox.value = cashBoxesStore.cashBoxes.find(b => b.id === box.id)
  }
  
  txModal.value.show = false
}

// Delete
const showDeleteConfirm = ref(false)
const confirmDeleteBox = () => {
  showDeleteConfirm.value = true
}

const deleteBox = async () => {
  if (selectedBox.value) {
    await cashBoxesStore.deleteCashBox(selectedBox.value.id)
    showDeleteConfirm.value = false
    selectedBox.value = null
  }
}
</script>
