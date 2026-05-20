import { useMemo } from 'react';
import { setPool, useCompetition } from '../../lib/competition';
import { ensurePoolShape, poolContributions } from '../../lib/derive';
import { setBye, setMatchWinner, setQfSlot } from '../../lib/pool-mutations';
import { Bracket } from '../../components/pool/Bracket';
import { PoolFixtures } from '../../components/pool/PoolFixtures';
import { LeaderboardPtsTable } from '../../components/LeaderboardPtsTable';
import type { AthleteId, Side } from '../../types';

export function Pool() {
  const { status, data } = useCompetition();

  const pool = useMemo(() => (data ? ensurePoolShape(data.events.pool) : null), [data]);
  const contributions = useMemo(
    () => (data && pool ? poolContributions(data.athletes, pool) : null),
    [data, pool]
  );

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading…</p>;
  }
  if (!data || !contributions || !pool) return null;

  const onQfSlot = (qf: 'qf1' | 'qf2' | 'qf3', side: Side, id: AthleteId | null) => {
    void setPool(setQfSlot(pool, qf, side, id));
  };
  const onBye = (id: AthleteId | null) => {
    void setPool(setBye(pool, id));
  };
  const onWinner = (
    match: 'qf1' | 'qf2' | 'qf3' | 'sf1' | 'sf2' | 'final' | 'thirdPlace',
    side: Side | null
  ) => {
    void setPool(setMatchWinner(pool, match, side));
  };

  return (
    <div className="space-y-5">
      <LeaderboardPtsTable athletes={data.athletes} contributions={contributions} />
      <Bracket
        pool={pool}
        athletes={data.athletes}
        onQfSlot={onQfSlot}
        onBye={onBye}
        onWinner={onWinner}
      />
      <PoolFixtures pool={pool} athletes={data.athletes} onWinner={onWinner} />
    </div>
  );
}
