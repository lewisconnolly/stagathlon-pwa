import { setFrisbeegolf, useCompetition } from '../../lib/competition';
import { TeamEventPage } from '../../components/teams/TeamEventPage';

export function Frisbeegolf() {
  const { data } = useCompetition();
  if (!data) return null;
  return <TeamEventPage rawEvent={data.events.frisbeegolf} save={setFrisbeegolf} />;
}
