import { CommandCenterHero } from '../components/dashboard/CommandCenterHero';
import { KpiStrip } from '../components/dashboard/KpiStrip';
import { ActivityAndActions } from '../components/dashboard/ActivityAndActions';
import { AlertBanner } from '../components/dashboard/AlertBanner';
import { UpcomingJobsTable } from '../components/dashboard/UpcomingJobsTable';

export function DashboardPage() {
  return (
    <div className="grid gap-6">
      <CommandCenterHero />
      <KpiStrip />
      <AlertBanner />
      <ActivityAndActions />
      <UpcomingJobsTable />
    </div>
  );
}
