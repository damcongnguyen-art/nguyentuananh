import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fetchCatalog() {
  try {
    const docRef = doc(db, 'settings', 'product_catalog');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('---DATA_START---');
      console.log(docSnap.data().items);
      console.log('---DATA_END---');
    } else {
      console.log('No document found');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
fetchCatalog();
