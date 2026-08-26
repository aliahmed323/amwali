import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, increment, getDocs } from 'firebase/firestore'

export const useDebtsStore = defineStore('debts', () => {
  const debts = ref([])
  const payments = ref([])
  const loading = ref(false)

  const debtsWeOwe = computed(() => {
    return debts.value.filter(d => d.type === 'owe_others' && d.status === 'active')
  })

  const debtsOwedToUs = computed(() => {
    return debts.value.filter(d => d.type === 'others_owe_us' && d.status === 'active')
  })

  const totalOwedByUs = computed(() => {
    return debtsWeOwe.value.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0)
  })

  const totalOwedToUs = computed(() => {
    return debtsOwedToUs.value.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0)
  })

  const activeDebts = computed(() => {
    return debts.value.filter(d => d.status === 'active')
  })

  const settledDebts = computed(() => {
    return debts.value.filter(d => d.status === 'paid')
  })

  const fetchDebts = () => {
    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'debts'),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      debts.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching debts:", error)
      loading.value = false
    })
  }

  const addDebt = async (data) => {
    const debtsRef = collection(db, 'households', HOUSEHOLD_ID, 'debts')
    await addDoc(debtsRef, {
      ...data,
      paidAmount: 0,
      remainingAmount: Number(data.totalAmount) || 0,
      status: 'active',
      createdAt: serverTimestamp()
    })
  }

  const addPayment = async (debtId, amount, note) => {
    const numAmount = Number(amount) || 0
    
    // Add payment doc
    const paymentsRef = collection(db, 'households', HOUSEHOLD_ID, 'debts', debtId, 'payments')
    await addDoc(paymentsRef, {
      amount: numAmount,
      note: note || '',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    })

    // Update debt doc
    const debtRef = doc(db, 'households', HOUSEHOLD_ID, 'debts', debtId)
    const debt = debts.value.find(d => d.id === debtId)
    
    const newRemainingAmount = (Number(debt.remainingAmount) || 0) - numAmount
    
    await updateDoc(debtRef, {
      paidAmount: increment(numAmount),
      remainingAmount: increment(-numAmount),
      status: newRemainingAmount <= 0 ? 'paid' : 'active',
      updatedAt: serverTimestamp()
    })
  }

  const markAsPaid = async (debtId) => {
    const debtRef = doc(db, 'households', HOUSEHOLD_ID, 'debts', debtId)
    const debt = debts.value.find(d => d.id === debtId)
    const remaining = Number(debt?.remainingAmount) || 0

    await updateDoc(debtRef, {
      status: 'paid',
      remainingAmount: 0,
      paidAmount: increment(remaining),
      updatedAt: serverTimestamp()
    })
  }

  const deleteDebt = async (debtId) => {
    const debtRef = doc(db, 'households', HOUSEHOLD_ID, 'debts', debtId)
    await deleteDoc(debtRef)
  }

  const fetchPayments = async (debtId) => {
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'debts', debtId, 'payments'),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    payments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return payments.value
  }

  return {
    debts,
    payments,
    loading,
    debtsWeOwe,
    debtsOwedToUs,
    totalOwedByUs,
    totalOwedToUs,
    activeDebts,
    settledDebts,
    fetchDebts,
    addDebt,
    addPayment,
    markAsPaid,
    deleteDebt,
    fetchPayments
  }
})
