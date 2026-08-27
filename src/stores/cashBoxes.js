import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, increment, getDocs } from 'firebase/firestore'

export const useCashBoxesStore = defineStore('cashBoxes', () => {
  const cashBoxes = ref([])
  const logs = ref([])
  const loading = ref(false)

  const totalSaved = computed(() => cashBoxes.value.reduce((sum, b) => sum + (Number(b.currentAmount) || 0), 0))
  const activeBoxes = computed(() => cashBoxes.value.filter(b => b.status !== 'completed'))
  const completedBoxes = computed(() => cashBoxes.value.filter(b => b.status === 'completed'))
  const todayStr = () => new Date().toISOString().split('T')[0]

  // القاصات التي لها مساهمة يومية ولم تتم اليوم
  const pendingTodayBoxes = computed(() =>
    activeBoxes.value.filter(b => b.dailyAmount > 0 && b.lastContributionDate !== todayStr())
  )

  // القاصات التي تمت مساهمتها اليوم
  const doneTodayBoxes = computed(() =>
    activeBoxes.value.filter(b => b.dailyAmount > 0 && b.lastContributionDate === todayStr())
  )

  const fetchCashBoxes = () => {
    loading.value = true
    const q = query(collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      cashBoxes.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, (error) => { console.error('Error:', error); loading.value = false })
  }

  const addCashBox = async (data) => {
    const boxesRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes')
    await addDoc(boxesRef, {
      ...data,
      currentAmount: 0,
      status: 'active',
      dailyAmount: data.dailyAmount || 0,
      contributionMode: data.contributionMode || 'manual',
      linkedWalletId: data.linkedWalletId || null,
      lastContributionDate: null,
      createdAt: serverTimestamp()
    })
  }

  // إضافة مساهمة يومية لقاصة واحدة
  const addDailyContribution = async (boxId, walletStore = null) => {
    const box = cashBoxes.value.find(b => b.id === boxId)
    if (!box || !box.dailyAmount) return
    const today = todayStr()
    if (box.lastContributionDate === today) return
    const amount = Number(box.dailyAmount)
    const boxRef = doc(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId)
    const newAmount = (Number(box.currentAmount) || 0) + amount
    await updateDoc(boxRef, {
      currentAmount: increment(amount),
      lastContributionDate: today,
      status: newAmount >= (Number(box.targetAmount) || Infinity) ? 'completed' : 'active',
      updatedAt: serverTimestamp()
    })
    if (box.contributionMode === 'auto' && box.linkedWalletId && walletStore) {
      await walletStore.adjustBalance(box.linkedWalletId, -amount)
    }
    const logsRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs')
    await addDoc(logsRef, {
      type: 'daily',
      amount,
      note: box.contributionMode === 'auto' ? 'مساهمة تلقائية يومية' : 'مساهمة يومية يدوية',
      createdAt: serverTimestamp()
    })
  }

  // تشغيل المساهمات التلقائية عند فتح التطبيق
  const runAutoContributions = async (walletStore) => {
    const today = todayStr()
    const autoBoxes = activeBoxes.value.filter(b =>
      b.dailyAmount > 0 && b.contributionMode === 'auto' && b.linkedWalletId && b.lastContributionDate !== today
    )
    for (const box of autoBoxes) {
      await addDailyContribution(box.id, walletStore)
    }
  }

  const deposit = async (boxId, amount, note) => {
    const numAmount = Number(amount) || 0
    const logsRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs')
    await addDoc(logsRef, { type: 'deposit', amount: numAmount, note: note || '', createdAt: serverTimestamp() })
    const boxRef = doc(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId)
    const box = cashBoxes.value.find(b => b.id === boxId)
    const newAmount = (Number(box.currentAmount) || 0) + numAmount
    await updateDoc(boxRef, {
      currentAmount: increment(numAmount),
      status: newAmount >= (Number(box.targetAmount) || 0) ? 'completed' : 'active',
      updatedAt: serverTimestamp()
    })
  }

  const withdraw = async (boxId, amount, note) => {
    const numAmount = Number(amount) || 0
    const logsRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs')
    await addDoc(logsRef, { type: 'withdraw', amount: numAmount, note: note || '', createdAt: serverTimestamp() })
    const boxRef = doc(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId)
    await updateDoc(boxRef, { currentAmount: increment(-numAmount), updatedAt: serverTimestamp() })
  }

  const deleteCashBox = async (boxId) => {
    const boxRef = doc(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId)
    await deleteDoc(boxRef)
  }

  const fetchLogs = async (boxId) => {
    const q = query(collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    logs.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    return logs.value
  }

  return {
    cashBoxes, logs, loading,
    totalSaved, activeBoxes, completedBoxes,
    pendingTodayBoxes, doneTodayBoxes,
    fetchCashBoxes, addCashBox,
    addDailyContribution, runAutoContributions,
    deposit, withdraw, deleteCashBox, fetchLogs
  }
})
