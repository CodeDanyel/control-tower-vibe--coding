'use client';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/maplibre';
import {
  Check,
  CircleAlert,
  Maximize2,
  RadioTower,
  Truck,
  X,
} from 'lucide-react';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import type { Trip, TripStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatTime } from '@/src/shared/utils/format';
import { COPY } from '@/src/shared/constants/copy';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapStyle = {
  version: 8 as const,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: { 'background-color': '#edf2ee' },
    },
  ],
};
const markerStyle: Record<TripStatus, string> = {
  on_track: 'bg-status-green',
  at_risk: 'bg-status-amber',
  delayed: 'bg-status-red',
  offline: 'bg-status-gray',
  completed: 'bg-status-green',
};
const MarkerIcon = ({ status }: { status: TripStatus }) =>
  status === 'completed' ? (
    <Check className="size-3.5" />
  ) : status === 'offline' ? (
    <RadioTower className="size-3.5" />
  ) : status === 'at_risk' || status === 'delayed' ? (
    <CircleAlert className="size-3.5" />
  ) : (
    <Truck className="size-3.5" />
  );

function segmentData(trips: Trip[]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: trips.flatMap((trip) =>
      trip.routeSegments.map(
        (segment) =>
          ({
            type: 'Feature',
            properties: { kind: segment.kind, tripId: trip.id },
            geometry: {
              type: 'LineString',
              coordinates: segment.points.map((point) => [
                point.lng,
                point.lat,
              ]),
            },
          }) as Feature<LineString>,
      ),
    ),
  };
}

