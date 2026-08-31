'use client';
import { AppProviders } from '@/src/app/providers/AppProviders';
import { AppShell } from '@/src/features/tracking/components/AppShell';
import { ControlTower } from '@/src/features/tracking/components/ControlTower';
import { TripDetail } from '@/src/features/tracking/components/TripDetail';
import { useTrackingStore } from '@/src/features/tracking/store/trackingStore';
import { usePrototypeRoute } from '@/src/app/routing/usePrototypeRoute';

function TrackingPortal() {
  const view = useTrackingStore((state) => state.view);
  const route = usePrototypeRoute();
  const showTrip = route.isTrip || view === 'trip-detail';
  return (
    <AppShell viewOverride={showTrip ? 'trip-detail' : 'control-tower'}>
      {showTrip ? (
        <TripDetail
          scenario={route.tripScenario}
          tripIdOverride={route.tripId}
        />
      ) : (
        <ControlTower scenario={route.controlScenario} />
      )}
    </AppShell>
  );
}
export default function Home() {
  return (
    <AppProviders>
      <TrackingPortal />
    </AppProviders>
  );
}
