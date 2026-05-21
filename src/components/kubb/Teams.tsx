import type { Athlete, AthleteId, KubbEvent, KubbTeamIndex } from '../../types';
import { useAdminStore } from '../../store/admin';

interface Props {
  event: KubbEvent;
  athletes: Athlete[];
  onNameChange: (teamIdx: KubbTeamIndex, name: string) => void;
  onMemberChange: (teamIdx: KubbTeamIndex, memberIdx: number, athleteId: AthleteId | null) => void;
}

export function Teams({ event, athletes, onNameChange, onMemberChange }: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);

  const unavailable = new Set<AthleteId>(
    event.teams.flatMap((t) => t.members).filter((id): id is AthleteId => id !== null)
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {event.teams.map((team, i) => {
        const teamIdx = i as KubbTeamIndex;
        return (
          <TeamCard
            key={i}
            team={team}
            athletes={athletes}
            unavailable={unavailable}
            isAdmin={isAdmin}
            onNameChange={(name) => onNameChange(teamIdx, name)}
            onMemberChange={(memberIdx, athleteId) => onMemberChange(teamIdx, memberIdx, athleteId)}
          />
        );
      })}
    </div>
  );
}

function TeamCard({
  team,
  athletes,
  unavailable,
  isAdmin,
  onNameChange,
  onMemberChange
}: {
  team: KubbEvent['teams'][number];
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  isAdmin: boolean;
  onNameChange: (name: string) => void;
  onMemberChange: (memberIdx: number, athleteId: AthleteId | null) => void;
}) {
  const nameOf = (id: AthleteId) => athletes.find((a) => a.id === id)?.name ?? id;

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-3 py-2">
        {isAdmin ? (
          <input
            type="text"
            value={team.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold uppercase tracking-wide text-ink focus:outline-none"
          />
        ) : (
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{team.name}</h3>
        )}
      </header>
      <table className="w-full text-sm">
        <tbody>
          {team.members.map((memberId, memberIdx) => (
            <tr key={memberIdx} className="border-t border-line first:border-t-0">
              <td className="px-3 py-1.5">
                {isAdmin ? (
                  <select
                    value={memberId ?? ''}
                    onChange={(e) =>
                      onMemberChange(
                        memberIdx,
                        e.target.value === '' ? null : (e.target.value as AthleteId)
                      )
                    }
                    className={[
                      'w-full cursor-pointer rounded-md border border-line bg-white px-2 py-1 text-sm font-medium shadow-sm focus:border-ink focus:outline-none',
                      memberId ? '' : 'italic text-slate-400'
                    ].join(' ')}
                  >
                    <option value="">+ Add player</option>
                    {athletes.map((a) => {
                      const taken = unavailable.has(a.id) && a.id !== memberId;
                      return (
                        <option key={a.id} value={a.id} disabled={taken}>
                          {a.name}
                          {taken ? ' (in other team)' : ''}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <span
                    className={[
                      'text-sm font-medium',
                      memberId ? '' : 'italic text-slate-400'
                    ].join(' ')}
                  >
                    {memberId ? nameOf(memberId) : '—'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
