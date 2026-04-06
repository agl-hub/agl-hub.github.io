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
import GoogleSheets from "./pages/GoogleSheets";
import Chat from "./pages/Chat";
import DataImport from "./pages/DataImport";
import PublicDashboard from "./pages/PublicDashboard";
import MechanicTracker from "./pages/MechanicTracker";
import AuditLog from "./pages/AuditLog";


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
        <Route path="/mechanics" component={MechanicTracker} />
        <Route path="/finance" component={Finances} />
        <Route path="/kanban" component={Kanban} />
        <Route path="/kpi" component={KPITracker} />
        <Route path="/clockin" component={ClockIn} />
        <Route path="/training" component={Training} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/reports" component={Reports} />
        <Route path="/creditors" component={Creditors} />
        <Route path="/sheets" component={GoogleSheets} />
        <Route path="/chat" component={Chat} />
        <Route path="/import" component={DataImport} />
        <Route path="/audit" component={AuditLog} />
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
