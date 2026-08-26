<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white dir-rtl">
    <div class="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">💰</div>
        <h1 class="text-3xl font-bold mb-2">أموالي</h1>
        <p class="text-slate-400">إدارة الأموال العائلية</p>
      </div>

      <!-- Toggle Mode -->
      <div class="flex bg-slate-800 rounded-xl p-1 mb-6">
        <button 
          @click="isRegisterMode = true" 
          :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', isRegisterMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300']"
        >
          إنشاء حساب
        </button>
        <button 
          @click="isRegisterMode = false" 
          :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', !isRegisterMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300']"
        >
          تسجيل الدخول
        </button>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-6">

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
          <div class="relative">
            <input 
              v-model="email" 
              type="email" 
              placeholder="example@gmail.com"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 pe-10"
              required
            >
            <span class="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
          <div class="relative">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 pe-10"
              required
              minlength="6"
            >
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-white transition-colors"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="authStore.error" class="text-rose-400 text-sm text-center bg-rose-500/10 p-3 rounded-xl">
          {{ translateError(authStore.error) }}
        </div>

        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-4 transition-colors flex justify-center items-center space-x-2 space-x-reverse"
          :disabled="authStore.loading"
        >
          <svg v-if="authStore.loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ authStore.loading ? 'جاري المعالجة...' : (isRegisterMode ? 'إنشاء حساب جديد' : 'تسجيل الدخول') }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isRegisterMode = ref(true); // Default to register as requested

const handleAuth = async () => {
  if (!email.value || !password.value) return;
  
  try {
    if (isRegisterMode.value) {
      await authStore.register(email.value, password.value);
    } else {
      await authStore.login(email.value, password.value);
    }
    
    if (authStore.isAuthenticated) {
      router.push('/');
    }
  } catch (err) {
    // الخطأ يُعرض تلقائياً من authStore.error
  }
};

const translateError = (msg) => {
  if (!msg) return ''
  if (msg.includes('email-already-in-use')) return 'هذا البريد الإلكتروني مسجل مسبقاً، جرب تسجيل الدخول.'
  if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  if (msg.includes('weak-password')) return 'كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل.'
  if (msg.includes('invalid-email')) return 'صيغة البريد الإلكتروني غير صحيحة.'
  if (msg.includes('unauthorized-domain') || msg.includes('auth/unauthorized-domain')) return 'الموقع غير مصرح له من Firebase. راجع إعدادات Authorized Domains.'
  if (msg.includes('configuration-not-found')) return 'لم يتم تفعيل تسجيل الدخول بالبريد في Firebase. فعّل Email/Password من Authentication.'
  if (msg.includes('network-request-failed')) return 'لا يوجد اتصال بالإنترنت، تحقق من الشبكة.'
  if (msg.includes('too-many-requests')) return 'تم تجاوز عدد المحاولات، حاول بعد دقائق.'
  return msg
}
</script>
