import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { LEAGUE_SIZES } from '../src/lib/config';
import type { Competition, LeagueSlot, TeamEvent } from '../src/types';

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

// === EDIT THIS BEFORE RUNNING ===
// Leagues are configured in-app by the admin once the site is live; only the
// athlete roster is seeded here.
const athletes = [
  { id: 'aaron', name: 'Aaron' },
  { id: 'andy', name: 'Andy' },
  { id: 'jack', name: 'Jack' },
  { id: 'kris', name: 'Kris' },
  { id: 'lewis', name: 'Lewis' },
  { id: 'mike', name: 'Mike' },
  { id: 'shaun', name: 'Shaun' }
];
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

  const emptySlots = (count: number): LeagueSlot[] => Array<LeagueSlot>(count).fill(null);

  const emptyTeamEvent = (): TeamEvent => ({
    teams: [
      { name: 'Team 1', members: [null, null, null] },
      { name: 'Team 2', members: [null, null] },
      { name: 'Team 3', members: [null, null] }
    ],
    standings: { first: null, second: null, third: null }
  });

  const initial: Competition = {
    athletes,
    events: {
      fifa: {
        league1: emptySlots(LEAGUE_SIZES[1]),
        league2: emptySlots(LEAGUE_SIZES[2]),
        fixtures: [],
        final: { homeGoals: null, awayGoals: null, wonOnPens: null },
        thirdPlace: { homeGoals: null, awayGoals: null, wonOnPens: null }
      },
      pool: {
        qf1: { home: null, away: null, winner: null },
        qf2: { home: null, away: null, winner: null },
        qf3: { home: null, away: null, winner: null },
        byePlayer: null,
        sf1Winner: null,
        sf2Winner: null,
        finalWinner: null,
        thirdPlaceWinner: null
      },
      footgolf: emptyTeamEvent(),
      frisbeegolf: emptyTeamEvent(),
      aarticulate: { placeholder: true },
      challenges: { placeholder: true }
    }
  };

  await setDoc(ref, initial);
  console.log(
    `Seeded competition/main with ${athletes.length} athletes; leagues empty (configure in-app).`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
