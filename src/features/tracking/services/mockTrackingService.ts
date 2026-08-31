import type { GPSPositionUpdatedEvent, TrackingService, TrackingSnapshot, Trip } from '../types';
import { alerts, drivers, metrics, tenants, trips, vehicles } from './mockData';

const wait = (ms = 220) => new Promise(resolve => setTimeout(resolve, ms));
const copyTrip = (trip: Trip): Trip => structuredClone(trip);

export const mockTrackingService: TrackingService = {
  async getTenants() { await wait(80); return structuredClone(tenants); },
  async getTrackingSnapshot(tenantId): Promise<TrackingSnapshot> {
    await wait();
    const tenant = tenants.find(item => item.id === tenantId) ?? tenants[0];
    const tenantTrips = trips.filter(trip => trip.tenantId === tenant.id);
    return {tenant,metrics:tenant.id === 'northfreight' ? metrics : {total:0,onTrack:0,atRisk:0,delayed:0,exceptions:0,onTimePerformance:0},trips:tenantTrips.map(copyTrip),alerts:alerts.filter(alert => tenantTrips.some(trip => trip.id === alert.tripId)),drivers:structuredClone(drivers),vehicles:structuredClone(vehicles),updatedAt:new Date().toISOString()};
  },
  async getTrip(tripId) { await wait(160); const trip = trips.find(item => item.id === tripId); return trip ? copyTrip(trip) : null; },
  subscribeToPositions(tenantId, listener) {
    let tick = 0;
    const timer = window.setInterval(() => {
      const active = trips.filter(trip => trip.tenantId === tenantId && !['offline','completed'].includes(trip.status));
      const trip = active[tick % active.length];
      tick += 1;
      if (!trip) return;
      const nextIndex = Math.min(trip.route.length - 1, Math.max(1, Math.round((trip.progressPct / 100) * (trip.route.length - 1))));
      const target = trip.route[nextIndex];
      const event: GPSPositionUpdatedEvent = {type:'GPS_POSITION_UPDATED',payload:{tripId:trip.id,position:{lat:target.lat + tick * .00004,lng:target.lng + tick * .00004},speedKph:trip.speedKph ?? 0,heading:trip.heading ?? 0,timestamp:new Date().toISOString()}};
      listener(event);
    }, 4000);
    return () => window.clearInterval(timer);
  },
};
