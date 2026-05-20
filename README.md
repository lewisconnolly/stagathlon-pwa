# Stagathlon PWA

A weekend-long olympics-style tracker. Admin enters scores on their phone; everyone else views the leaderboard live.

See `docs/app.md` and `docs/fifa.md` for the original spec. See `CLAUDE.md` for the architecture overview.

## First-time setup

1. **Install deps**

   ```sh
   npm install
   ```

2. **Create a Firebase project**
   - Firebase Console → new project (or reuse one).
   - Build → Firestore Database → Create database → start in **test mode** (open rules; fine for a private stag weekend — see CLAUDE.md for the trade-off).
   - Project settings → Your apps → Web → register a new web app, copy the config object.

3. **Configure env**

   ```sh
   cp .env.example .env.local
   ```

   Fill in the `VITE_FIREBASE_*` values from the Firebase web-app config. Set `VITE_ADMIN_PIN` to whatever you want — anyone with this PIN can edit scores.

4. **Edit athlete + league setup**

   Open `scripts/seed.ts` and edit the `athletes`, `league1`, `league2` constants to match your real lineup.

5. **Seed Firestore**

   ```sh
   npm run seed
   ```

   Creates the `competition/main` doc with athletes + FIFA fixtures (round-robin pre-generated, scores blank).

6. **Run locally**

   ```sh
   npm run dev
   ```

   Open http://localhost:5173. Tap the 🔒 in the top-right and enter your PIN to unlock editing.

## Deploying

```sh
npm install -g firebase-tools     # once
firebase login                    # once
firebase init hosting             # once — pick your project, public dir = dist, SPA = yes
npm run build
firebase deploy --only hosting
```

The deployed URL is what athletes load on their phones.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check + production bundle into `dist/` |
| `npm run preview` | Serve the prod bundle locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest run (derivation logic) |
| `npm run test:watch` | Vitest watch mode |
| `npm run seed` | Seed `competition/main` (refuses if doc exists; pass `--force` to overwrite) |
