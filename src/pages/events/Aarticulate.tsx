import { setAarticulate, useCompetition } from '../../lib/competition';
import { TeamEventPage } from '../../components/teams/TeamEventPage';
import { Cards } from '../../components/cards/Cards';

export function Aarticulate() {
  const { data } = useCompetition();
  if (!data) return null;
  return (
    <TeamEventPage
      rawEvent={data.events.aarticulate}
      save={setAarticulate}
      extraSection={<Cards />}
    />
  );
}
