import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { useWalletsStore } from './wallets.js'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)

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
    const month = new Date().toISOString().slice(0, 7)
    return transactions.value
      .filter(t => t.type === 'income' && t.date && t.date.startsWith(month))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  })

  const monthExpense = computed(() => {
    const month = new Date().toISOString().slice(0, 7)
    return transactions.value
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(month))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  })

  const monthlyNetProfit = computed(() => {
    return monthIncome.value - monthExpense.value
  })

  const recentTransactions = computed(() => {
    return transactions.value.slice(0, 10)
  })

  const fetchTransactions = () => {
    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(200)
    )
    
    return onSnapshot(q, (snapshot) => {
      transactions.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching transactions:", error)
      loading.value = false
    })
  }

  const addTransaction = async (data) => {
    const walletsStore = useWalletsStore()
    const amount = Number(data.amount) || 0
    
    const docData = {
      ...data,
      amount,
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    }
    
    const txRef = collection(db, 'households', HOUSEHOLD_ID, 'transactions')
    await addDoc(txRef, docData)

    if (data.type === 'income') {
      await walletsStore.adjustBalance(data.walletId, amount)
    } else if (data.type === 'expense') {
      await walletsStore.adjustBalance(data.walletId, -amount)
    } else if (data.type === 'transfer') {
      await walletsStore.adjustBalance(data.fromWalletId, -amount)
      await walletsStore.adjustBalance(data.toWalletId, amount)
    }
  }

  const deleteTransaction = async (id) => {
    const tx = transactions.value.find(t => t.id === id)
    if (!tx) return

    const walletsStore = useWalletsStore()
    const amount = Number(tx.amount) || 0

    if (tx.type === 'income') {
      await walletsStore.adjustBalance(tx.walletId, -amount)
    } else if (tx.type === 'expense') {
      await walletsStore.adjustBalance(tx.walletId, amount)
    } else if (tx.type === 'transfer') {
      await walletsStore.adjustBalance(tx.fromWalletId, amount)
      await walletsStore.adjustBalance(tx.toWalletId, -amount)
    }

    const txRef = doc(db, 'households', HOUSEHOLD_ID, 'transactions', id)
    await deleteDoc(txRef)
  }

  return {
    transactions,
    loading,
    todayIncome,
    todayExpense,
    monthIncome,
    monthExpense,
    monthlyNetProfit,
    recentTransactions,
    fetchTransactions,
    addTransaction,
    deleteTransaction
  }
})
