import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let auth = null;
let analytics = null;

if (firebaseConfig.apiKey) {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
} else {
  console.warn("Firebase API Key is missing. Firebase features will be disabled.");
}

// Optionally initialize Analytics if needed and in browser environment
if (app && typeof window !== 'undefined' && firebaseConfig.measurementId) {
    import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
        isSupported().then(yes => {
            if (yes) analytics = getAnalytics(app);
        });
    }).catch(err => console.error("Firebase analytics error:", err));
}

export { auth, app, analytics };
