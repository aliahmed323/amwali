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
          @quickAdd="quickAddToday"
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
    <div v-if="showAddModal" class="fixed inset-0 z-[70] flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddModal = false" @touchmove.prevent></div>
      <div class="relative bg-slate-900 rounded-t-3xl w-full overflow-hidden flex flex-col" style="max-height: 85vh;">
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
            <input
              type="text" inputmode="numeric"
              :value="displayTargetAmount"
              @input="onTargetAmountInput"
              placeholder="0"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">تاريخ الهدف (اختياري)</label>
            <input v-model="newBox.targetDate" type="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">المبلغ اليومي (د.ع) — اتركه فارغاً إن لم تريد مساهمة يومية</label>
            <input
              type="text" inputmode="numeric"
              :value="displayDailyAmount"
              @input="onDailyAmountInput"
              placeholder="مثال: 5,000"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 px-4 py-3"
              dir="ltr"
            >
          </div>

          <div v-if="newBox.dailyAmount > 0">
            <label class="block text-sm font-medium text-slate-300 mb-2">طريقة الإضافة اليومية</label>
            <div class="flex bg-slate-800 rounded-xl p-1 gap-1">
              <button @click="newBox.contributionMode = 'manual'" type="button"
                :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', newBox.contributionMode === 'manual' ? 'bg-amber-500 text-white' : 'text-slate-400']"
              >🔔 يدوي (تذكير)</button>
              <button @click="newBox.contributionMode = 'auto'" type="button"
                :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors', newBox.contributionMode === 'auto' ? 'bg-emerald-500 text-white' : 'text-slate-400']"
              >⚡ تلقائي</button>
            </div>
            <p class="text-xs text-slate-500 mt-1 px-1">
              {{ newBox.contributionMode === 'auto' ? 'سيتم خصم المبلغ تلقائياً من المحفظة عند فتح التطبيق' : 'ستظهر تذكيرة يومية لإضافة المبلغ يدوياً' }}
            </p>
          </div>

          <div v-if="newBox.dailyAmount > 0 && newBox.contributionMode === 'auto'">
            <label class="block text-sm font-medium text-slate-300 mb-2">اخصم من محفظة</label>
            <select v-model="newBox.linkedWalletId" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500">
              <option value="">اختر المحفظة</option>
              <option v-for="w in walletsStore.wallets" :key="w.id" :value="w.id">{{ w.icon }} {{ w.name }}</option>
            </select>
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
    <div v-if="selectedBox" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedBox = null" @touchmove.prevent></div>
      <div class="relative bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0 flex-shrink-0">
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
            <div class="space-y-2">
              <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div class="bg-amber-500 h-3 rounded-full transition-all" :style="`width: ${Math.min(selectedBox.targetAmount ? (selectedBox.currentAmount / selectedBox.targetAmount) * 100 : 0, 100).toFixed(1)}%`"></div>
              </div>
              <p class="text-sm text-end text-slate-400">
                {{ selectedBox.targetAmount ? Math.round((selectedBox.currentAmount / selectedBox.targetAmount) * 100) : 0 }}% مكتمل
              </p>
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
            <h4 class="text-sm font-bold text-slate-300 mb-3">سجل العمليات</h4>
            <div v-if="cashBoxesStore.logs.length === 0" class="text-xs text-center text-slate-500 py-4">
              لا توجد عمليات بعد
            </div>
            <div v-else class="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
              <div v-for="log in cashBoxesStore.logs" :key="log.id" class="flex justify-between items-center bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                <div>
                  <p class="text-xs font-bold text-white">{{ log.type === 'withdraw' ? 'سحب' : log.type === 'daily' ? 'مساهمة يومية' : 'إيداع' }}</p>
                  <p class="text-[10px] text-slate-400">
                    {{ log.createdAt?.toDate ? formatDate(log.createdAt.toDate().toISOString().split('T')[0]) : formatDate(new Date().toISOString().split('T')[0]) }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold" :class="log.type === 'withdraw' ? 'text-rose-400' : 'text-emerald-400'">
                    {{ log.type === 'withdraw' ? '-' : '+' }}{{ formatMoney(log.amount) }}
                  </span>
                  <button @click="handleDeleteLog(log)" class="text-rose-400 p-1 hover:bg-rose-500/20 rounded transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-800 pt-4 space-y-2">
            <button @click="handleResetCycle" class="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium py-3 rounded-xl border border-amber-500/20 transition-colors">
              تصفير الرصيد وبدء دورة جديدة
            </button>
            <button @click="confirmDeleteBox" class="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium py-3 rounded-xl border border-rose-500/20 transition-colors">
              حذف القاصة بالكامل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit/Withdraw Modal -->
    <div v-if="txModal.show" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="txModal.show = false" @touchmove.prevent></div>
      <div class="relative bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-800">
        <h3 class="text-xl font-bold mb-4" :class="txModal.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'">
          {{ txModal.type === 'deposit' ? 'إيداع في القاصة' : 'سحب من القاصة' }}
        </h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">المبلغ</label>
            <div class="relative">
              <input
                type="text" inputmode="numeric"
                :value="displayTxAmount"
                @input="onTxAmountInput"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 focus:ring-2 focus:ring-blue-500 outline-none"
              >
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
          <button @click="submitBoxTx" :disabled="!txModal.amount || txModal.amount <= 0 || (txModal.type === 'withdraw' && txModal.amount > txModal.box.currentAmount)" class="flex-1 font-medium rounded-xl py-3 transition-colors disabled:opacity-50 text-white" :class="txModal.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'">
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
import { formatMoney, formatDate } from '@/utils/formatters'

const cashBoxesStore = useCashBoxesStore()
const walletsStore = useWalletsStore()

onMounted(() => {
  cashBoxesStore.fetchCashBoxes()
  cashBoxesStore.runAutoContributions(walletsStore)
})

const handleDeleteLog = async (log) => {
  if (confirm('هل أنت متأكد من حذف هذه العملية والتراجع عنها؟')) {
    await cashBoxesStore.deleteLog(selectedBox.value.id, log, walletsStore)
    selectedBox.value = cashBoxesStore.cashBoxes.find(b => b.id === selectedBox.value.id)
  }
}

const handleResetCycle = async () => {
  if (confirm('هل أنت متأكد من تصفير رصيد هذه القاصة لبدء دورة جديدة؟ (لا يمكن التراجع)')) {
    await cashBoxesStore.resetCashBoxCycle(selectedBox.value.id)
    selectedBox.value = cashBoxesStore.cashBoxes.find(b => b.id === selectedBox.value.id)
    await cashBoxesStore.fetchLogs(selectedBox.value.id)
  }
}

// Add Box
const showAddModal = ref(false)
const icons = ['🏠', '🚗', '📚', '💊', '✈️', '🎁', '👶', '📱', '💡', '🔧']
const newBox = ref({
  title: '',
  targetAmount: null,
  targetDate: '',
  icon: '🏠',
  dailyAmount: 0,
  contributionMode: 'manual',
  linkedWalletId: ''
})

const displayDailyAmount = ref('')
const displayTargetAmount = ref('')
const displayTxAmount = ref('')

const onDailyAmountInput = (e) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  newBox.value.dailyAmount = raw ? parseInt(raw, 10) : 0
  displayDailyAmount.value = raw ? parseInt(raw, 10).toLocaleString('en-US') : ''
}

