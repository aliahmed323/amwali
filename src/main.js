import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Global error handler to prevent silent white screens
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Failed to fetch dynamically imported module')) {
    console.warn('Chunk load error, reloading page...');
    window.location.reload();
  } else {
    // Show error on screen for debugging if it causes a white screen
    const errDiv = document.createElement('div');
    errDiv.style = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:10px;direction:ltr;font-size:12px;word-break:break-all;';
    errDiv.innerText = `App Error: ${event.message} at ${event.filename}:${event.lineno}`;
    document.body.appendChild(errDiv);
  }
});

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
      
      // طلب إذن الإشعارات للمساهمات اليومية
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('أموالي 💰', {
              body: 'تم تفعيل الإشعارات اليومية للقاصات بنجاح',
              icon: '/amwali/icons/icon-192x192.png'
            });
          }
        });
      }
    }, 1500);
  }
  if (!authStore.isAuthenticated) {
    initialized = false;
  }
});
