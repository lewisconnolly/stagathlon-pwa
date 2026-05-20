import { useMemo } from 'react';
import {
  useCompetition,
  setFifa,
  setFifaFinal,
  setFifaFixtures,
  setFifaThirdPlace
} from '../../lib/competition';
import { fifaContributions, knockoutPairings, leagueTable, regenerateFixtures } from '../../lib/derive';
import { LeagueTable } from '../../components/LeagueTable';
import { KnockoutCard } from '../../components/KnockoutCard';
import { FixtureRow } from '../../components/FixtureRow';
import { LeaderboardPtsTable } from '../../components/LeaderboardPtsTable';
import type { AthleteId, FifaFixture, LeagueSlot } from '../../types';

export function Fifa() {
  const { status, data } = useCompetition();

  const derived = useMemo(() => {
    if (!data) return null;
    const fifa = data.events.fifa;
    return {
      l1Rows: leagueTable(data.athletes, fifa.fixtures, fifa.league1),
      l2Rows: leagueTable(data.athletes, fifa.fixtures, fifa.league2),
      pairings: knockoutPairings(fifa.league1, fifa.league2, fifa.fixtures),
      contributions: fifaContributions(data.athletes, fifa)
    };
  }, [data]);

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading…</p>;
  }
  if (!data || !derived) return null;

  const fifa = data.events.fifa;
  const allTaken = new Set<AthleteId>(
    [...fifa.league1, ...fifa.league2].filter((s): s is AthleteId => s !== null)
  );

  const updateFixture = (next: FifaFixture) => {
    const fixtures = fifa.fixtures.map((f) => (f.id === next.id ? next : f));
    void setFifaFixtures(fixtures);
  };

  const moveFixture = (id: string, direction: 'up' | 'down') => {
    const idx = fifa.fixtures.findIndex((f) => f.id === id);
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (idx === -1 || target < 0 || target >= fifa.fixtures.length) return;
    const next = [...fifa.fixtures];
    [next[idx], next[target]] = [next[target], next[idx]];
    void setFifaFixtures(next);
  };

  const setLeagueSlot = (league: 1 | 2, slotIdx: number, newId: AthleteId | null) => {
    const l1: LeagueSlot[] = [...fifa.league1];
    const l2: LeagueSlot[] = [...fifa.league2];
    if (league === 1) l1[slotIdx] = newId;
    else l2[slotIdx] = newId;
    const fixtures = regenerateFixtures(l1, l2, fifa.fixtures);
    void setFifa({
      league1: l1,
      league2: l2,
      fixtures,
      final: { homeGoals: null, awayGoals: null, wonOnPens: null },
      thirdPlace: { homeGoals: null, awayGoals: null, wonOnPens: null }
    });
  };

  return (
    <div className="space-y-5">
      <LeaderboardPtsTable athletes={data.athletes} contributions={derived.contributions} />

      <KnockoutCard
        title="FINAL"
        pairing={derived.pairings.final}
        score={fifa.final}
        athletes={data.athletes}
        onChange={(s) => void setFifaFinal(s)}
        awaitingMessage="Awaiting league results."
      />

      <KnockoutCard
        title="THIRD PLACE PLAY-OFF"
        pairing={derived.pairings.thirdPlace}
        score={fifa.thirdPlace}
        athletes={data.athletes}
        onChange={(s) => void setFifaThirdPlace(s)}
        awaitingMessage="Awaiting league results."
      />

      <LeagueTable
        title="LEAGUE 1"
        slots={fifa.league1}
        rows={derived.l1Rows}
        athletes={data.athletes}
        unavailable={allTaken}
        onSlotChange={(idx, id) => setLeagueSlot(1, idx, id)}
      />
      <LeagueTable
        title="LEAGUE 2"
        slots={fifa.league2}
        rows={derived.l2Rows}
        athletes={data.athletes}
        unavailable={allTaken}
        onSlotChange={(idx, id) => setLeagueSlot(2, idx, id)}
      />

      <section className="rounded-2xl border border-line bg-white shadow-sm">
        <header className="border-b border-line px-4 py-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">FIXTURES</h3>
        </header>
        {fifa.fixtures.length === 0 ? (
          <p className="px-4 py-4 text-sm italic text-sub">
            No fixtures yet — assign players to both leagues above.
          </p>
        ) : (
          <div>
            {fifa.fixtures.map((fx, i) => (
              <FixtureRow
                key={fx.id}
                fixture={fx}
                athletes={data.athletes}
                onChange={updateFixture}
                onMove={(dir) => moveFixture(fx.id, dir)}
                canMoveUp={i > 0}
                canMoveDown={i < fifa.fixtures.length - 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
