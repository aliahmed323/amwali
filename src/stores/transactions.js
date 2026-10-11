import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { useWalletsStore } from './wallets.js'
import { useSettingsStore } from './settings.js'

const STORAGE_KEY = 'amwali_transactions_cache_v2'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  // استرجاع وحفظ محلي
  const loadLocalTransactions = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          transactions.value = parsed
          return true
        }
      }
    } catch (e) {
      console.warn('Could not read transactions from localStorage:', e)
    }
    return false
  }

  const saveLocalTransactions = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions.value.slice(0, 300)))
    } catch (e) {
      console.warn('Could not save transactions to localStorage:', e)
    }
  }

  // تحميل فوري أولي
  loadLocalTransactions()

  const todayIncome = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return transactions.value
      .filter(t => t.type === 'income' && t.date === today)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  })

  const todayExpense = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return transactions.value
      .filter(t => t.type === 'expense' && t.date === today)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  })

  const monthIncome = computed(() => {
    const settingsStore = useSettingsStore()
    const cycleStart = settingsStore.activeCycleStart
    return transactions.value
      .filter(t => t.type === 'income' && t.date && t.date >= cycleStart)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  })

  const monthExpense = computed(() => {
    const settingsStore = useSettingsStore()
    const cycleStart = settingsStore.activeCycleStart
    return transactions.value
      .filter(t => t.type === 'expense' && t.date && t.date >= cycleStart)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  })

  const monthlyNetProfit = computed(() => {
    return monthIncome.value - monthExpense.value
  })

  const recentTransactions = computed(() => {
    return transactions.value.slice(0, 15)
  })

  const fetchTransactions = () => {
    if (unsubscribe) return unsubscribe

    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(200)
    )
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      transactions.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      saveLocalTransactions()
      error.value = null
      loading.value = false
    }, (err) => {
      console.warn("Firestore fetchTransactions error (fallback to local):", err)
      error.value = err
      loading.value = false
      if (transactions.value.length === 0) {
        loadLocalTransactions()
      }
    })
    return unsubscribe
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  const addTransaction = async (data) => {
    const walletsStore = useWalletsStore()
    const amount = Number(data.amount) || 0
    
    const localTx = {
      id: 'tx_' + Date.now(),
      ...data,
      amount,
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
    
    // إضافة محلية فورية في أعلى القائمة
    transactions.value.unshift(localTx)
    saveLocalTransactions()

    // تعديل أرصدة المحافظ محلياً وفورياً
    if (data.type === 'income') {
      await walletsStore.adjustBalance(data.walletId, amount)
    } else if (data.type === 'expense') {
      await walletsStore.adjustBalance(data.walletId, -amount)
    } else if (data.type === 'transfer') {
      await walletsStore.adjustBalance(data.fromWalletId, -amount)
      await walletsStore.adjustBalance(data.toWalletId, amount)
    }

    // محاولة الحفظ في Firestore
    try {
      const txRef = collection(db, 'households', HOUSEHOLD_ID, 'transactions')
      const docRef = await addDoc(txRef, {
        ...data,
        amount,
        date: localTx.date,
        createdAt: serverTimestamp()
      })
      localTx.id = docRef.id
      saveLocalTransactions()
    } catch (err) {
      console.warn('Firestore addDoc error (kept locally):', err)
      error.value = err
    }
  }

  const deleteTransaction = async (id) => {
    const tx = transactions.value.find(t => t.id === id)
    if (!tx) return

    const walletsStore = useWalletsStore()
    const amount = Number(tx.amount) || 0

    // تعديل الرصيد العكسي
    if (tx.type === 'income') {
      await walletsStore.adjustBalance(tx.walletId, -amount)
    } else if (tx.type === 'expense') {
      await walletsStore.adjustBalance(tx.walletId, amount)
    } else if (tx.type === 'transfer') {
      await walletsStore.adjustBalance(tx.fromWalletId, amount)
      await walletsStore.adjustBalance(tx.toWalletId, -amount)
    }

    // حذف محلي فوري
    transactions.value = transactions.value.filter(t => t.id !== id)
    saveLocalTransactions()

    try {
      const txRef = doc(db, 'households', HOUSEHOLD_ID, 'transactions', id)
      await deleteDoc(txRef)
    } catch (err) {
      console.warn('Firestore deleteTransaction error (deleted locally):', err)
      error.value = err
    }
  }

  return {
    transactions,
    loading,
    error,
    todayIncome,
    todayExpense,
    monthIncome,
    monthExpense,
    monthlyNetProfit,
    recentTransactions,
    fetchTransactions,
    stopListening,
    addTransaction,
    deleteTransaction
  }
})
