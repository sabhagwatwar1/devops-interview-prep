/**
 * =============================================================================
 * DevOps & SRE Master Vault - Firebase Database Configuration
 * =============================================================================
 * Enables real-time, global cloud syncing for the Community Doubt Solver & Forum.
 * When any engineer worldwide posts a question, upvotes, or replies, it syncs
 * instantly to everyone in real time with zero backend server maintenance.
 * =============================================================================
 */

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAKol-z8DCqN0UvwHWD4dcjiWoCKcvlgSM",
    authDomain: "devops-vault-d1ac9.firebaseapp.com",
    databaseURL: "https://devops-vault-d1ac9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "devops-vault-d1ac9",
    storageBucket: "devops-vault-d1ac9.firebasestorage.app",
    messagingSenderId: "394717548886",
    appId: "1:394717548886:web:5ae5bb288773aeb09586f7",
    measurementId: "G-NN1GLZM08V"
};

window.firebaseConfig = Object.assign({}, DEFAULT_FIREBASE_CONFIG);

// Check if custom config was saved via the website's in-app Cloud Connect modal
try {
    if (typeof localStorage !== 'undefined') {
        const savedCustomConfig = localStorage.getItem('cyber_firebase_custom_config');
        if (savedCustomConfig) {
            const parsed = JSON.parse(savedCustomConfig);
            if (parsed && parsed.projectId && parsed.apiKey) {
                window.firebaseConfig = Object.assign({}, DEFAULT_FIREBASE_CONFIG, parsed);
                if (!window.firebaseConfig.databaseURL || window.firebaseConfig.projectId === 'devops-vault-d1ac9') {
                    window.firebaseConfig.databaseURL = "https://devops-vault-d1ac9-default-rtdb.asia-southeast1.firebasedatabase.app";
                }
            }
        }
    }
} catch (e) {
    console.warn("Could not parse saved custom Firebase config:", e);
}

