import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, arrayUnion } from 'firebase/firestore'

export const useSavingsGroupsStore = defineStore('savingsGroups', () => {
  const groups = ref([])
  const loading = ref(false)

  const activeGroups = computed(() => {
    return groups.value.filter(g => g.status === 'active')
  })

  const completedGroups = computed(() => {
    return groups.value.filter(g => g.status === 'completed')
  })

  const totalMonthlyCommitment = computed(() => {
    return activeGroups.value.reduce((sum, g) => sum + (Number(g.monthlyShare) || 0), 0)
  })

  const fetchGroups = () => {
    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'savings_groups'),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      groups.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching savings groups:", error)
      loading.value = false
    })
  }

  const addGroup = async (data) => {
    const groupsRef = collection(db, 'households', HOUSEHOLD_ID, 'savings_groups')
    const monthlyShare = Number(data.monthlyShare) || 0
    const totalMonths = Number(data.totalMonths) || 0

    await addDoc(groupsRef, {
      ...data,
      status: 'active',
      paidMonths: [],
      isPayoutReceived: false,
      totalAmount: monthlyShare * totalMonths,
      createdAt: serverTimestamp()
    })
  }

  const recordInstallment = async (groupId, monthNumber) => {
    const groupRef = doc(db, 'households', HOUSEHOLD_ID, 'savings_groups', groupId)
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return

    // 1. Add to paidMonths array
    // 2. We also could add an installment doc to a subcollection (per instructions)
    const installmentsRef = collection(db, 'households', HOUSEHOLD_ID, 'savings_groups', groupId, 'installments')
    await addDoc(installmentsRef, {
      monthNumber,
      amount: group.monthlyShare,
      isPaid: true,
      paidDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    })

    const newPaidCount = (group.paidMonths?.length || 0) + 1
    const isCompleted = newPaidCount >= (Number(group.totalMonths) || 0)

    await updateDoc(groupRef, {
      paidMonths: arrayUnion(monthNumber),
      status: isCompleted ? 'completed' : 'active',
      updatedAt: serverTimestamp()
    })
  }

  const markPayoutReceived = async (groupId) => {
    const groupRef = doc(db, 'households', HOUSEHOLD_ID, 'savings_groups', groupId)
    await updateDoc(groupRef, {
      isPayoutReceived: true,
      updatedAt: serverTimestamp()
    })
  }

  const deleteGroup = async (groupId) => {
    const groupRef = doc(db, 'households', HOUSEHOLD_ID, 'savings_groups', groupId)
    await deleteDoc(groupRef)
  }

  return {
    groups,
    loading,
    activeGroups,
    completedGroups,
    totalMonthlyCommitment,
    fetchGroups,
    addGroup,
    recordInstallment,
    markPayoutReceived,
    deleteGroup
  }
})
