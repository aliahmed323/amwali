import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, increment, writeBatch } from 'firebase/firestore'

export const useWalletsStore = defineStore('wallets', () => {
  const wallets = ref([])
  const loading = ref(false)

  const totalBalance = computed(() => {
    return wallets.value.reduce((sum, wallet) => sum + (Number(wallet.currentBalance) || 0), 0)
  })

  const cashBalance = computed(() => {
    return wallets.value
      .filter(w => w.type === 'cash')
      .reduce((sum, wallet) => sum + (Number(wallet.currentBalance) || 0), 0)
  })

  const digitalBalance = computed(() => {
    return totalBalance.value - cashBalance.value
  })

  const getWalletById = computed(() => {
    return (id) => wallets.value.find(w => w.id === id)
  })

  const fetchWallets = () => {
    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'wallets'),
      orderBy('order')
    )
    
    return onSnapshot(q, (snapshot) => {
      wallets.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching wallets:", error)
      loading.value = false
    })
  }

  const addWallet = async (data) => {
    const walletsRef = collection(db, 'households', HOUSEHOLD_ID, 'wallets')
    await addDoc(walletsRef, {
      ...data,
      currentBalance: data.currentBalance || 0,
      createdAt: serverTimestamp()
    })
  }

  const updateWallet = async (id, data) => {
    const walletRef = doc(db, 'households', HOUSEHOLD_ID, 'wallets', id)
    await updateDoc(walletRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  const deleteWallet = async (id) => {
    const walletRef = doc(db, 'households', HOUSEHOLD_ID, 'wallets', id)
    await deleteDoc(walletRef)
  }

  const adjustBalance = async (walletId, amount) => {
    if (!walletId) return
    const walletRef = doc(db, 'households', HOUSEHOLD_ID, 'wallets', walletId)
    await updateDoc(walletRef, {
      currentBalance: increment(amount),
      updatedAt: serverTimestamp()
    })
  }

  const initDefaultWallets = async () => {
    if (wallets.value.length > 0) return

    const defaults = [
      { name: 'كاش في اليد', type: 'cash', icon: '💵', currentBalance: 0, order: 1 },
      { name: 'زين كاش', type: 'zain_cash', icon: '📱', currentBalance: 0, order: 2 },
      { name: 'سوبر كاش', type: 'super_cash', icon: '💳', currentBalance: 0, order: 3 },
      { name: 'كريدت كارد', type: 'credit_card', icon: '🏦', currentBalance: 0, order: 4 }
    ]

    const batch = writeBatch(db)
    const walletsRef = collection(db, 'households', HOUSEHOLD_ID, 'wallets')

    defaults.forEach(wallet => {
      const newRef = doc(walletsRef)
      batch.set(newRef, {
        ...wallet,
        createdAt: serverTimestamp()
      })
    })

    await batch.commit()
  }

  return {
    wallets,
    loading,
    totalBalance,
    cashBalance,
    digitalBalance,
    getWalletById,
    fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    adjustBalance,
    initDefaultWallets
  }
})
