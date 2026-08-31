import { Check, CircleAlert, RadioTower, Truck } from 'lucide-react';
import { STATUS_LABELS } from '@/src/shared/constants/copy';
import { formatDuration, minutesSince } from '@/src/shared/utils/format';
import type { TripStatus } from '../types';

const styles: Record<TripStatus,string> = {
  on_track:'bg-status-green-soft text-status-green', at_risk:'bg-status-amber-soft text-status-amber', delayed:'bg-status-red-soft text-status-red',
  offline:'bg-status-gray-soft text-status-gray', completed:'bg-status-green-soft text-status-green',
};
const icons = {on_track:Truck,at_risk:CircleAlert,delayed:CircleAlert,offline:RadioTower,completed:Check};

export function StatusBadge({status,statusSince,compact=false}:{status:TripStatus;statusSince:string|null;compact?:boolean}) {
  const Icon = icons[status];
  const showDuration = statusSince && !['on_track','completed'].includes(status);
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold tracking-wide ${compact?'text-[10px]':'text-xs'} ${styles[status]}`}>
    <Icon className="size-3" aria-hidden="true" />
    <span>{STATUS_LABELS[status]}{showDuration ? ` • ${formatDuration(minutesSince(statusSince))}` : ''}</span>
  </span>;
}

export const statusText = {
  on_track:'text-status-green',at_risk:'text-status-amber',delayed:'text-status-red',offline:'text-status-gray',completed:'text-status-green',
} satisfies Record<TripStatus,string>;
