<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="المحافظ">
      <template #actions>
        <button @click="showAddModal = true" class="w-10 h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </TopBar>

    <div class="p-4 space-y-6">
      <!-- Total Balance Card -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
        <div class="absolute top-0 end-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <p class="text-sm font-medium text-slate-400 mb-1">إجمالي الرصيد</p>
          <h2 class="text-3xl font-bold text-white mb-6">{{ formatMoney(walletsStore.totalBalance) }}</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-1">كاش</p>
              <p class="text-lg font-semibold text-emerald-400">{{ formatMoney(walletsStore.cashBalance) }}</p>
            </div>
            <div class="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-1">رقمي</p>
              <p class="text-lg font-semibold text-blue-400">{{ formatMoney(walletsStore.digitalBalance) }}</p>
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
        description="أضف محفظتك الأولى للبدء في تتبع أموالك"
      >
        <button @click="showAddModal = true" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-3 transition-colors">
          إضافة محفظة
        </button>
      </EmptyState>
    </div>

    <!-- Add Wallet Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div class="bg-slate-900 rounded-t-3xl w-full flex flex-col" style="max-height: 85vh;">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <h3 class="text-xl font-bold">إضافة محفظة جديدة</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2 rounded-lg">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم المحفظة</label>
            <input v-model="newWallet.name" type="text" placeholder="مثال: نقدي، زين كاش، راتب الزوجة" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 px-4 py-3">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">النوع</label>
            <select v-model="newWallet.type" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 px-4 py-3">
              <option value="cash">نقدي (كاش)</option>
              <option value="zain_cash">زين كاش</option>
              <option value="super_cash">سوبر كاش</option>
              <option value="credit_card">كريدت كارد</option>
              <option value="bank">بنكي</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الرصيد الابتدائي (د.ع)</label>
            <input v-model.number="newWallet.currentBalance" type="number" placeholder="0" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 px-4 py-3">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">الأيقونة</label>
            <div class="grid grid-cols-6 gap-2">
              <button v-for="icon in icons" :key="icon" @click="newWallet.icon = icon" type="button"
                class="h-12 flex items-center justify-center text-2xl rounded-xl border transition-colors"
                :class="newWallet.icon === icon ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700'">
                {{ icon }}
              </button>
            </div>
          </div>
          <div class="h-2"></div>
        </div>
        <div class="p-4 border-t border-slate-800 flex-shrink-0">
          <button @click="saveWallet" :disabled="!isNewWalletValid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl px-6 py-4 transition-colors">
            حفظ المحفظة
          </button>
        </div>
      </div>
    </div>

    <!-- Wallet Detail Modal -->
    <div v-if="selectedWallet" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedWallet = null">
      <div class="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
              {{ selectedWallet.icon }}
            </div>
            <h3 class="text-xl font-bold">{{ selectedWallet.name }}</h3>
          </div>
          <button @click="selectedWallet = null" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="text-center">
            <p class="text-slate-400 text-sm mb-1">الرصيد الحالي</p>
            <p class="text-3xl font-bold" :class="selectedWallet.currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ formatMoney(selectedWallet.currentBalance) }}
            </p>
          </div>
          
          <div class="flex gap-2">
            <button @click="showEditBalanceModal = true" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl py-2 transition-colors border border-slate-700">
              تعديل الرصيد
            </button>
            <button @click="confirmDeleteWallet" class="flex-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-medium rounded-xl py-2 transition-colors border border-rose-500/20">
              حذف المحفظة
            </button>
          </div>
          
          <!-- Recent Transactions -->
          <div>
            <h4 class="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">آخر المعاملات</h4>
            <div v-if="walletTransactions.length > 0" class="space-y-3">
              <div v-for="tx in walletTransactions" :key="tx.id" class="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ tx.categoryIcon || '💸' }}</div>
                  <div>
                    <p class="font-medium text-sm">{{ tx.title }}</p>
                    <p class="text-xs text-slate-400">{{ formatDate(tx.date) }}</p>
                  </div>
                </div>
                <div class="text-sm font-bold" :class="tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatMoney(tx.amount) }}
                </div>
              </div>
            </div>
            <p v-else class="text-center text-slate-500 text-sm py-4">لا توجد معاملات لهذه المحفظة</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Balance Modal -->
    <div v-if="showEditBalanceModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-800">
        <h3 class="text-xl font-bold mb-4">تعديل الرصيد</h3>
        <p class="text-sm text-slate-400 mb-4">أدخل الرصيد الصحيح للمحفظة. سيتم إنشاء معاملة تسوية بالفرق.</p>
        
        <div class="mb-6 relative">
          <input v-model.number="newBalance" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none">
          <div class="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400">
            د.ع
          </div>
        </div>
        
        <div class="flex gap-3">
          <button @click="showEditBalanceModal = false" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl py-3 transition-colors">
            إلغاء
          </button>
          <button @click="saveEditedBalance" :disabled="newBalance === null || newBalance === selectedWallet?.currentBalance" class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl py-3 transition-colors">
            حفظ
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="حذف المحفظة"
      message="هل أنت متأكد من حذف هذه المحفظة؟ لا يمكن التراجع عن هذا الإجراء."
      confirmText="حذف المحفظة"
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
import { formatMoney } from '@/utils/formatters'

