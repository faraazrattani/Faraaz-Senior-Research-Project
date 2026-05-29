import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { TickerPage } from "@/pages/TickerPage";
import { BacktestPage } from "@/pages/BacktestPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { MethodsPage } from "@/pages/MethodsPage";
import { AddonsFab } from "@/addons/AddonsFab";
import { WatchlistProvider } from "@/context/WatchlistContext";

const queryClient = new QueryClient();

type Page = 'home' | 'ticker' | 'backtest' | 'portfolio' | 'methods';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedTicker, setSelectedTicker] = useState<string>('');

  const handleTickerSelect = (symbol: string) => {
    setSelectedTicker(symbol);
    setCurrentPage('ticker');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleSearch = (query: string) => {
    handleTickerSelect(query);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onTickerSelect={handleTickerSelect} onNavigate={handleNavigate} />;
      case 'ticker':
        return <TickerPage symbol={selectedTicker} onBack={() => setCurrentPage('home')} />;
      case 'backtest':
        return <BacktestPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'methods':
        return <MethodsPage />;
      default:
        return <HomePage onTickerSelect={handleTickerSelect} onNavigate={handleNavigate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* Wrap all UI in the watchlist provider */}
        <WatchlistProvider>
          <div className="min-h-screen bg-background">
            <Header onSearch={handleSearch} onNavigate={handleNavigate} />
            {renderPage()}
            <AddonsFab />
          </div>
        </WatchlistProvider>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
