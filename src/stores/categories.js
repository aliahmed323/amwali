import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)

  const expenseCategories = computed(() => {
    return categories.value.filter(c => c.type === 'expense')
  })

  const incomeCategories = computed(() => {
    return categories.value.filter(c => c.type === 'income')
  })

  const fetchCategories = () => {
    loading.value = true
    const q = query(
      collection(db, 'households', HOUSEHOLD_ID, 'categories'),
      orderBy('order')
    )
    
    return onSnapshot(q, (snapshot) => {
      categories.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error("Error fetching categories:", error)
      loading.value = false
    })
  }

  const addCategory = async (data) => {
    const catsRef = collection(db, 'households', HOUSEHOLD_ID, 'categories')
    await addDoc(catsRef, {
      ...data,
      createdAt: serverTimestamp()
    })
  }

  const deleteCategory = async (id) => {
    const catRef = doc(db, 'households', HOUSEHOLD_ID, 'categories', id)
    await deleteDoc(catRef)
  }

  const initDefaultCategories = async () => {
    if (categories.value.length > 0) return

    const defaults = [
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

    const batch = writeBatch(db)
    const catsRef = collection(db, 'households', HOUSEHOLD_ID, 'categories')

    defaults.forEach(cat => {
      const newRef = doc(catsRef)
      batch.set(newRef, {
        ...cat,
        createdAt: serverTimestamp()
      })
    })

    await batch.commit()
  }

  return {
    categories,
    loading,
    expenseCategories,
    incomeCategories,
    fetchCategories,
    addCategory,
    deleteCategory,
    initDefaultCategories
  }
})