const walletsStore = useWalletsStore()
const transactionsStore = useTransactionsStore()

onMounted(() => {
  walletsStore.fetchWallets()
  transactionsStore.fetchTransactions()
})

// Add Wallet
const showAddModal = ref(false)
const icons = ['💵', '💳', '📱', '🏦', '💰', '🪙', '🛍️', '💼']
const newWallet = ref({
  name: '',
  type: 'cash',
  currentBalance: null,
  icon: '💵'
})

const isNewWalletValid = computed(() => {
  return newWallet.value.name.trim() !== '' && newWallet.value.currentBalance !== null
})

const saveWallet = async () => {
  if (!isNewWalletValid.value) return
  await walletsStore.addWallet({
    ...newWallet.value,
    currentBalance: Number(newWallet.value.currentBalance)
  })
  showAddModal.value = false
  newWallet.value = { name: '', type: 'cash', currentBalance: null, icon: '💵' }
}

// Wallet Detail
const selectedWallet = ref(null)
const openWalletDetail = (wallet) => {
  selectedWallet.value = wallet
}

const walletTransactions = computed(() => {
  if (!selectedWallet.value) return []
  return transactionsStore.transactions
    .filter(tx => tx.walletId === selectedWallet.value.id || tx.toWalletId === selectedWallet.value.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5) // Last 5 txs
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })
}

// Edit Balance
const showEditBalanceModal = ref(false)
const newBalance = ref(null)

const saveEditedBalance = async () => {
  if (newBalance.value === null || !selectedWallet.value) return
  
  const diff = Number(newBalance.value) - selectedWallet.value.currentBalance
  if (diff !== 0) {
    // Add adjustment transaction
    await transactionsStore.addTransaction({
      type: diff > 0 ? 'income' : 'expense',
      categoryId: 'adjustment',
      categoryName: 'تسوية رصيد',
      amount: Math.abs(diff),
      walletId: selectedWallet.value.id,
      walletName: selectedWallet.value.name,
      title: 'تسوية رصيد يدوي',
      date: new Date().toISOString().split('T')[0],
      notes: 'تم تعديل الرصيد يدوياً من إعدادات المحفظة'
    })
    
    // The store should automatically update the wallet balance via triggers or local update,
    // but we can enforce it here if needed or refresh
    await walletsStore.fetchWallets()
    // Update local selected wallet view
    selectedWallet.value = walletsStore.getWalletById(selectedWallet.value.id)
  }
  showEditBalanceModal.value = false
}

// Delete Wallet
const showDeleteConfirm = ref(false)

const confirmDeleteWallet = () => {
  showDeleteConfirm.value = true
}

const deleteWallet = async () => {
  if (selectedWallet.value) {
    await walletsStore.deleteWallet(selectedWallet.value.id)
    showDeleteConfirm.value = false
    selectedWallet.value = null
  }
}
</script>
