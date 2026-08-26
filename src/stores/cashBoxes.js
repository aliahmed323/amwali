import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, increment, getDocs } from 'firebase/firestore'

export const useCashBoxesStore = defineStore('cashBoxes', () => {
  const cashBoxes = ref([])
  const logs = ref([])
  const loading = ref(false)

  const totalSaved = computed(() => {
    return cashBoxes.value.reduce((sum, box) => sum + (Number(box.currentAmount) || 0), 0)
  })

  const activeBoxes = computed(() => {
    return cashBoxes.value.filter(b => b.status !== 'completed')
  })

  const completedBoxes = computed(() => {
    return cashBoxes.value.filter(b => b.status === 'completed')
  })

  const fetchCashBoxes = () => {
    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes'),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      cashBoxes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching cash boxes:", error)
      loading.value = false
    })
  }

  const addCashBox = async (data) => {
    const boxesRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes')
    await addDoc(boxesRef, {
      ...data,
      currentAmount: 0,
      status: 'active',
      createdAt: serverTimestamp()
    })
  }

  const deposit = async (boxId, amount, note) => {
    const numAmount = Number(amount) || 0
    
    // Add log
    const logsRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs')
    await addDoc(logsRef, {
      type: 'deposit',
      amount: numAmount,
      note: note || '',
      createdAt: serverTimestamp()
    })

    // Update box
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
    
    // Add log
    const logsRef = collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs')
    await addDoc(logsRef, {
      type: 'withdraw',
      amount: numAmount,
      note: note || '',
      createdAt: serverTimestamp()
    })

    // Update box
    const boxRef = doc(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId)
    const box = cashBoxes.value.find(b => b.id === boxId)
    
    const newAmount = (Number(box.currentAmount) || 0) - numAmount
    
    await updateDoc(boxRef, {
      currentAmount: increment(-numAmount),
      status: newAmount < (Number(box.targetAmount) || 0) ? 'active' : box.status,
      updatedAt: serverTimestamp()
    })
  }

  const deleteCashBox = async (boxId) => {
    const boxRef = doc(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId)
    await deleteDoc(boxRef)
  }

  const fetchLogs = async (boxId) => {
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'cash_boxes', boxId, 'logs'),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    logs.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return logs.value
  }

  return {
    cashBoxes,
    logs,
    loading,
    totalSaved,
    activeBoxes,
    completedBoxes,
    fetchCashBoxes,
    addCashBox,
    deposit,
    withdraw,
    deleteCashBox,
    fetchLogs
  }
})
