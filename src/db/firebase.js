import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqkj28UINmCs87k42ElAxSxsNgdb_cOCs",
  authDomain: "pb-imprenta.firebaseapp.com",
  projectId: "pb-imprenta",
  storageBucket: "pb-imprenta.firebasestorage.app",
  messagingSenderId: "609365487025",
  appId: "1:609365487025:web:4a15ac358006b8a32a6190",
  measurementId: "G-XGJM9PSRGN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
