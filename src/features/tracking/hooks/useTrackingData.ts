import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { trackingService } from '../services';
import { useTrackingStore } from '../store/trackingStore';
import type { TrackingSnapshot } from '../types';

export function useTrackingData() {
  const tenantId = useTrackingStore(state => state.selectedTenantId);
  const client = useQueryClient();
  const query = useQuery({queryKey:['tracking',tenantId],queryFn:()=>trackingService.getTrackingSnapshot(tenantId)});
  useEffect(() => trackingService.subscribeToPositions(tenantId, event => {
    client.setQueryData<TrackingSnapshot>(['tracking',tenantId], previous => {
      if (!previous) return previous;
      return {...previous,updatedAt:event.payload.timestamp,trips:previous.trips.map(trip=>trip.id===event.payload.tripId?{...trip,currentPosition:event.payload.position,speedKph:event.payload.speedKph,heading:event.payload.heading,lastGpsAt:event.payload.timestamp,progressPct:Math.min(99,trip.progressPct+.2)}:trip)};
    });
  }), [client,tenantId]);
  return query;
}

export function useTripData(tripId:string|null) {
  return useQuery({queryKey:['trip',tripId],queryFn:()=>trackingService.getTrip(tripId!),enabled:Boolean(tripId)});
}
