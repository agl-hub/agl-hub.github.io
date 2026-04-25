import { Wallet, ClipboardList, Users, Repeat, TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

type Kpi = {
  label: string; value: string; caption: string;
  delta?: { dir: 'up' | 'down'; text: string };
  icon: LucideIcon;
  tone: 'red' | 'ink';
};

const kpis: Kpi[] = [
  { label: 'GROSS REVENUE',    value: 'GHS 0.00', caption: '0 payment channels',   icon: Wallet,        tone: 'red', delta: { dir: 'up',   text: '+0% WoW' } },
  { label: 'OPEN JOBS',        value: '0',        caption: 'Scheduled for action', icon: ClipboardList, tone: 'ink', delta: { dir: 'down', text: '0 vs yest.' } },
  { label: 'TOTAL CUSTOMERS',  value: '0',        caption: 'Active records',       icon: Users,         tone: 'red', delta: { dir: 'up',   text: '+0 this wk' } },
  { label: 'SUBSCRIPTION MRR', value: 'GHS 0.00', caption: '0 active subscribers', icon: Repeat,        tone: 'ink', delta: { dir: 'up',   text: '+0%' } },
];

export function KpiStrip() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {kpis.map(k => (
        <article key={k.label} className="group card-feature flex flex-col gap-3">
          <header className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.14em] text-neutral-500">{k.label}</span>
            <span className={k.tone === 'red' ? 'tile-red !w-10 !h-10 !rounded-xl' : 'tile-ink !w-10 !h-10 !rounded-xl'}>
              <k.icon size={16} />
            </span>
          </header>
          <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-black">{k.value}</div>
          <footer className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">{k.caption}</span>
            {k.delta && (
              <span className={`chip ${k.delta.dir === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-brand-50 text-brand-600'}`}>
                {k.delta.dir === 'up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                {k.delta.text}
              </span>
            )}
          </footer>
        </article>
      ))}
    </section>
  );
}
