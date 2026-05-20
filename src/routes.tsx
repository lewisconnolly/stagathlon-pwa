import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { Leaderboard } from './pages/Leaderboard';
import { EventsIndex } from './pages/EventsIndex';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Leaderboard /> },
      { path: 'events', element: <EventsIndex /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
