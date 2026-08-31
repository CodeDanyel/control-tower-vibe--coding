'use client';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Filter,
  LoaderCircle,
  MapPin,
  MessageSquare,
  RadioTower,
  Search,
  SlidersHorizontal,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTrackingData } from '../hooks/useTrackingData';
import { useTrackingStore } from '../store/trackingStore';
import type {
  Alert,
  Driver,
  TrackingMetrics,
  Trip,
  TripStatus,
  Vehicle,
} from '../types';
import { COPY } from '@/src/shared/constants/copy';
import {
  formatDuration,
  formatTime,
  formatVariance,
  freshness,
} from '@/src/shared/utils/format';
import { StatusBadge, statusText } from './StatusBadge';
import { TrackingMap } from './TrackingMap';

const statusIcon = {
  on_track: Truck,
  at_risk: CircleAlert,
  delayed: AlertCircle,
  offline: RadioTower,
  completed: Truck,
};
const edge = {
  on_track: 'border-l-status-green',
  at_risk: 'border-l-status-amber',
  delayed: 'border-l-status-red',
  offline: 'border-l-status-gray',
  completed: 'border-l-status-green',
};

function Kpis({ metrics }: { metrics: TrackingMetrics }) {
  const cards = [
    ['Total In-Transit Trips', metrics.total, 'Across 8 tenants', 'text-info'],
    ['On Track', metrics.onTrack, '70.6%', 'text-status-green'],
    ['At Risk', metrics.atRisk, '16.7%', 'text-status-amber'],
    ['Delayed', metrics.delayed, '9.5%', 'text-status-red'],
    [
      'Exceptions',
      metrics.exceptions,
      '6 requiring attention',
      'text-status-red',
    ],
    [
      'Avg. On-Time Performance',
      `${metrics.onTimePerformance}%`,
      'This week',
      'text-info',
    ],
  ];
  return (
    <section
      className="grid grid-flow-col auto-cols-[170px] gap-2 overflow-x-auto pb-1 xl:grid-flow-row xl:grid-cols-6"
      aria-label="Current tenant operational metrics"
    >
      {cards.map(([label, value, note, color]) => (
        <article
          key={label}
          className="min-h-[88px] rounded-xl border border-border bg-white p-3"
        >
          <p className="text-xs font-semibold">{label}</p>
          <strong className="mt-1 block text-2xl">{value}</strong>
          <span className={`text-[11px] ${color}`}>{note}</span>
        </article>
      ))}
    </section>
  );
}

