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

app.mount('#app');

const authStore = useAuthStore();
authStore.initAuth();

// عند تسجيل الدخول، نُحمّل البيانات الافتراضية تلقائياً إذا لم تكن موجودة
let initialized = false;
const unwatch = authStore.$subscribe(async () => {
  if (authStore.isAuthenticated && !initialized) {
    initialized = true;
    const walletsStore = useWalletsStore();
    const categoriesStore = useCategoriesStore();

    // تشغيل الاستماع لبيانات Firebase
    walletsStore.fetchWallets();
    categoriesStore.fetchCategories();

    // إنشاء محافظ وأقسام افتراضية إذا كانت قاعدة البيانات فارغة
    setTimeout(async () => {
      await walletsStore.initDefaultWallets();
      await categoriesStore.initDefaultCategories();
    }, 1500);
  }
  if (!authStore.isAuthenticated) {
    initialized = false;
  }
});
