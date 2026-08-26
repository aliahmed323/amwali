import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPa7kaWyLexSVkamJ6PcueUfOcyELB8iI",
  authDomain: "amwali-d40b7.firebaseapp.com",
  projectId: "amwali-d40b7",
  storageBucket: "amwali-d40b7.firebasestorage.app",
  messagingSenderId: "419117021180",
  appId: "1:419117021180:web:9cf23620abfbbc8864a479"
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);

export const HOUSEHOLD_ID = 'family';

export const getHouseholdRef = (collectionName) => {
  return collection(db, 'households', HOUSEHOLD_ID, collectionName);
};

export { app, db, auth };
