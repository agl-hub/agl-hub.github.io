import {
  CalendarPlus, UserPlus, Receipt, Users2, ClipboardList, ChevronRight,
} from 'lucide-react';

export function ActivityAndActions() {
  const acts = [
    { t: '0 jobs scheduled in the board', s: 'Workshop queue updated' },
    { t: '0 customer profiles available', s: 'CRM ready for follow-up' },
    { t: '0 active monitoring alerts',    s: 'Needs manager review' },
  ];

  const qas = [
    { icon: CalendarPlus, label: 'New Appointment', tone: 'red' as const },
    { icon: UserPlus,     label: 'Add Customer',    tone: 'ink' as const },
    { icon: Receipt,      label: 'Record Finance',  tone: 'red' as const },
    { icon: Users2,       label: 'Manage Staff',    tone: 'ink' as const },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
      <div className="card-feature">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <p className="text-sm text-neutral-500">Signals from across the operation</p>
          </div>
          <a href="/activity" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
            View all <ChevronRight size={14} />
          </a>
        </div>
        <ul className="grid gap-2">
          {acts.map(a => (
            <li key={a.t} className="flex items-start gap-3 p-3 rounded-xl hover:bg-canvas transition-colors">
              <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_0_4px_#FEE2E2]" />
              <div>
                <div className="font-semibold text-black">{a.t}</div>
                <div className="text-sm text-neutral-500 mt-0.5">{a.s}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-feature">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {qas.map(q => (
            <button key={q.label}
              className="group flex items-center gap-3 p-4 rounded-xl bg-muted border border-edge
                         hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700
                         font-semibold text-black transition-all">
              <span className={q.tone === 'red' ? 'tile-soft' : 'w-10 h-10 rounded-xl bg-black text-white grid place-items-center'}>
                <q.icon size={16} />
              </span>
              {q.label}
            </button>
          ))}
        </div>
        <a href="/workshop" className="btn-dark w-full justify-center mt-5">
          <ClipboardList size={16} /> Open Kanban
        </a>
      </div>
    </section>
  );
}
