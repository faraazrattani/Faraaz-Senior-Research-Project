import { useState } from 'react';
import { TrendingUp, BarChart3, Target, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StockCard } from '@/components/StockCard';
import { mockStocks } from '@/data/mockData';
import SearchField from '@/components/SearchField';
import { useWatchlist } from '@/context/WatchlistContext';

interface HomePageProps {
  onTickerSelect: (symbol: string) => void;
  onNavigate: (page: string) => void;
}

export function HomePage({ onTickerSelect, onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { tickers } = useWatchlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;
    onTickerSelect(q);
    onNavigate('ticker');
  };

  const features = [
    { icon: <TrendingUp className="h-6 w-6" />, title: 'Earnings Pulse', desc: 'Surface earnings-week patterns by ticker; track average drift, gaps, and post-earnings moves.' },
    { icon: <BarChart3 className="h-6 w-6" />, title: 'Backtests', desc: 'Simulate rules around earnings (pre/post windows, thresholds, stops) and view equity curves.' },
    { icon: <Target className="h-6 w-6" />, title: 'Signals', desc: 'Model-driven Buy/Hold/Sell with probabilities; visualize precision/recall around events.' },
    { icon: <BookOpen className="h-6 w-6" />, title: 'Explainability', desc: 'Feature importances and attribution for transparency; compare across earnings cycles.' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MarketMind
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Predict stock movements around earnings week using machine learning. 
            Backtest strategies, analyze patterns, and explore explainable AI results.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search a ticker… (e.g., AAPL)"
              wrapperClassName="flex-1"
            />
            <Button type="submit">Analyze</Button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <Card key={i} className="p-5 bg-card border-border">
            <div className="flex items-center gap-3 mb-2 text-primary">
              {f.icon}
              <h3 className="font-semibold text-card-foreground">{f.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </Card>
        ))}
      </section>

      {/* Examples */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-lg font-semibold mb-3">Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockStocks.slice(0, 6).map((s) => (
            <StockCard
              key={s.symbol}
              stock={s}
              onClick={() => {
                onTickerSelect(s.symbol);
                onNavigate('ticker');
              }}
            />
          ))}
        </div>
      </section>

      {/* Watchlist Section */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-lg font-semibold mb-3">Your Watchlist</h2>

        {tickers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tickers added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tickers.map((symbol) => (
              <Card
                key={symbol}
                onClick={() => {
                  onTickerSelect(symbol);
                  onNavigate('ticker');
                }}
                className="p-4 cursor-pointer hover:shadow-md transition"
              >
                <div className="text-xl font-semibold">{symbol}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to open analysis →
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
