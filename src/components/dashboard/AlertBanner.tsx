import { AlertTriangle } from 'lucide-react';

export function AlertBanner() {
  return (
    <div className="card-feature border-l-4 !border-l-brand-500 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <span className="tile-red !w-10 !h-10 !rounded-xl"><AlertTriangle size={16} /></span>
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-brand-600">MEDIUM ALERT</div>
          <div className="font-semibold text-black mt-1">
            Facebook ads spent GHS 500.00, 0 conversions this week.
          </div>
          <div className="text-sm text-neutral-500 mt-0.5">
            Suggested action: Pause campaign and reallocate budget to WhatsApp.
          </div>
        </div>
      </div>
      <div className="flex gap-2 md:ml-4">
        <button className="btn-primary !py-2.5 !px-5 !rounded-xl text-sm">Pause Campaign</button>
        <button className="btn-outline !py-2.5 !px-5 !rounded-xl text-sm">Dismiss</button>
      </div>
    </div>
  );
}
