'use client';
import { useEffect, useMemo } from 'react';
import { useTrackingStore } from '@/src/features/tracking/store/trackingStore';

export type ControlTowerScenario =
  | 'default'
  | 'loading'
  | 'empty'
  | 'no-results'
  | 'error';
export type TripDetailScenario =
  | 'default'
  | 'loading'
  | 'partial'
  | 'error'
  | 'not-found';

const tripAliases: Record<string, string> = {
  'on-track': 'TRP-10047',
  'at-risk': 'TRP-10052',
  delayed: 'TRP-10085',
  'no-signal': 'TRP-10091',
  completed: 'TRP-10012',
};

export function usePrototypeRoute() {
  const params = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);
  const route = params.get('view');
  const rawScenario = params.get('state') ?? 'default';
  const tripAlias = params.get('trip');
  const isTrip =
    route === 'trip' ||
    Boolean(tripAlias) ||
    ['partial', 'not-found', 'trip-loading', 'trip-error'].includes(
      rawScenario,
    );
  const tripId = tripAlias ? (tripAliases[tripAlias] ?? tripAlias) : null;
  const setFullscreen = useTrackingStore((state) => state.setFullscreen);
  const selectTrip = useTrackingStore((state) => state.selectTrip);

  useEffect(() => {
    if (tripId) selectTrip(tripId, true);
    setFullscreen(params.get('fullscreen') === '1');
  }, [params, selectTrip, setFullscreen, tripId]);

  const controlScenario: ControlTowerScenario = [
    'loading',
    'empty',
    'no-results',
    'error',
  ].includes(rawScenario)
    ? (rawScenario as ControlTowerScenario)
    : 'default';
  const tripScenario: TripDetailScenario =
    rawScenario === 'trip-loading'
      ? 'loading'
      : rawScenario === 'trip-error'
        ? 'error'
        : ['partial', 'not-found'].includes(rawScenario)
          ? (rawScenario as TripDetailScenario)
          : 'default';
  return { isTrip, tripId, controlScenario, tripScenario };
}
