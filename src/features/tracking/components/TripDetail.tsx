'use client';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  MessageSquare,
  RadioTower,
  UserRound,
} from 'lucide-react';
import { useTrackingData } from '../hooks/useTrackingData';
import { useTrackingStore } from '../store/trackingStore';
import type { Alert, Driver, Trip, Vehicle } from '../types';
import { COPY } from '@/src/shared/constants/copy';
import {
  formatDuration,
  formatTime,
  formatVariance,
  freshness,
} from '@/src/shared/utils/format';
import { StatusBadge, statusText } from './StatusBadge';
import { TrackingMap } from './TrackingMap';

function Summary({ trip }: { trip: Trip }) {
  const completed = trip.status === 'completed',
    offline = trip.status === 'offline';
  return (
    <section className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Trip Summary</h2>
        <StatusBadge
          status={trip.status}
          statusSince={trip.statusSince}
          compact
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 text-xs sm:grid-cols-3">
        <Value label="Planned ETA" value={formatTime(trip.plannedEta)} />
        <Value
          label={
            completed
              ? 'Actual Arrival'
              : offline
                ? 'Last calculated ETA'
                : 'Current ETA'
          }
          value={formatTime(completed ? trip.actualArrival! : trip.currentEta)}
          color={statusText[trip.status]}
        />
        <Value
          label={completed ? 'Final Variance' : 'Schedule Variance'}
          value={formatVariance(trip.etaVarianceMinutes)}
          color={statusText[trip.status]}
        />
        {trip.status === 'at_risk' && (
          <Value
            label="Projected Delay"
            value={formatVariance(trip.etaVarianceMinutes)}
            color="text-status-amber"
          />
        )}
        <Value
          label={completed ? 'Distance Traveled' : 'Distance Remaining'}
          value={`${completed ? trip.distanceTraveledMiles : trip.distanceRemainingMiles} mi`}
        />
        <Value label="Progress" value={`${Math.round(trip.progressPct)}%`} />
        <Value
          label={completed ? 'Stops Completed' : 'Stops'}
          value={`${trip.stops.filter((s) => s.completedAt).length} of ${trip.stops.length}`}
        />
      </div>
      {trip.statusReason && (
        <div
          className={`mt-4 rounded-lg p-3 text-xs ${trip.status === 'at_risk' ? 'bg-status-amber-soft text-status-amber' : trip.status === 'delayed' ? 'bg-status-red-soft text-status-red' : 'bg-status-gray-soft text-status-gray'}`}
        >
          <b>
            {trip.status === 'at_risk'
              ? 'At Risk insight'
              : trip.status === 'offline'
                ? 'Signal unavailable'
                : 'Delay details'}
          </b>
          <p className="mt-1">{trip.statusReason}</p>
        </div>
      )}
      <div className="mt-4 border-t border-border pt-4">
        <h3 className="text-xs font-bold">Performance</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Value
            label="Route Adherence"
            value={`${trip.routeAdherencePct}%`}
            color="text-status-green"
          />
          <Value
            label={completed ? 'Final Schedule Variance' : 'ETA Variance'}
            value={formatVariance(trip.etaVarianceMinutes)}
            color={statusText[trip.status]}
          />
          <Value
            label={completed ? 'Resolved Exceptions' : 'Exceptions'}
            value={
              completed
                ? '2 resolved'
                : trip.status === 'on_track'
                  ? '0'
                  : '1 active'
            }
          />
        </div>
      </div>
    </section>
  );
}
function Value({
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
      <span className="block text-[11px] text-muted">{label}</span>
      <b className={`mt-1 block text-sm ${color}`}>{value}</b>
    </div>
  );
}

