<template>
  <div class="pb-24 min-h-screen bg-slate-950 text-white">
    <TopBar title="الجمعيات">
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
      <div class="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">
        <p class="text-sm text-indigo-300 mb-1">الالتزام الشهري للجمعيات</p>
        <h2 class="text-3xl font-bold text-indigo-400 mb-2">{{ formatMoney(savingsGroupsStore.totalMonthlyCommitment) }}</h2>
        <div class="text-sm text-slate-400">
          لديك {{ savingsGroupsStore.activeGroups.length }} جمعيات نشطة
        </div>
      </div>

      <!-- Groups List -->
      <div v-if="savingsGroupsStore.groups.length > 0" class="space-y-4">
        <SavingsGroupCard 
          v-for="group in savingsGroupsStore.groups" 
          :key="group.id" 
          :group="group"
          @click="openGroupDetail(group)"
        />
      </div>
      
      <EmptyState 
        v-else 
        icon="🔄" 
        title="لا توجد جمعيات" 
        description="انضم إلى جمعية (سلفة) جديدة وتابع أقساطك الشهرية"
      >
        <button @click="showAddModal = true" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-3 transition-colors">
          إضافة جمعية
        </button>
      </EmptyState>
    </div>

    <!-- Add Group Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0">
          <h3 class="text-xl font-bold">إضافة جمعية جديدة</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم الجمعية</label>
            <input v-model="newGroup.title" type="text" placeholder="مثال: جمعية الأقارب" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">القسط الشهري</label>
            <div class="relative">
              <input v-model.number="newGroup.monthlyShare" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 pe-12 focus:ring-2 focus:ring-blue-500 outline-none">
              <div class="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-slate-400">د.ع</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">عدد الأشهر</label>
              <input v-model.number="newGroup.totalMonths" type="number" min="1" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">ترتيب قبضتي</label>
              <input v-model.number="newGroup.myTurnMonth" type="number" min="1" :max="newGroup.totalMonths" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">شهر البدء</label>
            <input v-model="newGroup.startDate" type="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          
          <!-- Summary box -->
          <div v-if="newGroup.monthlyShare && newGroup.totalMonths" class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <p class="text-sm text-slate-400 mb-1">المبلغ الإجمالي للجمعية</p>
            <p class="text-xl font-bold text-amber-400">{{ formatMoney(newGroup.monthlyShare * newGroup.totalMonths) }}</p>
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-800 bg-slate-900 z-10 sticky bottom-0">
          <button @click="saveGroup" :disabled="!isNewGroupValid" class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 transition-colors">
            حفظ الجمعية
          </button>
        </div>
      </div>
    </div>

    <!-- Group Detail Modal -->
    <div v-if="selectedGroup" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedGroup = null">
      <div class="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 sticky top-0">
          <h3 class="text-xl font-bold">{{ selectedGroup.title }}</h3>
          <button @click="selectedGroup = null" class="text-slate-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-1">القسط الشهري</p>
              <p class="text-sm font-bold text-white">{{ formatMoney(selectedGroup.monthlyShare) }}</p>
            </div>
            <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-1">المبلغ الإجمالي</p>
              <p class="text-sm font-bold text-amber-400">{{ formatMoney(selectedGroup.totalAmount) }}</p>
            </div>
          </div>

          <!-- Payout Status -->
          <div class="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-amber-400">دورك بالاستلام: الشهر {{ selectedGroup.myTurnMonth }}</p>
              <p class="text-xs text-amber-400/70 mt-1">حالة الاستلام: {{ selectedGroup.isPayoutReceived ? 'مستلم ✅' : 'غير مستلم' }}</p>
            </div>
            <button v-if="!selectedGroup.isPayoutReceived" @click="markReceived" class="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg border border-amber-500/30 hover:bg-amber-500/30">
              تأكيد الاستلام
            </button>
          </div>

          <!-- Installments Grid -->
          <div>
            <h4 class="text-sm font-medium text-slate-300 mb-3">سجل الدفعات ({{ selectedGroup.paidMonths?.length || 0 }} / {{ selectedGroup.totalMonths }})</h4>
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
              <button 
                v-for="m in selectedGroup.totalMonths" 
                :key="m"
                @click="toggleInstallment(m)"
                class="aspect-square flex items-center justify-center rounded-lg border text-sm font-medium transition-colors"
                :class="isMonthPaid(m) 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'"
              >
                {{ m }}
              </button>
            </div>
          </div>

          <div class="border-t border-slate-800 pt-4">
            <button @click="confirmDeleteGroup" class="w-full text-rose-400 text-sm font-medium py-2">
              حذف الجمعية
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="حذف الجمعية"
      message="هل أنت متأكد من حذف هذه الجمعية؟"
      confirmText="حذف"
      variant="danger"
      @confirm="deleteGroup"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSavingsGroupsStore } from '@/stores/savingsGroups'
import TopBar from '@/components/TopBar.vue'
import SavingsGroupCard from '@/components/SavingsGroupCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { formatMoney, formatDate } from '@/utils/formatters'

const savingsGroupsStore = useSavingsGroupsStore()

onMounted(() => {
  savingsGroupsStore.fetchGroups()
})

// Add Group
const showAddModal = ref(false)
const newGroup = ref({
  title: '',
  monthlyShare: null,
  totalMonths: null,
  myTurnMonth: null,
  startDate: new Date().toISOString().split('T')[0]
})

const isNewGroupValid = computed(() => {
  return newGroup.value.title.trim() !== '' && 
         newGroup.value.monthlyShare > 0 && 
         newGroup.value.totalMonths > 0 &&
         newGroup.value.myTurnMonth > 0 && 
         newGroup.value.myTurnMonth <= newGroup.value.totalMonths
})

const saveGroup = async () => {
  if (!isNewGroupValid.value) return
  await savingsGroupsStore.addGroup({
    ...newGroup.value,
    totalAmount: newGroup.value.monthlyShare * newGroup.value.totalMonths,
    paidMonths: [],
    isPayoutReceived: false,
    status: 'active'
  })
  showAddModal.value = false
  newGroup.value = { title: '', monthlyShare: null, totalMonths: null, myTurnMonth: null, startDate: new Date().toISOString().split('T')[0] }
}

// Group Detail
const selectedGroup = ref(null)
const openGroupDetail = (group) => {
  selectedGroup.value = group
}

const isMonthPaid = (month) => {
  return selectedGroup.value?.paidMonths?.includes(month)
}

const toggleInstallment = async (month) => {
  if (!selectedGroup.value) return
  await savingsGroupsStore.recordInstallment(selectedGroup.value.id, month)
  // Refresh detail view
  selectedGroup.value = savingsGroupsStore.groups.find(g => g.id === selectedGroup.value.id)
}

const markReceived = async () => {
  if (!selectedGroup.value) return
  await savingsGroupsStore.markPayoutReceived(selectedGroup.value.id)
  selectedGroup.value = savingsGroupsStore.groups.find(g => g.id === selectedGroup.value.id)
}

// Delete
const showDeleteConfirm = ref(false)
const confirmDeleteGroup = () => {
  showDeleteConfirm.value = true
}

const deleteGroup = async () => {
  if (selectedGroup.value) {
    await savingsGroupsStore.deleteGroup(selectedGroup.value.id)
    showDeleteConfirm.value = false
    selectedGroup.value = null
  }
}
</script>
