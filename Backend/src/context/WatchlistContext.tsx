// src/context/WatchlistContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  type WatchlistContextType = {
    tickers: string[];
    addTicker: (ticker: string) => void;
    removeTicker: (ticker: string) => void;
  };
  
  const STORAGE_KEY = "marketmind_watchlist";
  
  const WatchlistContext = createContext<WatchlistContextType | undefined>(
    undefined
  );
  
  export function WatchlistProvider({ children }: { children: React.ReactNode }) {
    const [tickers, setTickers] = useState<string[]>(() => {
      if (typeof window === "undefined") return [];
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    });
  
    useEffect(() => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
    }, [tickers]);
  
    const addTicker = (ticker: string) => {
      const t = ticker.trim().toUpperCase();
      if (!t) return;
      setTickers((prev) => (prev.includes(t) ? prev : [...prev, t]));
    };
  
    const removeTicker = (ticker: string) => {
      setTickers((prev) => prev.filter((x) => x !== ticker));
    };
  
    return (
      <WatchlistContext.Provider value={{ tickers, addTicker, removeTicker }}>
        {children}
      </WatchlistContext.Provider>
    );
  }
  
  export function useWatchlist(): WatchlistContextType {
    const ctx = useContext(WatchlistContext);
    if (!ctx) {
      throw new Error("useWatchlist must be used within a WatchlistProvider");
    }
    return ctx;
  }
  