export const TrackingMap = memo(function TrackingMap({
  trips,
  selectedTripId,
  hoveredTripId,
  onSelect,
  onHover,
  onOpenTrip,
  fullscreen,
  onFullscreen,
}: {
  trips: Trip[];
  selectedTripId: string | null;
  hoveredTripId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onOpenTrip: (id: string) => void;
  fullscreen: boolean;
  onFullscreen: () => void;
}) {
  const ref = useRef<MapRef>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const selected = trips.find((t) => t.id === selectedTripId);
  const data = useMemo(() => segmentData(trips), [trips]);
  const clusterTrips = trips.filter(
    (t) =>
      t.currentPosition.lng > -97.2 &&
      t.currentPosition.lng < -95.5 &&
      t.currentPosition.lat > 29.4 &&
      t.currentPosition.lat < 33,
  );
  const showCluster = !expanded && trips.length > 4;
  const choose = useCallback(
    (trip: Trip) => {
      onSelect(trip.id);
      ref.current?.flyTo({
        center: [trip.currentPosition.lng, trip.currentPosition.lat],
        zoom: 7.2,
        duration: 700,
      });
    },
    [onSelect],
  );
  return (
    <div
      className="relative size-full overflow-hidden bg-[#edf2ee]"
      aria-label="Texas live trip map"
    >
      <Map
        ref={ref}
        initialViewState={{ longitude: -96.5, latitude: 31.2, zoom: 5.7 }}
        mapStyle={mapStyle}
        attributionControl={false}
        reuseMaps
      >
        <Source id="routes" type="geojson" data={data}>
          <Layer
            id="planned"
            type="line"
            filter={['==', ['get', 'kind'], 'planned']}
            paint={{
              'line-color': '#7d8793',
              'line-width': 3,
              'line-dasharray': [2, 2],
            }}
          />
          <Layer
            id="completed"
            type="line"
            filter={['==', ['get', 'kind'], 'completed']}
            paint={{ 'line-color': '#1f9d55', 'line-width': 4 }}
          />
          <Layer
            id="risk"
            type="line"
            filter={['==', ['get', 'kind'], 'risk']}
            paint={{ 'line-color': '#d98a00', 'line-width': 4 }}
          />
          <Layer
            id="deviation"
            type="line"
            filter={['==', ['get', 'kind'], 'deviation']}
            paint={{ 'line-color': '#d92d20', 'line-width': 4 }}
          />
        </Source>
        {showCluster ? (
          <Marker longitude={-96.45} latitude={31.4} anchor="center">
            <button
              onClick={() => {
                setExpanded(true);
                ref.current?.flyTo({
                  center: [-96.45, 31.4],
                  zoom: 6.8,
                  duration: 700,
                });
              }}
              onMouseEnter={() => setTooltip('cluster')}
              onMouseLeave={() => setTooltip(null)}
              className="grid size-11 place-items-center rounded-full border-4 border-white bg-charcoal text-sm font-bold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              aria-label={`${clusterTrips.length} trips in this area. Expand cluster`}
            >
              {clusterTrips.length}
            </button>
          </Marker>
        ) : (
          trips.map((trip) => (
            <Marker
              key={trip.id}
              longitude={trip.currentPosition.lng}
              latitude={trip.currentPosition.lat}
              anchor="center"
            >
              <button
                onClick={() => choose(trip)}
                onMouseEnter={() => {
                  onHover(trip.id);
                  setTooltip(trip.id);
                }}
                onMouseLeave={() => {
                  onHover(null);
                  setTooltip(null);
                }}
                className={`relative grid size-8 place-items-center rounded-full border-[3px] border-white text-white shadow-md transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${markerStyle[trip.status]} ${selectedTripId === trip.id ? 'selected-marker' : ''} ${hoveredTripId === trip.id ? 'scale-125 ring-4 ring-slate-900/15' : ''} ${trip.status === 'offline' ? 'selected-marker-offline' : ''}`}
                aria-label={`Select ${trip.id}`}
              >
                <MarkerIcon status={trip.status} />
              </button>
            </Marker>
          ))
        )}
        <NavigationControl position="bottom-right" showCompass={false} />
      </Map>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(25deg,transparent_48%,rgba(160,170,155,.18)_49%,transparent_50%),linear-gradient(115deg,transparent_48%,rgba(160,175,180,.13)_49%,transparent_50%)] bg-[size:180px_120px]" />
      <div className="pointer-events-none absolute left-[8%] top-[16%] text-xs font-bold tracking-[.16em] text-slate-500">
        NORTH TEXAS
      </div>
      <div className="pointer-events-none absolute left-[48%] top-[45%] text-sm font-bold tracking-[.18em] text-slate-500">
        TEXAS
      </div>
      <div className="pointer-events-none absolute bottom-[16%] right-[10%] text-xs font-bold tracking-[.16em] text-slate-500">
        GULF COAST
      </div>
      <button
        onClick={onFullscreen}
        className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-lg border border-border bg-white text-charcoal shadow-sm focus-visible:outline-2 focus-visible:outline-brand"
        aria-label={fullscreen ? 'Exit fullscreen map' : 'Open fullscreen map'}
      >
        {fullscreen ? (
          <X className="size-4" />
        ) : (
          <Maximize2 className="size-4" />
        )}
      </button>
      {tooltip === 'cluster' && (
        <div className="absolute left-1/2 top-1/3 z-20 w-48 -translate-x-1/2 rounded-xl border border-border bg-white p-3 text-xs shadow-xl">
          <strong>{clusterTrips.length} trips in this area</strong>
          <p className="mt-2 text-muted">
            2 On Track · 1 At Risk · 1 Delayed · 1 No Signal
          </p>
        </div>
      )}
      {tooltip &&
        tooltip !== 'cluster' &&
        (() => {
          const trip = trips.find((t) => t.id === tooltip);
          if (!trip) return null;
          return (
            <div className="absolute left-1/2 top-1/4 z-20 w-60 -translate-x-1/2 rounded-xl border border-border bg-white p-3 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm">{trip.id}</strong>
                <StatusBadge
                  status={trip.status}
                  statusSince={trip.statusSince}
                  compact
                />
              </div>
              <dl className="mt-3 grid grid-cols-[70px_1fr] gap-y-1 text-xs">
                <dt className="text-muted">Driver</dt>
                <dd>
                  {trip.driverId === 'd1' ? 'Mike Johnson' : 'Assigned driver'}
                </dd>
                <dt className="text-muted">Vehicle</dt>
                <dd>{trip.vehicleId.toUpperCase()}</dd>
                <dt className="text-muted">Destination</dt>
                <dd>{trip.destination}</dd>
                <dt className="text-muted">ETA</dt>
                <dd>{formatTime(trip.currentEta)}</dd>
              </dl>
              <button
                onClick={() => onOpenTrip(trip.id)}
                className="mt-3 w-full rounded-full bg-brand px-3 py-2 text-xs font-bold text-white"
              >
                {COPY.openTrip}
              </button>
            </div>
          );
        })()}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-border bg-white/95 px-3 py-2 text-[11px] shadow-sm">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-green" />
          On Track
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-amber" />
          At Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-red" />
          Delayed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-gray" />
          No Signal
        </span>
      </div>
      {selected && (
        <span className="sr-only" aria-live="polite">
          Selected {selected.id}
        </span>
      )}
    </div>
  );
});
