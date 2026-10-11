<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="المحافظ">
      <template #actions>
        <button 
          @click="openAddWallet" 
          class="w-10 h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 active:scale-95 transition-all"
          aria-label="إضافة محفظة"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </TopBar>

    <FirebaseRulesBanner />

    <div class="p-4 space-y-6">
      <!-- Total Balance Card -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden shadow-xl">
        <div class="absolute top-0 end-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <p class="text-sm font-medium text-slate-400 mb-1">إجمالي الرصيد في جميع المحافظ</p>
          <h2 class="text-3xl font-bold text-white mb-6">{{ formatMoney(walletsStore.totalBalance) }}</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-xs">💵</span>
                <p class="text-xs text-slate-400 font-medium">نقدي (كاش)</p>
              </div>
              <p class="text-lg font-bold text-emerald-400">{{ formatMoney(walletsStore.cashBalance) }}</p>
            </div>
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-xs">💳</span>
                <p class="text-xs text-slate-400 font-medium">بطاقات ائتمان</p>
              </div>
              <p class="text-lg font-bold text-blue-400">{{ formatMoney(walletsStore.creditCardBalance) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Wallets Grid -->
      <div v-if="walletsStore.wallets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <WalletCard 
          v-for="wallet in walletsStore.wallets" 
          :key="wallet.id" 
          :wallet="wallet"
          @click="openWalletDetail(wallet)"
        />
      </div>
      
      <EmptyState 
        v-else 
        icon="💳" 
        title="لا توجد محافظ" 
        description="أضف محفظتك الأولى (كاش أو بطاقة ائتمان) للبدء في إدارة أموالك"
      >
        <button @click="openAddWallet" class="mt-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl px-6 py-3 transition-all shadow-lg shadow-blue-600/30">
          ＋ إضافة محفظة
        </button>
      </EmptyState>
    </div>

    <!-- Add Wallet Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[70] flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showAddModal = false"></div>
      <div class="relative bg-slate-900 rounded-t-3xl w-full flex flex-col overflow-hidden shadow-2xl border-t border-slate-800" style="max-height: 90vh;">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <h3 class="text-xl font-bold">إضافة محفظة جديدة</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2 rounded-lg">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="overflow-y-auto flex-1 p-5 space-y-5">
          <!-- اختيار نوع المحفظة (فقط كاش أو بطاقة ائتمان) -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">نوع المحفظة</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="selectType('cash')"
                class="flex items-center justify-center gap-2 p-3.5 rounded-xl border font-bold transition-all"
                :class="newWallet.type === 'cash' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'"
              >
                <span class="text-xl">💵</span>
                <span>نقدي (كاش)</span>
              </button>
              <button
                type="button"
                @click="selectType('credit_card')"
                class="flex items-center justify-center gap-2 p-3.5 rounded-xl border font-bold transition-all"
                :class="newWallet.type === 'credit_card' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'"
              >
                <span class="text-xl">💳</span>
                <span>بطاقة ائتمان</span>
              </button>
            </div>
          </div>

          <!-- اسم المحفظة -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم المحفظة</label>
            <input 
              v-model="newWallet.name" 
              type="text" 
              :placeholder="newWallet.type === 'cash' ? 'مثال: كاش في اليد، محفظة الجيب' : 'مثال: فيزا كارد، ماستركارد، بطاقة الراتب'" 
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 outline-none"
            >
          </div>

          <!-- الرصيد الابتدائي -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الرصيد الابتدائي (د.ع)</label>
            <input
              type="text"
              inputmode="numeric"
              :value="displayBalance"
              @input="onBalanceInput"
              placeholder="0"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-left outline-none font-bold text-lg"
              dir="ltr"
            >
            <p v-if="newWallet.currentBalance > 0" class="text-slate-400 text-sm mt-1 text-center font-medium">
              {{ formatMoney(newWallet.currentBalance) }}
            </p>
          </div>

          <!-- الأيقونة -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الأيقونة</label>
            <div class="grid grid-cols-6 gap-2">
              <button 
                v-for="icon in icons" 
                :key="icon" 
                @click="newWallet.icon = icon" 
                type="button"
                class="h-12 flex items-center justify-center text-2xl rounded-xl border transition-all active:scale-95"
                :class="newWallet.icon === icon ? 'bg-blue-600/30 border-blue-500 scale-105' : 'bg-slate-800 border-slate-700 hover:border-slate-600'"
              >
                {{ icon }}
              </button>
            </div>
          </div>
          
          <div v-if="saveError" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {{ saveError }}
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-900">
          <button 
            @click="saveWallet" 
            :disabled="!isNewWalletValid || isSaving"
            class="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl px-6 py-4 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ isSaving ? 'جاري الحفظ...' : 'حفظ المحفظة' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Wallet Detail Modal -->
    <div v-if="selectedWallet" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeWalletDetail"></div>
      <div class="relative bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-slate-800">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
              {{ selectedWallet.icon }}
            </div>
            <div>
              <h3 class="text-xl font-bold">{{ selectedWallet.name }}</h3>
              <span class="text-xs text-slate-400">
                {{ selectedWallet.type === 'credit_card' ? '💳 بطاقة ائتمان' : '💵 كاش' }}
              </span>
            </div>
          </div>
          <button @click="closeWalletDetail" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="text-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <p class="text-slate-400 text-sm mb-1 font-medium">الرصيد الحالي</p>
            <p class="text-3xl font-bold" :class="selectedWallet.currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ formatMoney(selectedWallet.currentBalance) }}
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="openEditBalance" 
              class="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-sm font-bold rounded-xl py-3 transition-all border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <span>✏️</span>
              <span>تعديل الرصيد</span>
            </button>
            <button 
              @click="confirmDeleteWallet" 
              class="w-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 text-sm font-bold rounded-xl py-3 transition-all border border-rose-500/20 flex items-center justify-center gap-1.5"
            >
              <span>🗑️</span>
              <span>حذف المحفظة</span>
            </button>
          </div>
          
          <!-- Recent Transactions -->
          <div>
            <h4 class="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">آخر المعاملات في هذه المحفظة</h4>
            <div v-if="walletTransactions.length > 0" class="space-y-2.5">
              <div v-for="tx in walletTransactions" :key="tx.id" class="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ tx.categoryIcon || '💸' }}</div>
                  <div>
                    <p class="font-medium text-sm">{{ tx.title || tx.categoryName || 'معاملة' }}</p>
                    <p class="text-xs text-slate-400">{{ formatDate(tx.date) }}</p>
                  </div>
                </div>
                <div class="text-sm font-bold" :class="tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatMoney(tx.amount) }}
                </div>
              </div>
            </div>
            <p v-else class="text-center text-slate-500 text-sm py-4">لا توجد معاملات مسجلة لهذه المحفظة</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Balance Modal -->
    <div v-if="showEditBalanceModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-800 shadow-2xl">
        <h3 class="text-xl font-bold mb-2">تعديل الرصيد</h3>
        <p class="text-xs text-slate-400 mb-4">أدخل الرصيد الفعلي الحالي. سيتم تسجيل معاملة تسوية بالفرق تلقائياً.</p>
        
        <div class="mb-6 relative">
          <input 
            v-model.number="newBalance" 
            type="number" 
            class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="0"
          >
          <div class="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400 text-sm">
            د.ع
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="showEditBalanceModal = false" 
            class="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-medium rounded-xl py-3 transition-all"
          >
            إلغاء
          </button>
          <button 
            @click="saveEditedBalance" 
            :disabled="newBalance === null || newBalance === ''" 
            class="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl py-3 transition-all shadow-lg shadow-blue-600/30"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="حذف المحفظة"
      :message="`هل أنت متأكد من رغبتك في حذف محفظة «${selectedWallet?.name || ''}»؟ سيتم حذفها فوراً (المعاملات السابقة ستبقى مسجلة).`"
      confirmText="تأكيد الحذف"
      variant="danger"
      @confirm="deleteWallet"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletsStore } from '@/stores/wallets'
import { useTransactionsStore } from '@/stores/transactions'
import TopBar from '@/components/TopBar.vue'
import WalletCard from '@/components/WalletCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FirebaseRulesBanner from '@/components/FirebaseRulesBanner.vue'
import { formatMoney } from '@/utils/formatters'

const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()

onMounted(() => {
  walletsStore.fetchWallets()
  transactionsStore.fetchTransactions()
})

// Add Wallet
const showAddModal = ref(false)
const isSaving = ref(false)
const saveError = ref('')
const icons = ['💵', '💳', '💰', '🪙', '🏦', '🛍️', '💼', '🧾', '🚕', '🏠', '📱', '📦']

const newWallet = ref({
  name: '',
  type: 'cash',
  currentBalance: 0,
  icon: '💵'
})
const displayBalance = ref('')

const openAddWallet = () => {
  saveError.value = ''
  newWallet.value = {
    name: '',
    type: 'cash',
    currentBalance: 0,
    icon: '💵'
  }
  displayBalance.value = ''
  showAddModal.value = true
}

const selectType = (type) => {
  newWallet.value.type = type
  if (type === 'credit_card' && newWallet.value.icon === '💵') {
    newWallet.value.icon = '💳'
  } else if (type === 'cash' && newWallet.value.icon === '💳') {
    newWallet.value.icon = '💵'
  }
}

const onBalanceInput = (e) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  newWallet.value.currentBalance = raw ? parseInt(raw, 10) : 0
  displayBalance.value = raw ? parseInt(raw, 10).toLocaleString('en-US') : ''
}

