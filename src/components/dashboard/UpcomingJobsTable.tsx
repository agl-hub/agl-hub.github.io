import { ArrowUpRight, Inbox } from 'lucide-react';

type Status = 'Open' | 'In Bay' | 'Waiting Parts' | 'Done';
type Row = { vehicle: string; customer: string; service: string; status: Status };

const statusStyles: Record<Status, string> = {
  'Open':          'bg-brand-50 text-brand-600',
  'In Bay':        'bg-amber-50 text-amber-700',
  'Waiting Parts': 'bg-neutral-100 text-neutral-700',
  'Done':          'bg-emerald-50 text-emerald-700',
};

export function UpcomingJobsTable({ rows = [] as Row[] }) {
  return (
    <section className="card-feature">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold">Upcoming Jobs</h3>
          <p className="text-sm text-neutral-500">Next bookings across all bays</p>
        </div>
        <a href="/workshop" className="btn-outline text-sm">
          Open Kanban <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full">
          <thead>
            <tr>
              <th className="t-th">Vehicle</th>
              <th className="t-th">Customer</th>
              <th className="t-th">Service</th>
              <th className="t-th text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex flex-col items-center justify-center text-center p-14 gap-3">
                    <div className="tile-red"><Inbox size={22} /></div>
                    <div className="text-base font-bold text-black">No scheduled jobs for now.</div>
                    <div className="text-sm text-neutral-500 max-w-sm">
                      Get started by creating a booking from the Kanban board.
                    </div>
                    <a href="/workshop/new" className="btn-primary mt-2">Create Booking</a>
                  </div>
                </td>
              </tr>
            ) : rows.map(r => (
              <tr key={r.vehicle + r.customer} className="hover:bg-canvas transition-colors">
                <td className="t-td font-semibold text-black">{r.vehicle}</td>
                <td className="t-td">{r.customer}</td>
                <td className="t-td">{r.service}</td>
                <td className="t-td text-right">
                  <span className={`chip ${statusStyles[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
