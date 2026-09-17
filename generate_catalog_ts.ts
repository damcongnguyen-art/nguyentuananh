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
      const data = docSnap.data().items;
      let tsContent = `export interface ProductMasterItem {
  id: string;
  code: string;
  modelName: string;
  speedPerHour: number;
  defaultLine: string;
}

export const initialProductCatalog: ProductMasterItem[] = ${data};
`;
      fs.writeFileSync('src/data/productCatalog.ts', tsContent);
      console.log('Successfully wrote src/data/productCatalog.ts');
    } else {
      console.log('No document found');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
fetchCatalog();
