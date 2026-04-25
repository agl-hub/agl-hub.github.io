import { Briefcase, Users2, Clock, Award } from 'lucide-react';

export function HRPage() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black">HR & Staff</h1>
      <p className="text-neutral-500 mt-1">Technicians, attendance, and performance</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="card-feature"><Users2 size={24} className="text-brand-600"/><div className="text-2xl font-bold mt-2">12</div><div>Active technicians</div></div>
        <div className="card-feature"><Clock size={24} className="text-brand-600"/><div className="text-2xl font-bold mt-2">94%</div><div>Attendance rate (Feb)</div></div>
        <div className="card-feature"><Award size={24} className="text-brand-600"/><div className="text-2xl font-bold mt-2">8.4</div><div>Avg customer rating</div></div>
      </div>
    </div>
  );
}