const isNewWalletValid = computed(() => {
  return newWallet.value.name.trim().length > 0
})

const saveWallet = async () => {
  if (!isNewWalletValid.value || isSaving.value) return
  isSaving.value = true
  saveError.value = ''

  try {
    await walletsStore.addWallet({
      name: newWallet.value.name.trim(),
      type: newWallet.value.type,
      currentBalance: Number(newWallet.value.currentBalance) || 0,
      icon: newWallet.value.icon
    })
    showAddModal.value = false
    newWallet.value = { name: '', type: 'cash', currentBalance: 0, icon: '💵' }
    displayBalance.value = ''
  } catch (err) {
    console.error('Error in saveWallet:', err)
    saveError.value = 'تعذر الحفظ: ' + (err?.message || err)
  } finally {
    isSaving.value = false
  }
}

// Wallet Detail
const selectedWalletId = ref(null)
const selectedWallet = computed(() => {
  if (!selectedWalletId.value) return null
  return walletsStore.getWalletById(selectedWalletId.value) || null
})

const openWalletDetail = (wallet) => {
  selectedWalletId.value = wallet.id
}

const closeWalletDetail = () => {
  selectedWalletId.value = null
}

const walletTransactions = computed(() => {
  if (!selectedWallet.value) return []
  return transactionsStore.transactions
    .filter(tx => tx.walletId === selectedWallet.value.id || tx.toWalletId === selectedWallet.value.id || tx.fromWalletId === selectedWallet.value.id)
    .slice(0, 6)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })
}

