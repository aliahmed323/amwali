import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, onSnapshot, query, serverTimestamp, writeBatch } from 'firebase/firestore'

// الأقسام الافتراضية
export const DEFAULT_CATEGORIES = [
  // Expenses
  { name: 'إيجار', icon: '🏠', type: 'expense', order: 1, isDefault: true },
  { name: 'وقود', icon: '⛽', type: 'expense', order: 2, isDefault: true },
  { name: 'مواد غذائية', icon: '🛒', type: 'expense', order: 3, isDefault: true },
  { name: 'صحة', icon: '💊', type: 'expense', order: 4, isDefault: true },
  { name: 'اتصالات', icon: '📱', type: 'expense', order: 5, isDefault: true },
  { name: 'تعليم', icon: '🎓', type: 'expense', order: 6, isDefault: true },
  { name: 'ملابس', icon: '👕', type: 'expense', order: 7, isDefault: true },
  { name: 'صيانة السيارة', icon: '🔧', type: 'expense', order: 8, isDefault: true },
  { name: 'كهرباء وماء', icon: '💡', type: 'expense', order: 9, isDefault: true },
  { name: 'نقل ومواصلات', icon: '🚌', type: 'expense', order: 10, isDefault: true },
  { name: 'ترفيه', icon: '🎉', type: 'expense', order: 11, isDefault: true },
  { name: 'أخرى', icon: '📦', type: 'expense', order: 12, isDefault: true },

  // Incomes
  { name: 'إيراد التاكسي', icon: '🚕', type: 'income', order: 13, isDefault: true },
  { name: 'راتب الزوجة', icon: '💰', type: 'income', order: 14, isDefault: true },
  { name: 'دخل إضافي', icon: '💵', type: 'income', order: 15, isDefault: true }
]

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  const categoriesRef = () => collection(db, 'households', HOUSEHOLD_ID, 'categories')

  const expenseCategories = computed(() => {
    return categories.value.filter(c => c.type === 'expense')
  })

  const incomeCategories = computed(() => {
    return categories.value.filter(c => c.type === 'income')
  })

  const fetchCategories = () => {
    // تجنب إنشاء أكثر من مستمع لنفس البيانات
    if (unsubscribe) return unsubscribe

    loading.value = true
    // ملاحظة: لا نستخدم orderBy('order') هنا لأن Firestore يستبعد أي مستند
    // لا يحتوي على الحقل 'order'، فنرتب في الذاكرة بدلاً من ذلك
    const q = query(categoriesRef())

    unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      fetched.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      categories.value = fetched
      error.value = null
      loading.value = false
    }, (err) => {
      console.error('Error fetching categories:', err)
      error.value = err
      loading.value = false
      unsubscribe = null
    })
    return unsubscribe
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    categories.value = []
  }

  const addCategory = async (data) => {
    const nextOrder = categories.value.length > 0
      ? Math.max(...categories.value.map(c => c.order || 0)) + 1
      : 1
    await addDoc(categoriesRef(), {
      name: data.name.trim(),
      icon: data.icon || '📦',
      type: data.type,
      order: data.order ?? nextOrder,
      isDefault: false,
      createdAt: serverTimestamp()
    })
  }

  const updateCategory = async (id, data) => {
    const catRef = doc(db, 'households', HOUSEHOLD_ID, 'categories', id)
    await updateDoc(catRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  const deleteCategory = async (id) => {
    const catRef = doc(db, 'households', HOUSEHOLD_ID, 'categories', id)
    await deleteDoc(catRef)
  }

  // إضافة الأقسام الافتراضية الناقصة فقط (بدون تكرار الموجود بنفس الاسم والنوع)
  const restoreDefaultCategories = async () => {
    const existing = new Set(categories.value.map(c => `${c.type}::${c.name}`))
    const missing = DEFAULT_CATEGORIES.filter(c => !existing.has(`${c.type}::${c.name}`))
    if (missing.length === 0) return 0

    const batch = writeBatch(db)
    missing.forEach(cat => {
      batch.set(doc(categoriesRef()), { ...cat, createdAt: serverTimestamp() })
    })
    await batch.commit()
    return missing.length
  }

  // إنشاء الأقسام الافتراضية عند أول استخدام فقط
  const initDefaultCategories = async () => {
    const settingsRef = doc(db, 'households', HOUSEHOLD_ID, 'settings', 'main')

    // نتحقق من الخادم مباشرة بدل الاعتماد على المصفوفة المحلية
    // لتجنب إنشاء نسخ مكررة إذا تأخر تحميل البيانات
    try {
      const settingsSnap = await getDoc(settingsRef)
      if (settingsSnap.exists() && settingsSnap.data().categoriesSeeded) return

      const snap = await getDocs(categoriesRef())
      if (!snap.empty || categories.value.length > 0) {
        await setDoc(settingsRef, { categoriesSeeded: true }, { merge: true })
        return
      }
    } catch (err) {
      console.error('Could not verify categories before seeding:', err)
      return
    }

    const batch = writeBatch(db)
    DEFAULT_CATEGORIES.forEach(cat => {
      batch.set(doc(categoriesRef()), { ...cat, createdAt: serverTimestamp() })
    })
    batch.set(settingsRef, { categoriesSeeded: true }, { merge: true })
    await batch.commit()
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
    initDefaultCategories
  }
})
