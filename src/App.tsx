
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Account from "./pages/Account.tsx";
import Plans from "./pages/Plans.tsx";
import Language from "./pages/Language.tsx";
import Category from "./pages/Category.tsx";
import Continue from "./pages/Continue.tsx";
import MovieDetail from "./pages/MovieDetail.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { PlayerProvider } from "./context/PlayerContext.tsx";
import { CastProvider } from "./context/CastContext.tsx";
import { PortraitGate } from "./components/PortraitGate.tsx";
import { MainLayout } from "./components/MainLayout.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CastProvider>
            <PlayerProvider>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/language/:slug" element={<Language />} />
                  <Route path="/category/:categoryId" element={<Category />} />
                  <Route path="/continue" element={<Continue />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL \"*\" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <PortraitGate />
              </MainLayout>
            </PlayerProvider>
          </CastProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
