import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { generateRoundRobin } from '../src/lib/config';
import type { Competition } from '../src/types';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.projectId) {
  console.error('Missing VITE_FIREBASE_PROJECT_ID. Set .env.local first.');
  process.exit(1);
}

// === EDIT THESE BEFORE RUNNING ===
const athletes = [
  { id: 'aaron', name: 'Aaron' },
  { id: 'andy', name: 'Andy' },
  { id: 'jack', name: 'Jack' },
  { id: 'kris', name: 'Kris' },
  { id: 'lewis', name: 'Lewis' },
  { id: 'mike', name: 'Mike' },
  { id: 'shaun', name: 'Shaun' }
];
const league1 = ['andy', 'lewis', 'shaun'];
const league2 = ['jack', 'kris', 'mike', 'aaron'];
// =================================

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const ref = doc(db, 'competition', 'main');

  const existing = await getDoc(ref);
  if (existing.exists() && process.argv[2] !== '--force') {
    console.error('competition/main already exists. Re-run with --force to overwrite.');
    process.exit(1);
  }

  const initial: Competition = {
    athletes,
    events: {
      fifa: {
        league1,
        league2,
        fixtures: [
          ...generateRoundRobin(1, league1),
          ...generateRoundRobin(2, league2)
        ].map((f) => ({ ...f, homeGoals: null, awayGoals: null })),
        final: { homeGoals: null, awayGoals: null },
        thirdPlace: { homeGoals: null, awayGoals: null }
      },
      pool: { placeholder: true },
      footgolf: { placeholder: true },
      frisbeegolf: { placeholder: true },
      aarticulate: { placeholder: true },
      challenges: { placeholder: true }
    }
  };

  await setDoc(ref, initial);
  console.log(`Seeded competition/main with ${athletes.length} athletes and ${initial.events.fifa.fixtures.length} FIFA fixtures.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
