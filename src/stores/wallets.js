import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, onSnapshot, query, serverTimestamp, increment, writeBatch } from 'firebase/firestore'

const STORAGE_KEY = 'amwali_wallets_cache_v2'

export const DEFAULT_WALLETS = [
  { id: 'default_cash', name: 'كاش في اليد', type: 'cash', icon: '💵', currentBalance: 0, order: 1 },
  { id: 'default_card', name: 'بطاقة ائتمان', type: 'credit_card', icon: '💳', currentBalance: 0, order: 2 }
]

export const useWalletsStore = defineStore('wallets', () => {
  const wallets = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  // استرجاع البيانات المحفوظة محلياً لسرعة التحميل وضمان العمل بدون انقطاع
  const loadLocalWallets = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          wallets.value = parsed
          return true
        }
      }
    } catch (e) {
      console.warn('Could not read wallets from localStorage:', e)
    }
    return false
  }

  const saveLocalWallets = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets.value))
    } catch (e) {
      console.warn('Could not save wallets to localStorage:', e)
    }
  }

  // تحميل أولي فوري من الذاكرة المحلية
  loadLocalWallets()
  if (wallets.value.length === 0) {
    wallets.value = [...DEFAULT_WALLETS]
    saveLocalWallets()
  }

  const totalBalance = computed(() => {
    return wallets.value.reduce((sum, wallet) => sum + (Number(wallet.currentBalance) || 0), 0)
  })

  const cashBalance = computed(() => {
    return wallets.value
      .filter(w => w.type === 'cash')
      .reduce((sum, wallet) => sum + (Number(wallet.currentBalance) || 0), 0)
  })

  const creditCardBalance = computed(() => {
    return wallets.value
      .filter(w => w.type === 'credit_card')
      .reduce((sum, wallet) => sum + (Number(wallet.currentBalance) || 0), 0)
  })

  // للإبقاء على التوافق مع الكود السابق
  const digitalBalance = computed(() => creditCardBalance.value)

  const getWalletById = computed(() => {
    return (id) => wallets.value.find(w => w.id === id)
  })

  const fetchWallets = () => {
    if (unsubscribe) return unsubscribe

    loading.value = true
    const q = query(collection(db, 'households', HOUSEHOLD_ID, 'wallets'))
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      let fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // الترتيب بالذاكرة
      fetched.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      
      if (fetched.length > 0) {
        wallets.value = fetched
        saveLocalWallets()
      } else if (wallets.value.length === 0) {
        wallets.value = [...DEFAULT_WALLETS]
        saveLocalWallets()
      }
      
      error.value = null
      loading.value = false
    }, (err) => {
      console.warn("Firestore fetchWallets error (fallback to local):", err)
      error.value = err
      loading.value = false
      // في حال الخطأ نضمن وجود المحافظ محلياً
      if (wallets.value.length === 0) {
        loadLocalWallets()
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

  const addWallet = async (data) => {
    const nextOrder = wallets.value.length > 0 
      ? Math.max(...wallets.value.map(w => w.order || 0)) + 1 
      : 1
      
    const newWalletData = {
      name: data.name.trim(),
      type: data.type === 'credit_card' ? 'credit_card' : 'cash',
      icon: data.icon || (data.type === 'credit_card' ? '💳' : '💵'),
      currentBalance: Number(data.currentBalance) || 0,
      order: nextOrder,
      createdAt: new Date().toISOString()
    }

    // حفظ محلي فوري لضمان سرعة الاستجابة
    const tempId = 'w_' + Date.now()
    const localWallet = { id: tempId, ...newWalletData }
    wallets.value.push(localWallet)
    saveLocalWallets()

    // محاولة الحفظ في Firestore
    try {
      const walletsRef = collection(db, 'households', HOUSEHOLD_ID, 'wallets')
      const docRef = await addDoc(walletsRef, {
        ...newWalletData,
        createdAt: serverTimestamp()
      })
      // تحديث المعرف الحقيقي
      localWallet.id = docRef.id
      saveLocalWallets()
    } catch (err) {
      console.warn('Firestore addDoc error (kept locally):', err)
      error.value = err
    }
  }

  const updateWallet = async (id, data) => {
    const index = wallets.value.findIndex(w => w.id === id)
    if (index !== -1) {
      wallets.value[index] = { ...wallets.value[index], ...data }
      saveLocalWallets()
    }

    try {
      const walletRef = doc(db, 'households', HOUSEHOLD_ID, 'wallets', id)
      await updateDoc(walletRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.warn('Firestore updateDoc error (updated locally):', err)
    }
  }

  const deleteWallet = async (id) => {
    // حذف محلي فوري
    wallets.value = wallets.value.filter(w => w.id !== id)
    saveLocalWallets()

    try {
      const walletRef = doc(db, 'households', HOUSEHOLD_ID, 'wallets', id)
      await deleteDoc(walletRef)
    } catch (err) {
      console.warn('Firestore deleteDoc error (deleted locally):', err)
      error.value = err
    }
  }

  const adjustBalance = async (walletId, amount) => {
    if (!walletId) return
    const numAmount = Number(amount) || 0

    // تعديل محلي فوري
    const target = wallets.value.find(w => w.id === walletId)
    if (target) {
      target.currentBalance = (Number(target.currentBalance) || 0) + numAmount
      saveLocalWallets()
    }

    try {
      const walletRef = doc(db, 'households', HOUSEHOLD_ID, 'wallets', walletId)
      await updateDoc(walletRef, {
        currentBalance: increment(numAmount),
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.warn('Firestore adjustBalance error (adjusted locally):', err)
    }
  }

  const initDefaultWallets = async () => {
    // التأكد من وجودها محلياً أولاً
    if (wallets.value.length === 0) {
      wallets.value = [...DEFAULT_WALLETS]
      saveLocalWallets()
    }

    try {
      const settingsRef = doc(db, 'households', HOUSEHOLD_ID, 'settings', 'main')
      const walletsRef = collection(db, 'households', HOUSEHOLD_ID, 'wallets')

      const settingsSnap = await getDoc(settingsRef)
      if (settingsSnap.exists() && settingsSnap.data().walletsSeeded) return

      const existing = await getDocs(walletsRef)
      if (!existing.empty) {
        await setDoc(settingsRef, { walletsSeeded: true }, { merge: true })
        return
      }

      const batch = writeBatch(db)
      DEFAULT_WALLETS.forEach(wallet => {
        const newRef = doc(walletsRef)
        batch.set(newRef, {
          name: wallet.name,
          type: wallet.type,
          icon: wallet.icon,
          currentBalance: wallet.currentBalance,
          order: wallet.order,
          createdAt: serverTimestamp()
        })
      })
      batch.set(settingsRef, { walletsSeeded: true }, { merge: true })
    } catch (err) {
      console.warn('initDefaultWallets cloud sync skipped (working offline):', err)
      error.value = err
    }
  }

  // تنظيف وحذف المحافظ القديمة مثل (زين كاش، سوبر كارد، إلخ)
  const cleanOldWallets = async () => {
    const toRemove = wallets.value.filter(w => 
      w.name?.includes('سوبر') || 
      w.name?.includes('زين') || 
      w.type === 'zain_cash' || 
      w.type === 'super_cash'
    )

    for (const w of toRemove) {
      await deleteWallet(w.id)
    }

    // إذا أصبحت القائمة فارغة أو لا يوجد محفظة كاش وبطاقة، نضمن وجود المحفظتين النظيفتين
    if (!wallets.value.some(w => w.type === 'cash')) {
      await addWallet({ name: 'كاش في اليد', type: 'cash', icon: '💵', currentBalance: 0 })
    }
    if (!wallets.value.some(w => w.type === 'credit_card')) {
      await addWallet({ name: 'بطاقة ائتمان', type: 'credit_card', icon: '💳', currentBalance: 0 })
    }
    return toRemove.length
  }

  return {
    wallets,
    loading,
    error,
    totalBalance,
    cashBalance,
    creditCardBalance,
    digitalBalance,
    getWalletById,
    fetchWallets,
    stopListening,
    addWallet,
    updateWallet,
    deleteWallet,
    adjustBalance,
    initDefaultWallets,
    cleanOldWallets
  }
})
