import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { auth } from '../firebase.js'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  
  const userName = computed(() => {
    if (!user.value) return 'الزوج'
    const email = user.value.email?.toLowerCase() || ''
    if (email.includes('wife') || email.includes('زوجة')) return 'الزوجة'
    if (user.value.displayName) return user.value.displayName
    return 'الزوج'
  })
  
  const userInitial = computed(() => {
    return userName.value ? userName.value.charAt(0) : 'ز'
  })

  const initAuth = () => {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
      loading.value = false
    })
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async (router) => {
    try {
      await signOut(auth)
      user.value = null
      if (router) {
        router.push('/login')
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userName,
    userInitial,
    initAuth,
    login,
    logout
  }
})
