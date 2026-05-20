import { setFootgolf, useCompetition } from '../../lib/competition';
import { TeamEventPage } from '../../components/teams/TeamEventPage';

export function Footgolf() {
  const { data } = useCompetition();
  if (!data) return null;
  return <TeamEventPage rawEvent={data.events.footgolf} save={setFootgolf} />;
}
