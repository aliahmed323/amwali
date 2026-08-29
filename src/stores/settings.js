import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db, HOUSEHOLD_ID } from '../firebase.js'
import { collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'

export const useSettingsStore = defineStore('settings', () => {
  const cycleStartDate = ref(null)
  const previousCycles = ref([])
  const loading = ref(false)

  // First day of current month as default fallback
  const fallbackDate = new Date()
  fallbackDate.setDate(1)
  const defaultStartDate = fallbackDate.toISOString().split('T')[0]

  const activeCycleStart = computed(() => cycleStartDate.value || defaultStartDate)

  const fetchSettings = () => {
    loading.value = true
    
    // Fetch Settings
    const settingsRef = doc(db, 'households', HOUSEHOLD_ID, 'settings', 'main')
    onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().cycleStartDate) {
        cycleStartDate.value = docSnap.data().cycleStartDate
      }
    })

    // Fetch Cycles
    const cyclesQuery = query(
      collection(db, 'households', HOUSEHOLD_ID, 'cycles'),
      orderBy('createdAt', 'desc')
    )
    onSnapshot(cyclesQuery, (snapshot) => {
      previousCycles.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    })
  }

  const archiveCurrentCycle = async (income, expense) => {
    const today = new Date().toISOString().split('T')[0]
    const currentStart = activeCycleStart.value
    
    // Save to cycles
    const cyclesRef = collection(db, 'households', HOUSEHOLD_ID, 'cycles')
    await addDoc(cyclesRef, {
      startDate: currentStart,
      endDate: today,
      income: income || 0,
      expense: expense || 0,
      createdAt: serverTimestamp()
    })

    // Update new cycle start date
    const settingsRef = doc(db, 'households', HOUSEHOLD_ID, 'settings', 'main')
    await setDoc(settingsRef, { cycleStartDate: today }, { merge: true })
  }

  return {
    cycleStartDate,
    previousCycles,
    activeCycleStart,
    fetchSettings,
    archiveCurrentCycle
  }
})
