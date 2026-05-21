import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { COMPETITION_DOC_PATH, db } from '../firebase';
import type {
  ChallengesEvent,
  Competition,
  FifaEvent,
  FifaFixture,
  FifaKnockoutScore,
  PoolEvent,
  TeamEvent
} from '../types';

type Status = 'loading' | 'ready' | 'missing' | 'error';

export interface CompetitionState {
  status: Status;
  data: Competition | null;
  error: string | null;
}

export const CompetitionContext = createContext<CompetitionState>({
  status: 'loading',
  data: null,
  error: null
});

export const useCompetition = (): CompetitionState => useContext(CompetitionContext);

export function useCompetitionSubscription(): CompetitionState {
  const [state, setState] = useState<CompetitionState>({
    status: 'loading',
    data: null,
    error: null
  });

  useEffect(() => {
    const ref = doc(db, COMPETITION_DOC_PATH[0], COMPETITION_DOC_PATH[1]);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setState({ status: 'missing', data: null, error: null });
          return;
        }
        setState({ status: 'ready', data: snap.data() as Competition, error: null });
      },
      (err) => {
        console.error('competition subscription error', err);
        setState({ status: 'error', data: null, error: err.message });
      }
    );
    return () => unsub();
  }, []);

  return useMemo(() => state, [state]);
}

function competitionRef() {
  return doc(db, COMPETITION_DOC_PATH[0], COMPETITION_DOC_PATH[1]);
}

export async function setFifa(state: FifaEvent): Promise<void> {
  await updateDoc(competitionRef(), { 'events.fifa': state });
}

export async function setPool(state: PoolEvent): Promise<void> {
  await updateDoc(competitionRef(), { 'events.pool': state });
}

export async function setFootgolf(state: TeamEvent): Promise<void> {
  await updateDoc(competitionRef(), { 'events.footgolf': state });
}

export async function setFrisbeegolf(state: TeamEvent): Promise<void> {
  await updateDoc(competitionRef(), { 'events.frisbeegolf': state });
}

export async function setAarticulate(state: TeamEvent): Promise<void> {
  await updateDoc(competitionRef(), { 'events.aarticulate': state });
}

export async function setChallenges(state: ChallengesEvent): Promise<void> {
  await updateDoc(competitionRef(), { 'events.challenges': state });
}

export async function setFifaFixtures(fixtures: FifaFixture[]): Promise<void> {
  await updateDoc(competitionRef(), { 'events.fifa.fixtures': fixtures });
}

export async function setFifaFinal(score: FifaKnockoutScore): Promise<void> {
  await updateDoc(competitionRef(), { 'events.fifa.final': score });
}

export async function setFifaThirdPlace(score: FifaKnockoutScore): Promise<void> {
  await updateDoc(competitionRef(), { 'events.fifa.thirdPlace': score });
}
