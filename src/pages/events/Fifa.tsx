import { useMemo } from 'react';
import { useCompetition, setFifaFinal, setFifaFixtures, setFifaThirdPlace } from '../../lib/competition';
import { knockoutPairings, leagueTable } from '../../lib/derive';
import { LeagueTable } from '../../components/LeagueTable';
import { KnockoutCard } from '../../components/KnockoutCard';
import { FixtureRow } from '../../components/FixtureRow';
import type { FifaFixture } from '../../types';

export function Fifa() {
  const { status, data } = useCompetition();

  const derived = useMemo(() => {
    if (!data) return null;
    const fifa = data.events.fifa;
    return {
      l1: leagueTable(data.athletes, fifa.fixtures, fifa.league1),
      l2: leagueTable(data.athletes, fifa.fixtures, fifa.league2),
      pairings: knockoutPairings(fifa.league1, fifa.league2, fifa.fixtures)
    };
  }, [data]);

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading…</p>;
  }
  if (!data || !derived) return null;

  const fifa = data.events.fifa;

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

  return (
    <div className="space-y-5">
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

      <LeagueTable title="LEAGUE 1" rows={derived.l1} athletes={data.athletes} />
      <LeagueTable title="LEAGUE 2" rows={derived.l2} athletes={data.athletes} />

      <section className="rounded-2xl border border-line bg-white shadow-sm">
        <header className="border-b border-line px-4 py-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">FIXTURES</h3>
        </header>
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
      </section>
    </div>
  );
}