function TripList({
  trips,
  drivers,
  vehicles,
  total,
}: {
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
  total: number;
}) {
  const selected = useTrackingStore((s) => s.selectedTripId);
  const hovered = useTrackingStore((s) => s.hoveredTripId);
  const select = useTrackingStore((s) => s.selectTrip);
  const setHover = useTrackingStore((s) => s.setHoveredTrip);
  const filters = useTrackingStore((s) => s.filters);
  const setFilters = useTrackingStore((s) => s.setFilters);
  const [scrollTop, setScrollTop] = useState(0);
  const rowH = 98;
  const viewport = 390;
  const start = Math.max(0, Math.floor(scrollTop / rowH) - 2);
  const visible = trips.slice(start, start + Math.ceil(viewport / rowH) + 4);
  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-white">
      <div className="flex h-11 items-center justify-between px-3 text-sm font-bold">
        Live Trips (
        {filters.query || filters.statuses.length
          ? `${trips.length} matching`
          : total}
        ) <ChevronDown className="size-4" />
      </div>
      <div className="flex border-b border-border px-2 text-[11px]">
        {(
          [
            ['All', null],
            ['On Track', 'on_track'],
            ['At Risk', 'at_risk'],
            ['Delayed', 'delayed'],
          ] as const
        ).map(([label, status]) => (
          <button
            key={label}
            onClick={() => setFilters({ statuses: status ? [status] : [] })}
            className={`flex-1 border-b-2 px-1 py-2 ${(!status && !filters.statuses.length) || filters.statuses.includes(status as TripStatus) ? 'border-info font-bold text-info' : 'border-transparent'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="m-2 flex h-9 items-center gap-2 rounded-lg border border-border px-2">
        <Search className="size-4 text-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Search trips, driver, order…"
        />
        <SlidersHorizontal className="size-4" />
      </label>
      {!trips.length ? (
        <div className="grid flex-1 place-items-center p-6 text-center">
          <div>
            <Search className="mx-auto mb-3 size-8 text-muted" />
            <strong>{COPY.noTripsFiltered}</strong>
            <p className="mt-1 text-xs text-muted">
              Try adjusting or clearing the current filters.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="relative overflow-auto"
          style={{ height: viewport }}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
          <div style={{ height: trips.length * rowH }}>
            <div style={{ transform: `translateY(${start * rowH}px)` }}>
              {visible.map((trip) => {
                const Icon = statusIcon[trip.status],
                  driver = drivers.find((d) => d.id === trip.driverId),
                  vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                return (
                  <button
                    key={trip.id}
                    onClick={() => select(trip.id)}
                    onMouseEnter={() => setHover(trip.id)}
                    onMouseLeave={() => setHover(null)}
                    className={`flex h-[98px] w-full gap-2 border-b border-l-[3px] border-border p-2 text-left transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-brand ${edge[trip.status]} ${selected === trip.id ? 'bg-brand/5' : hovered === trip.id ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    <span
                      className={`mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 ${statusText[trip.status]}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <b className="text-xs">{trip.id}</b>
                        <StatusBadge
                          status={trip.status}
                          statusSince={trip.statusSince}
                          compact
                        />
                      </span>
                      <span className="mt-1 block truncate text-[11px]">
                        {trip.origin} → {trip.destination}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        Driver: {driver?.name} · {vehicle?.plateNumber}
                      </span>
                      <span className="mt-0.5 flex gap-2 text-[11px]">
                        <b>ETA {formatTime(trip.currentEta)}</b>
                        <em className={`not-italic ${statusText[trip.status]}`}>
                          {trip.status === 'at_risk' ? 'Projected ' : ''}
                          {formatVariance(trip.etaVarianceMinutes)}
                        </em>
                      </span>
                    </span>
                    <ChevronRight className="mt-8 size-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <button className="h-9 text-xs font-semibold text-info">
        View all trips
      </button>
    </aside>
  );
}

function Drawer({
  trip,
  driver,
  vehicle,
}: {
  trip: Trip;
  driver?: Driver;
  vehicle?: Vehicle;
}) {
  const close = useTrackingStore((s) => s.setDrawerOpen);
  const open = useTrackingStore((s) => s.openTrip);
  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex w-[330px] flex-col border-l border-border bg-white shadow-xl xl:static xl:shadow-none">
      <button
        onClick={() => close(false)}
        className="absolute right-3 top-3 rounded p-1 focus-visible:outline-2 focus-visible:outline-brand"
        aria-label="Close selected trip"
      >
        <X className="size-4" />
      </button>
      <div className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">{trip.id}</h2>
          <StatusBadge
            status={trip.status}
            statusSince={trip.statusSince}
            compact
          />
        </div>
        <b className="block text-xs">
          {trip.origin} → {trip.destination}
        </b>
        <span className="block text-xs text-muted">Order: {trip.orderId}</span>
      </div>
      <div className="flex h-10 gap-5 border-b border-border px-4 text-xs">
        <button className="border-b-2 border-brand font-bold text-brand">
          Overview
        </button>
        <button>Timeline</button>
        <button>Stops</button>
        <button>Details</button>
      </div>
      <div className="grid grid-cols-3 gap-2 border-b border-border p-4">
        <Metric
          label={
            trip.status === 'offline' ? 'Last calculated ETA' : 'Current ETA'
          }
          value={formatTime(trip.currentEta)}
          color={statusText[trip.status]}
        />
        <Metric
          label="Distance Remaining"
          value={`${trip.distanceRemainingMiles} mi`}
        />
        <Metric label="Progress" value={`${Math.round(trip.progressPct)}%`} />
        <div className="col-span-3 h-1.5 rounded bg-slate-200">
          <div
            className={`h-full rounded ${trip.status === 'delayed' ? 'bg-status-red' : trip.status === 'at_risk' ? 'bg-status-amber' : trip.status === 'offline' ? 'bg-status-gray' : 'bg-status-green'}`}
            style={{ width: `${trip.progressPct}%` }}
          />
        </div>
      </div>
      <div className="border-b border-border p-4">
        <span className="text-[11px] text-muted">
          {trip.status === 'offline'
            ? COPY.lastKnownPosition
            : 'Current Location'}
        </span>
        <b className="mt-1 block text-xs">{trip.currentLocation}</b>
        <span className="mt-1 flex justify-between text-[11px] text-muted">
          <span>{freshness(trip.lastGpsAt)}</span>
          <b>
            {trip.speedKph === null
              ? '—'
              : `${Math.round(trip.speedKph * 0.621)} mph`}
          </b>
        </span>
        {trip.status === 'offline' && (
          <p className="mt-2 rounded-lg bg-status-gray-soft p-2 text-[11px] text-status-gray">
            {COPY.staleLocation}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 border-b border-border p-4 text-xs">
        <div>
          <UserRound className="mb-1 size-4" />
          <small className="block text-muted">Driver</small>
          <b>{driver?.name}</b>
          <span className="block text-info">{driver?.phone}</span>
        </div>
        <div>
          <Truck className="mb-1 size-4" />
          <small className="block text-muted">Vehicle</small>
          <b>{vehicle?.plateNumber}</b>
          <span className="block text-muted">Trailer {vehicle?.trailer}</span>
        </div>
      </div>
      <div className="p-4 text-xs">
        <MapPin className="mb-1 size-4" />
        <small className="block text-muted">Next Stop</small>
        <b>
          {trip.stops.find((s) => s.id === trip.nextStopId)?.name ??
            'Trip completed'}
        </b>
        <span className="mt-1 block text-muted">
          Appointment {formatTime(trip.destinationWindow.start)}–
          {formatTime(trip.destinationWindow.end)}
        </span>
      </div>
      <div className="mt-auto flex gap-2 p-3">
        <button className="flex-1 rounded-full border border-brand px-3 py-2 text-xs font-bold text-brand">
          <MessageSquare className="mr-1 inline size-4" />
          {COPY.messageDriver}
        </button>
        <button
          onClick={() => open(trip.id)}
          className="flex-1 rounded-full bg-brand px-3 py-2 text-xs font-bold text-white"
        >
          {COPY.openTrip}
        </button>
      </div>
    </aside>
  );
}
function Metric({
  label,
  value,
  color = '',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <small className="block text-[10px] text-muted">{label}</small>
      <b className={`mt-1 block text-sm ${color}`}>{value}</b>
    </div>
  );
}

function Exceptions({
  alerts,
  trips,
  drivers,
  vehicles,
}: {
  alerts: Alert[];
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
}) {
  const selected = useTrackingStore((s) => s.selectedTripId);
  const select = useTrackingStore((s) => s.selectTrip);
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex h-10 items-center justify-between px-4 text-sm">
        <b>Active Exceptions ({alerts.length})</b>
        <button className="text-xs font-semibold text-info">
          View all exceptions
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-[11px]">
          <thead className="border-y border-border bg-slate-50 text-muted">
            <tr>
              {[
                'Trip ID',
                'Type',
                'Severity',
                'Description',
                'Location',
                'Detected At',
                'Duration',
                'Driver',
                'Vehicle',
                'ETA Impact',
              ].map((x) => (
                <th key={x} className="px-3 py-2 font-semibold">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => {
              const trip = trips.find((t) => t.id === alert.tripId),
                driver = drivers.find((d) => d.id === trip?.driverId),
                vehicle = vehicles.find((v) => v.id === trip?.vehicleId);
              return (
                <tr
                  key={alert.id}
                  onClick={() => select(alert.tripId)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      select(alert.tripId);
                  }}
                  className={`cursor-pointer border-b border-border focus-visible:outline-2 focus-visible:outline-brand ${selected === alert.tripId ? 'bg-brand/5' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-3 py-2 font-bold">
                    <span
                      className={`mr-2 inline-block size-1.5 rounded-full ${alert.severity === 'high' ? 'bg-status-red' : 'bg-status-amber'}`}
                    />
                    {alert.tripId}
                  </td>
                  <td className="px-3">{alert.type.replaceAll('_', ' ')}</td>
                  <td className="px-3">
                    <span
                      className={`rounded-full px-2 py-1 font-bold ${alert.severity === 'high' ? 'bg-status-red-soft text-status-red' : 'bg-status-amber-soft text-status-amber'}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-3">{alert.message}</td>
                  <td className="px-3">{alert.location}</td>
                  <td className="px-3">{formatTime(alert.raisedAt)}</td>
                  <td className="px-3">
                    {formatDuration(alert.durationMinutes)}
                  </td>
                  <td className="px-3">{driver?.name}</td>
                  <td className="px-3">{vehicle?.plateNumber}</td>
                  <td className="px-3 font-bold text-status-red">
                    {alert.etaImpactMinutes
                      ? formatVariance(alert.etaImpactMinutes)
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Filters() {
  const open = useTrackingStore((s) => s.filtersOpen);
  const setOpen = useTrackingStore((s) => s.setFiltersOpen);
  const filters = useTrackingStore((s) => s.filters);
  const set = useTrackingStore((s) => s.setFilters);
  const clear = useTrackingStore((s) => s.clearFilters);
  if (!open) return null;
  return (
    <aside className="absolute inset-y-0 right-0 z-30 w-72 border-l border-border bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <b>Filters</b>
        <button onClick={() => setOpen(false)} aria-label="Close filters">
          <X />
        </button>
      </div>
      <button onClick={clear} className="mt-1 text-xs text-info">
        Clear all
      </button>
      <fieldset className="mt-5 space-y-3">
        <legend className="mb-2 text-xs font-bold">Status</legend>
        {(['on_track', 'at_risk', 'delayed', 'offline'] as TripStatus[]).map(
          (status) => (
            <label key={status} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={(e) =>
                  set({
                    statuses: e.target.checked
                      ? [...filters.statuses, status]
                      : filters.statuses.filter((x) => x !== status),
                  })
                }
              />
              {status.replace('_', ' ')}
            </label>
          ),
        )}
      </fieldset>
      <label className="mt-5 block text-xs font-bold">
        Origin / Destination
        <input
          className="mt-2 w-full rounded-lg border border-border p-2 font-normal"
          value={filters.originDestination}
          onChange={(e) => set({ originDestination: e.target.value })}
        />
      </label>
      <label className="mt-5 block text-xs font-bold">
        Driver / Vehicle
        <input
          className="mt-2 w-full rounded-lg border border-border p-2 font-normal"
          value={filters.driverVehicle}
          onChange={(e) => set({ driverVehicle: e.target.value })}
        />
      </label>
      <label className="mt-5 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.exceptionOnly}
          onChange={(e) => set({ exceptionOnly: e.target.checked })}
        />
        Trips with active exceptions
      </label>
      <button
        onClick={() => setOpen(false)}
        className="mt-8 w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white"
      >
        Apply
      </button>
    </aside>
  );
}

export function ControlTower() {
  const { data, isLoading, isError, refetch } = useTrackingData();
  const selectedId = useTrackingStore((s) => s.selectedTripId);
  const hovered = useTrackingStore((s) => s.hoveredTripId);
  const filters = useTrackingStore((s) => s.filters);
  const drawer = useTrackingStore((s) => s.drawerOpen);
  const fullscreen = useTrackingStore((s) => s.fullscreen);
  const select = useTrackingStore((s) => s.selectTrip);
  const hover = useTrackingStore((s) => s.setHoveredTrip);
  const setFullscreen = useTrackingStore((s) => s.setFullscreen);
  const setFiltersOpen = useTrackingStore((s) => s.setFiltersOpen);
  const openTrip = useTrackingStore((s) => s.openTrip);
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = filters.query.toLowerCase();
    const alertIds = new Set(data.alerts.map((a) => a.tripId));
    return data.trips.filter(
      (t) =>
        (!q ||
          `${t.id} ${t.origin} ${t.destination} ${data.drivers.find((d) => d.id === t.driverId)?.name}`
            .toLowerCase()
            .includes(q)) &&
        (!filters.statuses.length || filters.statuses.includes(t.status)) &&
        (!filters.originDestination ||
          `${t.origin} ${t.destination}`
            .toLowerCase()
            .includes(filters.originDestination.toLowerCase())) &&
        (!filters.driverVehicle ||
          `${data.drivers.find((d) => d.id === t.driverId)?.name} ${data.vehicles.find((v) => v.id === t.vehicleId)?.plateNumber}`
            .toLowerCase()
            .includes(filters.driverVehicle.toLowerCase())) &&
        (!filters.exceptionOnly || alertIds.has(t.id)),
    );
  }, [data, filters]);
  if (isLoading)
    return (
      <div className="grid h-[calc(100vh-72px)] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-3 size-8 animate-spin text-brand" />
          <p>{COPY.loadingMap}</p>
        </div>
      </div>
    );
  if (isError || !data)
    return (
      <div className="grid h-[calc(100vh-72px)] place-items-center">
        <div className="rounded-xl border border-status-red/30 bg-white p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-status-red" />
          <b>{COPY.unableOverview}</b>
          <button
            onClick={() => refetch()}
            className="mt-4 block w-full rounded-full bg-brand py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  const selected = data.trips.find((t) => t.id === selectedId);
  const alerts = data.alerts.filter((a) =>
    filtered.some((t) => t.id === a.tripId),
  );
  return (
    <div className={fullscreen ? 'h-screen p-0' : 'space-y-3 p-3 lg:p-4'}>
      {!fullscreen && <Kpis metrics={data.metrics} />}
      <section
        className={`relative overflow-hidden border border-border bg-white ${fullscreen ? 'h-screen rounded-none' : 'h-[545px] rounded-xl'}`}
      >
        <div
          className={`grid size-full ${fullscreen ? 'grid-cols-[285px_1fr]' : 'grid-cols-[285px_1fr] xl:grid-cols-[285px_1fr_330px]'}`}
        >
          <TripList
            trips={filtered}
            drivers={data.drivers}
            vehicles={data.vehicles}
            total={data.metrics.total}
          />
          <div className="relative">
            <div className="absolute left-3 top-3 z-10 flex gap-2">
              <span className="rounded-lg border border-border bg-white px-3 py-2 text-[11px]">
                <i className="mr-1.5 inline-block size-2 rounded-full bg-status-green" />
                Live updates
              </span>
              <button
                onClick={() => setFiltersOpen(true)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-[11px]"
              >
                <Filter className="mr-1 inline size-4" />
                Filters
              </button>
            </div>
            <TrackingMap
              trips={filtered}
              selectedTripId={selectedId}
              hoveredTripId={hovered}
              onSelect={select}
              onHover={hover}
              onOpenTrip={openTrip}
              fullscreen={fullscreen}
              onFullscreen={() => setFullscreen(!fullscreen)}
            />
          </div>
          {drawer && selected && (
            <Drawer
              trip={selected}
              driver={data.drivers.find((d) => d.id === selected.driverId)}
              vehicle={data.vehicles.find((v) => v.id === selected.vehicleId)}
            />
          )}
        </div>
        <Filters />
      </section>
      {!fullscreen && (
        <Exceptions
          alerts={alerts}
          trips={data.trips}
          drivers={data.drivers}
          vehicles={data.vehicles}
        />
      )}
    </div>
  );
}
