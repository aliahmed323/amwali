import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, onSnapshot, query, serverTimestamp, writeBatch } from 'firebase/firestore'

const STORAGE_KEY = 'amwali_categories_cache_v2'

// الأقسام الافتراضية
export const DEFAULT_CATEGORIES = [
  // Expenses
  { id: 'def_c_1', name: 'إيجار', icon: '🏠', type: 'expense', order: 1, isDefault: true },
  { id: 'def_c_2', name: 'وقود', icon: '⛽', type: 'expense', order: 2, isDefault: true },
  { id: 'def_c_3', name: 'مواد غذائية', icon: '🛒', type: 'expense', order: 3, isDefault: true },
  { id: 'def_c_4', name: 'صحة وعلاج', icon: '💊', type: 'expense', order: 4, isDefault: true },
  { id: 'def_c_5', name: 'اتصالات وإنترنت', icon: '📱', type: 'expense', order: 5, isDefault: true },
  { id: 'def_c_6', name: 'تعليم ودراسة', icon: '🎓', type: 'expense', order: 6, isDefault: true },
  { id: 'def_c_7', name: 'ملابس وتجهيزات', icon: '👕', type: 'expense', order: 7, isDefault: true },
  { id: 'def_c_8', name: 'صيانة ومصاريف سيارة', icon: '🔧', type: 'expense', order: 8, isDefault: true },
  { id: 'def_c_9', name: 'كهرباء ومياه', icon: '💡', type: 'expense', order: 9, isDefault: true },
  { id: 'def_c_10', name: 'نقل ومواصلات', icon: '🚌', type: 'expense', order: 10, isDefault: true },
  { id: 'def_c_11', name: 'ترفيه ومطاعم', icon: '🎉', type: 'expense', order: 11, isDefault: true },
  { id: 'def_c_12', name: 'أخرى ونثريات', icon: '📦', type: 'expense', order: 12, isDefault: true },

  // Incomes
  { id: 'def_c_13', name: 'الراتب الأساسي', icon: '💵', type: 'income', order: 13, isDefault: true },
  { id: 'def_c_14', name: 'أعمال وتجارة', icon: '💼', type: 'income', order: 14, isDefault: true },
  { id: 'def_c_15', name: 'استثمار وأرباح', icon: '📈', type: 'income', order: 15, isDefault: true },
  { id: 'def_c_16', name: 'دخل إضافي', icon: '💰', type: 'income', order: 16, isDefault: true }
]

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  const categoriesRef = () => collection(db, 'households', HOUSEHOLD_ID, 'categories')

  // استرجاع وحفظ محلي
  const loadLocalCategories = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          categories.value = parsed
          return true
        }
      }
    } catch (e) {
      console.warn('Could not read categories from localStorage:', e)
    }
    return false
  }

  const saveLocalCategories = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories.value))
    } catch (e) {
      console.warn('Could not save categories to localStorage:', e)
    }
  }

  // تحميل فوري من الذاكرة المحلية
  loadLocalCategories()
  if (categories.value.length === 0) {
    categories.value = [...DEFAULT_CATEGORIES]
    saveLocalCategories()
  }

  const expenseCategories = computed(() => {
    return categories.value.filter(c => c.type === 'expense')
  })

  const incomeCategories = computed(() => {
    return categories.value.filter(c => c.type === 'income')
  })

  const fetchCategories = () => {
    if (unsubscribe) return unsubscribe

    loading.value = true
    const q = query(categoriesRef())

    unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      fetched.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      
      if (fetched.length > 0) {
        categories.value = fetched
        saveLocalCategories()
      } else if (categories.value.length === 0) {
        categories.value = [...DEFAULT_CATEGORIES]
        saveLocalCategories()
      }

      error.value = null
      loading.value = false
    }, (err) => {
      console.warn('Firestore fetchCategories error (fallback to local):', err)
      error.value = err
      loading.value = false
      if (categories.value.length === 0) {
        loadLocalCategories()
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

  const addCategory = async (data) => {
    const nextOrder = categories.value.length > 0
      ? Math.max(...categories.value.map(c => c.order || 0)) + 1
      : 1
      
    const newCat = {
      name: data.name.trim(),
      icon: data.icon || '📦',
      type: data.type,
      order: data.order ?? nextOrder,
      isDefault: false
    }

    // إضافة محلية فورية
    const tempId = 'cat_' + Date.now()
    const localCat = { id: tempId, ...newCat }
    categories.value.push(localCat)
    saveLocalCategories()

    // محاولة الحفظ السحابي
    try {
      const docRef = await addDoc(categoriesRef(), {
        ...newCat,
        createdAt: serverTimestamp()
      })
      localCat.id = docRef.id
      saveLocalCategories()
    } catch (err) {
      console.warn('Firestore addCategory error (kept locally):', err)
      error.value = err
    }
  }

  const updateCategory = async (id, data) => {
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...data }
      saveLocalCategories()
    }

    try {
      const catRef = doc(db, 'households', HOUSEHOLD_ID, 'categories', id)
      await updateDoc(catRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.warn('Firestore updateCategory error (updated locally):', err)
    }
  }

  const deleteCategory = async (id) => {
    // حذف محلي فوري
    categories.value = categories.value.filter(c => c.id !== id)
    saveLocalCategories()

    try {
      const catRef = doc(db, 'households', HOUSEHOLD_ID, 'categories', id)
      await deleteDoc(catRef)
    } catch (err) {
      console.warn('Firestore deleteCategory error (deleted locally):', err)
      error.value = err
    }
  }

  // إضافة الأقسام الافتراضية الناقصة محلياً وسحابياً دون أي تعليق
  const restoreDefaultCategories = async () => {
    const existing = new Set(categories.value.map(c => `${c.type}::${c.name}`))
    const missing = DEFAULT_CATEGORIES.filter(c => !existing.has(`${c.type}::${c.name}`))
    
    if (missing.length === 0) return 0

    // إضافة محلية فورية
    missing.forEach(cat => {
      categories.value.push({
        id: 'cat_def_' + Math.random().toString(36).substring(2, 8),
        name: cat.name,
        icon: cat.icon,
        type: cat.type,
        order: cat.order,
        isDefault: true
      })
    })
    categories.value.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    saveLocalCategories()

    // محاولة المزامنة مع Firestore في الخلفية
    try {
      const batch = writeBatch(db)
      missing.forEach(cat => {
        batch.set(doc(categoriesRef()), {
          name: cat.name,
          icon: cat.icon,
          type: cat.type,
          order: cat.order,
          isDefault: true,
          createdAt: serverTimestamp()
        })
      })
      await batch.commit()
    } catch (err) {
      console.warn('Firestore restoreDefaultCategories batch skipped (restored locally):', err)
      error.value = err
    }

    return missing.length
  }

  const initDefaultCategories = async () => {
    if (categories.value.length === 0) {
      categories.value = [...DEFAULT_CATEGORIES]
      saveLocalCategories()
    }

    try {
      const settingsRef = doc(db, 'households', HOUSEHOLD_ID, 'settings', 'main')
      const settingsSnap = await getDoc(settingsRef)
      if (settingsSnap.exists() && settingsSnap.data().categoriesSeeded) return

      const snap = await getDocs(categoriesRef())
      if (!snap.empty) {
        await setDoc(settingsRef, { categoriesSeeded: true }, { merge: true })
        return
      }

      const batch = writeBatch(db)
      DEFAULT_CATEGORIES.forEach(cat => {
        batch.set(doc(categoriesRef()), {
          name: cat.name,
          icon: cat.icon,
          type: cat.type,
          order: cat.order,
          isDefault: true,
          createdAt: serverTimestamp()
        })
      })
      batch.set(settingsRef, { categoriesSeeded: true }, { merge: true })
      await batch.commit()
    } catch (err) {
      console.warn('initDefaultCategories skipped cloud sync (working locally):', err)
      error.value = err
    }
  }

  // تنظيف وإزالة الأقسام القديمة مثل (إيراد التاكسي وراتب الزوجة)
  const cleanOldCategories = async () => {
    const toRemove = categories.value.filter(c =>
      c.name?.includes('تاكسي') ||
      c.name?.includes('الزوجة')
    )

    for (const c of toRemove) {
      await deleteCategory(c.id)
    }

    // إضافة الأقسام النظيفة المتبقية
    await restoreDefaultCategories()
    return toRemove.length
  }

  return {
    categories,
    loading,
    error,
    expenseCategories,
    incomeCategories,
    fetchCategories,
    stopListening,
    addCategory,
    updateCategory,
    deleteCategory,
    restoreDefaultCategories,
    initDefaultCategories,
    cleanOldCategories
  }
})
