# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Stagathlon is a PWA for tracking a weekend-long olympics-style competition. Source specs live in `docs/app.md` and `docs/fifa.md`; UI mockups in `docs/images/`. Six events are referenced (`fifa`, `pool`, `footgolf`, `frisbeegolf`, `aarticulate`, `challenges`) — only FIFA is implemented end-to-end. The other five have spec files that don't exist yet and render as "Coming soon" placeholders; their leaderboard columns are present but always zero.

## Commands

```sh
npm run dev         # Vite dev server (http://localhost:5173)
npm run build       # tsc -b && vite build
npm run preview     # serve dist/
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run test:watch
npm run seed        # seed competition/main in Firestore (refuses if doc exists; --force to overwrite)
```

Single-test run: `npx vitest run path/to/file.test.ts` or `npx vitest run -t "name fragment"`.

First-time setup (Firebase project, `.env.local`, seed, hosting) is in `README.md`.

## Architecture

**Sync model.** One admin enters scores on their phone; everyone else opens the URL and watches the leaderboard update live. Realtime sync runs through Firestore. There is no Auth and no Cloud Functions.

**Single Firestore doc.** All competition state lives in one document at `competition/main` with shape `{ athletes, events: { fifa, pool, footgolf, ... } }` (see `src/types.ts`). The app subscribes once via `onSnapshot` in `useCompetitionSubscription` (`src/lib/competition.ts`), publishes the result through `CompetitionContext`, and every page reads from context. Writes go through `setFifaFixtures` / `setFifaFinal` / `setFifaThirdPlace` helpers in the same file using `updateDoc` with dotted field paths. Don't subscribe again from individual pages — go through context.

**Stored vs derived.** Only raw inputs are stored in Firestore: fixture scores, knockout scores, athletes, league assignments. Everything else — league tables, knockout pairings, FIFA points, leaderboard totals — is recomputed every render by pure functions in `src/lib/derive/`. Do not persist derived values. This invariant is what makes "fixture with one blank goal doesn't affect anything" trivially true: blank fixtures are simply filtered out of the derivation. The derivation functions are the only place worth unit-testing; UI components are not currently tested.

**Tiebreak handling.** `leagueTable()` sorts pts → GD → GF. If two adjacent rows tie on all three *and* at least one has played a game, both are flagged `tiebreakNeeded: true`. The UI surfaces a yellow banner ("Thumb War, then adjust GF"). `knockoutPairings()` returns `{ final: null, thirdPlace: null }` when the 1st-place row in either league has the tiebreak flag — the UI then shows "Awaiting league results" on the knockout cards. There is no in-app manual tiebreak entry yet.

**Knockout draws.** A final/3rd-place score with `homeGoals === awayGoals` is treated as undecided (`fifaPoints` returns zeros until one side has more). Whoever's entering scores is expected to record the post-penalty/post-Thumb-War result, not the regulation draw.

**Admin gate.** `VITE_ADMIN_PIN` is hardcoded at build time. The Zustand store at `src/store/admin.ts` persists `isAdmin` to localStorage under key `stagathlon-admin`. Every input component reads `useAdminStore` directly and disables itself when `!isAdmin`. Firestore writes are not gated server-side — anyone who finds the deployed URL could technically write. This is the explicitly-accepted trade-off for a small private deployment; do not "fix" it by adding Auth without checking with the user.

**PWA.** `vite-plugin-pwa` (autoUpdate, default Workbox). Manifest in `vite.config.ts` uses the SVG favicon for all icon sizes. Firestore requests are excluded from precache via `navigateFallbackDenylist`. There is no offline write support — the admin needs connectivity.

## Adding a new event

1. Add an entry to `EVENTS` in `src/lib/config.ts` (or change the existing placeholder's `status` to `'live'` and fill in `instructions`).
2. Add the event's data shape under `CompetitionEvents` in `src/types.ts`, replacing `PlaceholderEvent`.
3. Add a derivation function in `src/lib/derive/<event>.ts` returning `Map<AthleteId, number>` of event points. Write tests first — they're the only safety net.
4. Wire the points map into `leaderboard()` in `src/lib/derive/leaderboard.ts` (currently only FIFA contributes).
5. Build the page at `src/pages/events/<Event>.tsx` and add a route in `src/routes.tsx` (above the `:eventId` catch-all).
6. Update `scripts/seed.ts` to initialize the new event's state for fresh competitions.

## Things to know before changing code

- **TypeScript strict + noUnused\*.** The build fails on unused locals/params. Underscore-prefix params you intentionally ignore.
- **Tailwind v3, not v4.** `tailwind.config.ts` exists and is consulted; don't migrate to v4 without confirming.
- **`src/lib/config.ts` is imported by both the client and `scripts/seed.ts`.** Don't introduce browser-only imports there.
- **Custom colors.** `ink` / `sub` / `line` are defined in `tailwind.config.ts`; prefer them over raw slate values for consistency.

## Out of scope (don't add without asking)

- Auth, Firestore security rules, Cloud Functions.
- Offline writes / conflict resolution.
- Editing the roster or league assignments from the UI (do it via `scripts/seed.ts`).
- In-app manual tiebreak entry beyond the existing yellow banner.
- The five non-FIFA events — their specs don't exist.
