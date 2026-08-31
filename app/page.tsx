'use client';
import { AppProviders } from '@/src/app/providers/AppProviders';
import { AppShell } from '@/src/features/tracking/components/AppShell';
import { ControlTower } from '@/src/features/tracking/components/ControlTower';
import { TripDetail } from '@/src/features/tracking/components/TripDetail';
import { useTrackingStore } from '@/src/features/tracking/store/trackingStore';

function TrackingPortal(){const view=useTrackingStore(state=>state.view);return <AppShell>{view==='control-tower'?<ControlTower/>:<TripDetail/>}</AppShell>}
export default function Home(){return <AppProviders><TrackingPortal/></AppProviders>}
