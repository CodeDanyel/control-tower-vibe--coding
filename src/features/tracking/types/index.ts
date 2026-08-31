export type TripStatus = 'on_track' | 'at_risk' | 'delayed' | 'offline' | 'completed';
export type AlertType = 'route_deviation' | 'eta_breach' | 'prolonged_stop' | 'speeding' | 'signal_lost' | 'traffic_delay';
export type Severity = 'low' | 'medium' | 'high';
export type RouteSegmentKind = 'completed' | 'planned' | 'risk' | 'deviation';

export interface Tenant { id: string; name: string }
export interface GeoPoint { lat: number; lng: number }
export interface Driver { id: string; name: string; phone: string }
export interface Vehicle { id: string; plateNumber: string; type: string; trailer: string }
export interface Stop { id: string; name: string; address: string; position: GeoPoint; plannedAt: string; completedAt?: string }
export interface DocumentRecord { id: string; name: string; filename: string }
export interface RouteSegment { id: string; kind: RouteSegmentKind; points: GeoPoint[] }

export interface Trip {
  id: string;
  tenantId: string;
  orderId: string;
  status: TripStatus;
  statusSince: string | null;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  route: GeoPoint[];
  routeSegments: RouteSegment[];
  originGeofence: GeoPoint;
  destinationGeofence: GeoPoint;
  plannedEta: string;
  currentEta: string;
  actualArrival?: string;
  destinationWindow: { start: string; end: string };
  progressPct: number;
  lastGpsAt: string | null;
  etaVarianceMinutes: number;
  currentPosition: GeoPoint;
  currentLocation: string;
  speedKph: number | null;
  heading: number | null;
  distanceRemainingMiles: number;
  distanceTraveledMiles: number;
  routeAdherencePct: number;
  totalDurationMinutes: number;
  statusReason?: string;
  nextStopId?: string;
  stops: Stop[];
  documents: DocumentRecord[];
}

export interface GPSPing { tripId: string; position: GeoPoint; speedKph: number; heading: number; timestamp: string }
export interface Alert { id: string; tripId: string; type: AlertType; severity: Severity; message: string; location: string; raisedAt: string; durationMinutes: number; etaImpactMinutes: number }
export interface TrackingMetrics { total: number; onTrack: number; atRisk: number; delayed: number; exceptions: number; onTimePerformance: number }
export interface TrackingSnapshot { tenant: Tenant; metrics: TrackingMetrics; trips: Trip[]; alerts: Alert[]; drivers: Driver[]; vehicles: Vehicle[]; updatedAt: string }
export interface GPSPositionUpdatedEvent { type: 'GPS_POSITION_UPDATED'; payload: GPSPing }

export interface TrackingService {
  getTenants(): Promise<Tenant[]>;
  getTrackingSnapshot(tenantId: string): Promise<TrackingSnapshot>;
  getTrip(tripId: string): Promise<Trip | null>;
  subscribeToPositions(tenantId: string, listener: (event: GPSPositionUpdatedEvent) => void): () => void;
}
