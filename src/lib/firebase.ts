import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    // Attempt to read a dummy doc to test connection
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    console.log("Firebase connection established");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Please check your configuration.");
    } else {
      console.log("Connection test finished (doc likely doesn't exist, which is fine)");
    }
  }
}

testConnection();
