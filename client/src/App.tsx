import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { useCriticalResourcePreload } from "@/hooks/use-image-preload";
import { useAuth } from "@/hooks/useAuth";

// Lazy loading dos componentes de página
const Home = lazy(() => import("@/pages/home"));
const PontosVenda = lazy(() => import("@/pages/pontos-venda"));
const GaleriaFas = lazy(() => import("@/pages/galeria-fas"));
const AdminPanel = lazy(() => import("@/pages/admin"));
const AdminGaleria = lazy(() => import("@/pages/admin-galeria"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SupabaseStatus = lazy(() => import("@/pages/supabase-status"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Landing page for logged out users
const Landing = lazy(() => import("@/pages/home"));

// Componente de loading
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cuca-yellow mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/pontos-venda" component={PontosVenda} />
        <Route path="/galeria-fas" component={GaleriaFas} />
        <Route path="/login" component={lazy(() => import("@/pages/login"))} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/admin-galeria" component={AdminGaleria} />
        <Route path="/admin/galeria" component={AdminGaleria} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/supabase" component={SupabaseStatus} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Preload recursos críticos
  useCriticalResourcePreload();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
