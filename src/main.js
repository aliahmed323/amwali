import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { useAuthStore } from './stores/auth';
import { useWalletsStore } from './stores/wallets';
import { useCategoriesStore } from './stores/categories';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// يجب استدعاء initAuth قبل تركيب التطبيق حتى يكون المستمع جاهزاً
// قبل أن يبدأ حارس الروتر في التحقق من حالة المصادقة
const authStore = useAuthStore();
authStore.initAuth();

// الآن نركب التطبيق — حارس الروتر سينتظر Firebase عبر waitForAuth()
app.mount('#app');

// تحميل البيانات الافتراضية عند تسجيل الدخول
let initialized = false;
authStore.$subscribe(async () => {
  if (authStore.isAuthenticated && !initialized) {
    initialized = true;
    const walletsStore = useWalletsStore();
    const categoriesStore = useCategoriesStore();

    walletsStore.fetchWallets();
    categoriesStore.fetchCategories();

    setTimeout(async () => {
      await walletsStore.initDefaultWallets();
      await categoriesStore.initDefaultCategories();
    }, 1500);
  }
  if (!authStore.isAuthenticated) {
    initialized = false;
  }
});
