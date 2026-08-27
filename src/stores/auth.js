import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { auth } from '../firebase.js'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authReady = ref(false)

  // وعد ينتهي عندما تنتهي Firebase من التحقق الأول
  let authReadyResolve = null
  const authReadyPromise = new Promise((resolve) => {
    authReadyResolve = resolve
  })

  const isAuthenticated = computed(() => !!user.value)

  const userName = computed(() => {
    if (!user.value) return 'المستخدم'
    const email = user.value.email?.toLowerCase() || ''
    if (email.includes('wife') || email.includes('زوجة')) return 'الزوجة'
    if (user.value.displayName) return user.value.displayName
    return 'الزوج'
  })

  const userInitial = computed(() => {
    return userName.value ? userName.value.charAt(0) : 'م'
  })

  const waitForAuth = () => authReadyPromise

  const initAuth = () => {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
      loading.value = false
      if (!authReady.value) {
        authReady.value = true
        authReadyResolve()
      }
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

  const register = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
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
    authReady,
    isAuthenticated,
    userName,
    userInitial,
    waitForAuth,
    initAuth,
    login,
    register,
    logout
  }
})
