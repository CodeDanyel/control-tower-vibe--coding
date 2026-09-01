'use client';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  Gauge,
  HelpCircle,
  Map,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Truck,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { COPY } from '@/src/shared/constants/copy';
import { useTrackingStore } from '../store/trackingStore';

const items = [
  [Gauge, 'Control Tower'],
  [Truck, 'Trips'],
  [Map, 'Map View'],
  [AlertTriangle, 'Exceptions'],
  [Bell, 'Alerts'],
  [MapPin, 'Geofences'],
  [MessageSquare, 'Messages'],
  [FileText, 'Reports'],
  [Users, 'Drivers'],
  [Truck, 'Vehicles'],
  [FileText, 'Documents'],
  [BarChart3, 'Analytics'],
  [Settings, 'Settings'],
] as const;
export function AppShell({ children, viewOverride }: { children: ReactNode; viewOverride?: 'control-tower' | 'trip-detail' }) {
  const fullscreen = useTrackingStore((s) => s.fullscreen);
  const view = useTrackingStore((s) => s.view);
  const activeView = viewOverride ?? view;
  if (fullscreen)
    return <main className="min-h-screen bg-app">{children}</main>;
  return (
    <main className="min-h-screen bg-app text-ink lg:pl-56">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-charcoal px-3 py-5 text-white lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2 text-xl font-semibold">
          <MapPin className="size-8 fill-brand text-brand" />
          <span>
            TrackMe <b className="font-medium text-brand">Suite</b>
          </span>
        </div>
        <nav className="space-y-1" aria-label="Primary navigation">
          {items.map(([Icon, label], index) => (
            <button
              key={label}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${index === 0 ? 'bg-brand font-bold text-white' : 'text-slate-200 hover:bg-white/10'}`}
            >
              <Icon className="size-5" />
              <span>{label}</span>
              {label === 'Exceptions' && (
                <span className="ml-auto rounded-full bg-status-red px-2 py-0.5 text-xs">
                  8
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="mt-auto flex items-center gap-3 border-t border-white/15 px-3 pt-5 text-sm text-slate-200">
          ‹ <span>Collapse</span>
        </button>
      </aside>
      <section className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-border bg-white px-4 lg:px-7">
          <button className="mr-3 lg:hidden" aria-label="Open navigation">
            <Menu />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {activeView === 'control-tower' ? COPY.controlTower : 'Trip Detail'}
            </h1>
            <p className="hidden text-xs text-muted sm:block">
              {COPY.controlTowerSubtitle}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <button className="hidden min-w-64 items-center gap-3 rounded-lg border border-border px-3 py-2 text-left text-xs md:flex">
              <Truck className="size-5" />
              <span className="flex flex-1 flex-col">
                <small className="text-muted">Tenant</small>
                <b>NordFreight Logistics</b>
              </span>
              <ChevronDown className="size-4" />
            </button>
            <Search className="size-5" />
            <Bell className="size-5" />
            <HelpCircle className="hidden size-5 sm:block" />
            <span className="grid size-9 place-items-center rounded-full bg-charcoal text-xs font-bold text-white">
              PT
            </span>
            <span className="hidden flex-col text-xs xl:flex">
              <b>Patricia Togonon</b>
              <small className="text-muted">Dispatcher</small>
            </span>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
