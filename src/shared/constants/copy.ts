export const COPY = {
  appName: 'TrackMe Suite',
  controlTower: 'Control Tower',
  controlTowerSubtitle: 'Real-time visibility of in-transit trips and operations',
  openTrip: 'Open Trip',
  messageDriver: 'Message Driver',
  viewOrder: 'View Order',
  more: 'More',
  noTripsTenant: 'No active trips for this tenant',
  noTripsFiltered: 'No trips match these filters',
  noExceptions: 'No active exceptions',
  unableOverview: 'Unable to load live trip data',
  unableTrip: 'Unable to load trip details',
  tripNotFound: 'Trip not found',
  lastKnownPosition: 'Last Known Position',
  staleLocation: 'Showing last known position. This is not a live location.',
  loadingMap: 'Loading live map data…',
  back: 'Back to Control Tower',
} as const;

export const STATUS_LABELS = {
  on_track: 'ON TRACK', at_risk: 'AT RISK', delayed: 'DELAYED', offline: 'NO SIGNAL', completed: 'COMPLETED',
} as const;