const onTargetAmountInput = (e) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  newBox.value.targetAmount = raw ? parseInt(raw, 10) : 0
  displayTargetAmount.value = raw ? parseInt(raw, 10).toLocaleString('en-US') : ''
}

const onTxAmountInput = (e) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  txModal.value.amount = raw ? parseInt(raw, 10) : 0
  displayTxAmount.value = raw ? parseInt(raw, 10).toLocaleString('en-US') : ''
}

const isNewBoxValid = computed(() => {
  return newBox.value.title.trim() !== '' && newBox.value.targetAmount > 0
})

const addingBoxId = ref(null)

const quickAddToday = async (box) => {
  if (box.contributionMode === 'auto' && box.linkedWalletId) {
    const wallet = walletsStore.wallets.find(w => w.id === box.linkedWalletId)
    if (!wallet || wallet.currentBalance < box.dailyAmount) {
      alert(`عذراً، رصيد محفظة ${wallet?.name || ''} غير كافٍ لإضافة ${formatMoney(box.dailyAmount)} د.ع للقاصة.`)
      return
    }
  }

  addingBoxId.value = box.id
  await cashBoxesStore.addDailyContribution(box.id, walletsStore)
  addingBoxId.value = null
}

const saveCashBox = async () => {
  if (!isNewBoxValid.value) return
  await cashBoxesStore.addCashBox({
    ...newBox.value,
    currentAmount: 0,
    status: 'active'
  })
  showAddModal.value = false
  newBox.value = { title: '', targetAmount: null, targetDate: '', icon: '🏠', dailyAmount: 0, contributionMode: 'manual', linkedWalletId: '' }
  displayDailyAmount.value = ''
  displayTargetAmount.value = ''
  displayDailyAmount.value = ''
}

// Box Detail
const selectedBox = ref(null)
const openBoxDetail = async (box) => {
  selectedBox.value = box
  await cashBoxesStore.fetchLogs(box.id)
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
  displayTxAmount.value = ''
  txModal.value = { show: true, type: 'deposit', amount: null, note: '', box }
}

const openWithdrawModal = (box) => {
  displayTxAmount.value = ''
  txModal.value = { show: true, type: 'withdraw', amount: null, note: '', box }
}

const submitBoxTx = async () => {
  const { type, amount, note, box } = txModal.value
  if (!amount || amount <= 0 || !box) return

  if (type === 'withdraw' && amount > box.currentAmount) {
    alert('عذراً، المبلغ المطلوب سحبه أكبر من الرصيد المتوفر في القاصة.')
    return
  }

  if (type === 'deposit') {
    await cashBoxesStore.deposit(box.id, amount, note)
  } else {
    await cashBoxesStore.withdraw(box.id, amount, note)
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
