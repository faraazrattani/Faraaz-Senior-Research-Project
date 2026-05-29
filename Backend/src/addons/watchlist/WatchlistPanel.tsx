// src/addons/watchlist/WatchlistPanel.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWatchlist } from "@/context/WatchlistContext";

export function WatchlistPanel() {
  const { tickers, addTicker, removeTicker } = useWatchlist();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const value = input.trim().toUpperCase();
    if (!value) return;
    addTicker(value);
    setInput("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add ticker (e.g., AAPL)"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="button" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {/* List of watchlist tickers */}
      <Card className="p-3">
        {tickers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tickers in your watchlist yet. Add some above to pin them on the landing page.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tickers.map((symbol) => (
              <div
                key={symbol}
                className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
              >
                <span className="font-medium">{symbol}</span>
                <button
                  type="button"
                  onClick={() => removeTicker(symbol)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${symbol} from watchlist`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
