// client/src/App.tsx
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./lib/trpc";
import MainLayout from "./components/MainLayout";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import WorkshopKanban from "./pages/WorkshopKanban";
import CustomersCRM from "./pages/CustomersCRM";
import HRDashboard from "./pages/HRDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import SubscriptionsPage from "./pages/SubscriptionsPage";

const queryClient = new QueryClient();

function App() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <MainLayout>
          <Switch>
            <Route path="/" component={EnterpriseDashboard} />
            <Route path="/workshop" component={WorkshopKanban} />
            <Route path="/customers" component={CustomersCRM} />
            <Route path="/hr" component={HRDashboard} />
            <Route path="/finance" component={FinanceDashboard} />
            <Route path="/subscriptions" component={SubscriptionsPage} />
            <Route>404, Not Found!</Route>
          </Switch>
        </MainLayout>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;