function Progress({ trip }: { trip: Trip }) {
  return (
    <section className="rounded-xl border border-border bg-white p-4">
      <h2 className="text-sm font-bold">
        Route Progress
        {trip.status === 'offline' ? ' (Last Known Position)' : ''}
      </h2>
      <div className="mt-6 flex items-start">
        {trip.stops.map((stop, index) => {
          const done = Boolean(stop.completedAt) || trip.status === 'completed';
          const current = stop.id === trip.nextStopId;
          return (
            <div
              key={stop.id}
              className="relative flex flex-1 flex-col items-center text-center before:absolute before:left-0 before:right-0 before:top-3 before:h-0.5 before:bg-slate-300 first:before:left-1/2 last:before:right-1/2"
            >
              <span
                className={`relative z-10 grid size-6 place-items-center rounded-full border-2 text-[10px] ${done ? 'border-status-green bg-status-green text-white' : current && trip.status === 'at_risk' ? 'border-status-amber bg-status-amber text-white' : current && trip.status === 'delayed' ? 'border-status-red bg-status-red text-white' : current && trip.status === 'offline' ? 'border-status-gray bg-white text-status-gray ring-4 ring-status-gray/20' : 'border-slate-400 bg-white text-slate-500'}`}
              >
                {done ? <Check className="size-3" /> : index + 1}
              </span>
              <b className="mt-2 text-[10px]">
                {current && trip.status === 'offline'
                  ? COPY.lastKnownPosition
                  : stop.name}
              </b>
              <span className="mt-1 text-[10px] text-muted">
                {stop.address}
              </span>
              <span className="text-[10px] text-muted">
                {formatTime(stop.completedAt ?? stop.plannedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Investigation({
  trip,
  alerts,
  driver,
  vehicle,
}: {
  trip: Trip;
  alerts: Alert[];
  driver?: Driver;
  vehicle?: Vehicle;
}) {
  const completed = trip.status === 'completed';
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card
        title={
          completed
            ? 'Resolved Exceptions'
            : `Active Exceptions (${alerts.length})`
        }
      >
        {alerts.length ? (
          alerts.map((a) => (
            <div key={a.id} className="mb-4 flex gap-3">
              <span
                className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ${completed ? 'bg-status-green-soft text-status-green' : a.severity === 'high' ? 'bg-status-red-soft text-status-red' : 'bg-status-amber-soft text-status-amber'}`}
              >
                {completed ? (
                  <Check className="size-3" />
                ) : (
                  <AlertCircle className="size-3" />
                )}
              </span>
              <div className="text-xs">
                <b>{a.type.replaceAll('_', ' ')}</b>
                <p className="mt-1 text-muted">{a.message}</p>
                <span className="mt-1 block">
                  Duration: {formatDuration(a.durationMinutes)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-lg bg-status-green-soft p-3 text-xs text-status-green">
            <Check className="size-5" />
            <b>{COPY.noExceptions}</b>
          </div>
        )}
      </Card>
      <Card title="Recent Events">
        {trip.stops
          .slice()
          .reverse()
          .map((stop) => (
            <div
              key={stop.id}
              className="mb-3 grid grid-cols-[55px_1fr] gap-2 text-xs"
            >
              <span className="text-muted">
                {formatTime(stop.completedAt ?? stop.plannedAt)}
              </span>
              <span>
                <b>{stop.completedAt ? 'Completed stop' : 'Upcoming stop'}</b>
                <small className="block text-muted">{stop.name}</small>
              </span>
            </div>
          ))}
      </Card>
      <Card
        title={trip.status === 'offline' ? 'Telemetry (Stale)' : 'Telemetry'}
      >
        <dl className="grid grid-cols-2 gap-y-3 text-xs">
          <dt className="text-muted">Speed</dt>
          <dd className="text-right font-bold">
            {trip.speedKph === null
              ? '—'
              : `${Math.round(trip.speedKph * 0.621)} mph`}
          </dd>
          <dt className="text-muted">Heading</dt>
          <dd className="text-right font-bold">
            {trip.heading === null ? '—' : `${trip.heading}°`}
          </dd>
          <dt className="text-muted">Last update</dt>
          <dd className="text-right font-bold">
            {freshness(trip.lastGpsAt).replace('Updated ', '')}
          </dd>
          <dt className="text-muted">Signal</dt>
          <dd className="text-right font-bold">
            {trip.status === 'offline' ? 'Unavailable' : 'Good'}
          </dd>
          <dt className="text-muted">Reefer temp</dt>
          <dd className="text-right font-bold">2.6 °C</dd>
        </dl>
      </Card>
      <Card title="Driver / Vehicle">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-charcoal text-white">
            <UserRound className="size-5" />
          </span>
          <div className="text-xs">
            <b>{driver?.name}</b>
            <span className="block text-info">{driver?.phone}</span>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-muted">Plate / Unit</dt>
          <dd className="text-right">{vehicle?.plateNumber}</dd>
          <dt className="text-muted">Vehicle Type</dt>
          <dd className="text-right">{vehicle?.type}</dd>
          <dt className="text-muted">Trailer</dt>
          <dd className="text-right">{vehicle?.trailer}</dd>
        </dl>
      </Card>
      <Card title="Order / Shipment">
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-muted">Order ID</dt>
          <dd className="text-right">{trip.orderId}</dd>
          <dt className="text-muted">Commodity</dt>
          <dd className="text-right">Frozen Goods</dd>
          <dt className="text-muted">Pickup</dt>
          <dd className="text-right">{trip.origin}</dd>
          <dt className="text-muted">Delivery</dt>
          <dd className="text-right">{trip.destination}</dd>
          <dt className="text-muted">Delivery Window</dt>
          <dd className="text-right">
            {formatTime(trip.destinationWindow.start)}–
            {formatTime(trip.destinationWindow.end)}
          </dd>
        </dl>
      </Card>
      <Card title="Documents">
        {trip.documents.map((doc) => (
          <div key={doc.id} className="mb-3 flex gap-2 text-xs">
            <FileText className="size-4 text-muted" />
            <span>
              <b>{doc.name}</b>
              <small className="block text-muted">{doc.filename}</small>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-48 rounded-xl border border-border bg-white p-4">
      <h2 className="mb-4 text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function TripDetail() {
  const selected = useTrackingStore((s) => s.selectedTripId);
  const back = useTrackingStore((s) => s.backToTower);
  const fullscreen = useTrackingStore((s) => s.fullscreen);
  const setFullscreen = useTrackingStore((s) => s.setFullscreen);
  const select = useTrackingStore((s) => s.selectTrip);
  const hover = useTrackingStore((s) => s.setHoveredTrip);
  const open = useTrackingStore((s) => s.openTrip);
  const { data, isLoading, isError, refetch } = useTrackingData();
  if (isLoading)
    return (
      <div className="grid h-[calc(100vh-72px)] place-items-center">
        <LoaderCircle className="size-9 animate-spin text-brand" />
      </div>
    );
  if (isError)
    return (
      <SystemState
        icon={<AlertCircle />}
        title={COPY.unableTrip}
        body="We encountered an error while retrieving the trip information."
        action="Retry"
        onAction={() => refetch()}
      />
    );
  if (!data)
    return (
      <SystemState
        icon={<FileText />}
        title={COPY.tripNotFound}
        body="The trip may have been deleted, completed, or you may not have access to it."
        action={COPY.back}
        onAction={back}
      />
    );
  const trip = data.trips.find((t) => t.id === selected);
  if (!trip)
    return (
      <SystemState
        icon={<FileText />}
        title={COPY.tripNotFound}
        body="The trip may have been deleted, completed, or you may not have access to it."
        action={COPY.back}
        onAction={back}
      />
    );
  const alerts = data.alerts.filter((a) => a.tripId === trip.id);
  const driver = data.drivers.find((d) => d.id === trip.driverId);
  const vehicle = data.vehicles.find((v) => v.id === trip.vehicleId);
  if (fullscreen)
    return (
      <div className="grid h-screen grid-rows-[74px_1fr_180px] bg-app">
        <header className="flex items-center gap-4 border-b border-border bg-white px-4">
          <button
            onClick={() => setFullscreen(false)}
            className="rounded-full bg-charcoal px-4 py-2 text-xs font-bold text-white"
          >
            × Exit Fullscreen
          </button>
          <div>
            <div className="flex items-center gap-2">
              <b>{trip.id}</b>
              <StatusBadge
                status={trip.status}
                statusSince={trip.statusSince}
              />
            </div>
            <span className="text-xs text-muted">
              {trip.origin} → {trip.destination} · {driver?.name} ·{' '}
              {vehicle?.plateNumber}
            </span>
          </div>
          <div className="ml-auto hidden grid-cols-3 gap-8 md:grid">
            <Value label="Planned ETA" value={formatTime(trip.plannedEta)} />
            <Value
              label={
                trip.status === 'offline'
                  ? 'Last calculated ETA'
                  : 'Current ETA'
              }
              value={formatTime(trip.currentEta)}
            />
            <Value
              label="Variance"
              value={formatVariance(trip.etaVarianceMinutes)}
              color={statusText[trip.status]}
            />
          </div>
        </header>
        <TrackingMap
          trips={[trip]}
          selectedTripId={trip.id}
          hoveredTripId={null}
          onSelect={select}
          onHover={hover}
          onOpenTrip={open}
          fullscreen
          onFullscreen={() => setFullscreen(false)}
        />
        <div className="grid grid-cols-[2fr_1fr_1fr] border-t border-border bg-white">
          <div className="p-4">
            <Progress trip={trip} />
          </div>
          <div className="border-l border-border p-4 text-xs">
            <b>Next Stop</b>
            <p className="mt-3 font-semibold">
              {trip.stops.find((s) => s.id === trip.nextStopId)?.name ??
                'Trip completed'}
            </p>
            <span className="text-muted">
              ETA {formatTime(trip.currentEta)}
            </span>
          </div>
          <div className="border-l border-border p-4 text-xs">
            <b>Active Exceptions ({alerts.length})</b>
            {alerts.map((a) => (
              <p key={a.id} className="mt-3 text-status-red">
                ● {a.type.replaceAll('_', ' ')}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  return (
    <div className="space-y-3 p-3 lg:p-5">
      <header className="rounded-xl border border-border bg-white p-4">
        <button
          onClick={back}
          className="mb-4 flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          {COPY.back}
        </button>
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{trip.id}</h1>
              <StatusBadge
                status={trip.status}
                statusSince={trip.statusSince}
              />
            </div>
            <p className="mt-2 text-sm font-semibold">
              {trip.origin} → {trip.destination}
            </p>
            <p className="mt-1 text-xs text-muted">
              Tenant: NordFreight Logistics · Order: {trip.orderId} · Service
              Level: Standard
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-full border border-brand px-3 py-2 text-xs font-bold text-brand">
              <MessageSquare className="mr-1 inline size-4" />
              {COPY.messageDriver}
            </button>
            <button className="rounded-full border border-border px-3 py-2 text-xs font-bold">
              <FileText className="mr-1 inline size-4" />
              {COPY.viewOrder}
            </button>
            <button className="rounded-full border border-border px-3 py-2 text-xs font-bold">
              {COPY.more}
              <ChevronDown className="ml-1 inline size-4" />
            </button>
          </div>
        </div>
      </header>
      <section className="grid min-h-[340px] gap-3 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,.9fr)]">
        <div className="relative min-h-[340px] overflow-hidden rounded-xl border border-border">
          <TrackingMap
            trips={[trip]}
            selectedTripId={trip.id}
            hoveredTripId={null}
            onSelect={select}
            onHover={hover}
            onOpenTrip={open}
            fullscreen={false}
            onFullscreen={() => setFullscreen(true)}
          />
          {trip.status === 'offline' && (
            <div className="absolute bottom-0 inset-x-0 z-20 flex items-center gap-2 bg-white/95 p-3 text-xs text-status-gray">
              <RadioTower className="size-4" />
              {COPY.staleLocation}
            </div>
          )}
        </div>
        <Summary trip={trip} />
      </section>
      <Progress trip={trip} />
      <Investigation
        trip={trip}
        alerts={alerts}
        driver={driver}
        vehicle={vehicle}
      />
      <footer className="flex justify-between px-3 pb-3 text-[11px] text-muted">
        <span>All times shown in Central Time (CT)</span>
        <span>
          {trip.status === 'completed'
            ? 'Trip completed successfully.'
            : `Last updated ${freshness(trip.lastGpsAt).toLowerCase()}`}
        </span>
      </footer>
    </div>
  );
}

function SystemState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="grid h-[calc(100vh-72px)] place-items-center p-6">
      <div className="max-w-lg text-center">
        <span className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-status-red-soft text-status-red [&>svg]:size-9">
          {icon}
        </span>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <button
          onClick={onAction}
          className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-bold text-white"
        >
          {action}
        </button>
      </div>
    </div>
  );
}
