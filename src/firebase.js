import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCDruC3puBO9d_3VVs7uPKXR2rv6gq-_zc",
    authDomain: "ss-chatroom-111034011.firebaseapp.com",
    projectId: "ss-chatroom-111034011",
    storageBucket: "ss-chatroom-111034011.firebasestorage.app",
    messagingSenderId: "453359494681",
    appId: "1:453359494681:web:a932006b44611b56adec88",
    measurementId: "G-C20WV698PL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, googleProvider, db, storage };
export const rtdb = getDatabase(app);
