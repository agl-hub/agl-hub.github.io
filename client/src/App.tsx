import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessProvider } from "./contexts/AccessContext";
import MainLayout from "./components/MainLayout";
import NewDashboardPage from "./pages/NewDashboardPage";
import DailyEntry from "./pages/DailyEntry";
import Workshop from "./pages/Workshop";
import Sales from "./pages/Sales";
import Staff from "./pages/Staff";
import Finances from "./pages/Finances";
import Kanban from "./pages/Kanban";
import KPITracker from "./pages/KPITracker";
import ClockIn from "./pages/ClockIn";
import Training from "./pages/Training";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Creditors from "./pages/Creditors";
import ExcelImport from "./pages/GoogleSheets";
import PublicDashboard from "./pages/PublicDashboard";
import MechanicTracker from "./pages/MechanicTracker";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import ShareLinks from "./pages/ShareLinks";
import Schedules from "./pages/Schedules";
import MonthlyReport from "./pages/MonthlyReport";
import StaffClockIn from "./pages/StaffClockIn";
import ProjectBoard from "./pages/ProjectBoard";


function Router() {
  const [location] = useLocation();

  // Public dashboard renders without sidebar/main layout
  if (location.startsWith("/public")) {
    return (
      <Switch>
        <Route path="/public" component={PublicDashboard} />
        <Route path="/public/:rest*" component={PublicDashboard} />
      </Switch>
    );
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/dashboard" component={NewDashboardPage} />
        <Route path="/entry" component={DailyEntry} />
        <Route path="/workshop" component={Workshop} />
        <Route path="/sales" component={Sales} />
        <Route path="/monthly" component={MonthlyReport} />
        <Route path="/mechanics" component={MechanicTracker} />
        <Route path="/finance" component={Finances} />
        <Route path="/kanban" component={Kanban} />
        <Route path="/kpi" component={KPITracker} />
        <Route path="/clockin" component={ClockIn} />
        <Route path="/training" component={Training} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/reports" component={Reports} />
        <Route path="/creditors" component={Creditors} />
        <Route path="/import" component={ExcelImport} />
        <Route path="/audit" component={AuditLog} />
        <Route path="/settings" component={Settings} />
        <Route path="/share" component={ShareLinks} />
        <Route path="/schedules" component={Schedules} />
        <Route path="/staff" component={Staff} />
        <Route path="/staff-clockin" component={StaffClockIn} />
        <Route path="/project-board" component={ProjectBoard} />
        <Route path="/" component={NewDashboardPage} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AccessProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AccessProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
