import { create } from 'zustand';
import type { TripStatus } from '../types';

export interface TrackingFilters {
  query: string;
  statuses: TripStatus[];
  originDestination: string;
  driverVehicle: string;
  exceptionOnly: boolean;
}
type View = 'control-tower' | 'trip-detail';
interface TrackingState {
  selectedTenantId: string;
  selectedTripId: string | null;
  hoveredTripId: string | null;
  filters: TrackingFilters;
  filtersOpen: boolean;
  drawerOpen: boolean;
  fullscreen: boolean;
  view: View;
  setTenant: (id: string) => void;
  selectTrip: (id: string, openDrawer?: boolean) => void;
  setHoveredTrip: (id: string | null) => void;
  setFilters: (filters: Partial<TrackingFilters>) => void;
  clearFilters: () => void;
  setFiltersOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  openTrip: (id: string) => void;
  backToTower: () => void;
}
const emptyFilters: TrackingFilters = {
  query: '',
  statuses: [],
  originDestination: '',
  driverVehicle: '',
  exceptionOnly: false,
};
export const useTrackingStore = create<TrackingState>((set) => ({
  selectedTenantId: 'northfreight',
  selectedTripId: 'TRP-10085',
  hoveredTripId: null,
  filters: emptyFilters,
  filtersOpen: false,
  drawerOpen: true,
  fullscreen: false,
  view: 'control-tower',
  setTenant: (id) =>
    set({ selectedTenantId: id, selectedTripId: null, drawerOpen: false }),
  selectTrip: (id, openDrawer = true) =>
    set({ selectedTripId: id, drawerOpen: openDrawer }),
  setHoveredTrip: (id) => set({ hoveredTripId: id }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: emptyFilters }),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setFullscreen: (fullscreen) => set({ fullscreen }),
  openTrip: (id) =>
    set({
      selectedTripId: id,
      view: 'trip-detail',
      fullscreen: false,
      drawerOpen: true,
    }),
  backToTower: () => set({ view: 'control-tower' }),
}));