// Edit Balance
const showEditBalanceModal = ref(false)
const newBalance = ref(null)

const openEditBalance = () => {
  newBalance.value = selectedWallet.value ? Number(selectedWallet.value.currentBalance) || 0 : 0
  showEditBalanceModal.value = true
}

const saveEditedBalance = async () => {
  if (newBalance.value === null || newBalance.value === '' || !selectedWallet.value) return
  
  const wallet = selectedWallet.value
  const diff = Number(newBalance.value) - (Number(wallet.currentBalance) || 0)
  showEditBalanceModal.value = false
  if (diff === 0) return

  try {
    await transactionsStore.addTransaction({
      type: diff > 0 ? 'income' : 'expense',
      categoryId: 'adjustment',
      categoryName: 'تسوية رصيد',
      categoryIcon: '⚖️',
      amount: Math.abs(diff),
      walletId: wallet.id,
      walletName: wallet.name,
      title: 'تسوية رصيد يدوي',
      date: new Date().toISOString().split('T')[0],
      notes: 'تم تعديل الرصيد يدوياً'
    })
  } catch (err) {
    console.error('Error adjusting balance:', err)
  }
}

// Delete Wallet
const showDeleteConfirm = ref(false)

const confirmDeleteWallet = () => {
  showDeleteConfirm.value = true
}

const deleteWallet = () => {
  const targetId = selectedWalletId.value
  showDeleteConfirm.value = false
  closeWalletDetail()

  if (targetId) {
    walletsStore.deleteWallet(targetId)
  }
}
</script>
