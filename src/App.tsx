import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ManualProfesional from "./pages/ManualProfesional";
import ManualConfirmacion from "./pages/ManualConfirmacion";
import TestResults from "./pages/TestResults";
import Calculadora from "./pages/Calculadora";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ManualProfesional />} />
          <Route path="/catalogo" element={<Index />} />
          <Route path="/test-results" element={<TestResults />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/manual-confirmacion" element={<ManualConfirmacion />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
