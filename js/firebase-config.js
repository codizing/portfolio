// Firebase configuration for Abdelaziz Portfolio
const firebaseConfig = {
  apiKey: "AIzaSyD5eitP3x2kYvcJIuTiE0dkHGvVwaak2Fc",
  authDomain: "portfolio-dfb1b.firebaseapp.com",
  projectId: "portfolio-dfb1b",
  storageBucket: "portfolio-dfb1b.firebasestorage.app",
  messagingSenderId: "387216500569",
  appId: "1:387216500569:web:5e94b380c0c8d88264ce48"
};

// Export for ES modules and window fallback
if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = firebaseConfig;
}

export default firebaseConfig;
